import asyncio
import socket
from uuid import uuid4
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings

# The Supabase pooler hostname resolves to both A (IPv4) and AAAA (IPv6) records.
# The AAAA records are NAT64-synthesized (64:ff9b::/96), which some networks
# (notably macOS on networks without native IPv6 uplink) advertise as reachable
# but route through a slow or black-holed NAT64 gateway. Because asyncio's
# default connector tries getaddrinfo() results in order and waits for a full
# OS-level connect timeout before falling back, an IPv6-first result here turns
# every fresh asyncpg connection (including every pool_pre_ping-triggered
# reconnect) into a multi-second-to-tens-of-seconds stall. We force IPv4-only
# resolution for all outbound connections in this process to eliminate that
# stall, without hardcoding an IP (which would break on ELB IP rotation) and
# without needing /etc/hosts changes.
_original_getaddrinfo = socket.getaddrinfo


def _ipv4_only_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return _original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)


socket.getaddrinfo = _ipv4_only_getaddrinfo

POOL_SIZE = 20

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=POOL_SIZE,
    max_overflow=10,
    # Reconnects are now fast (IPv4-only, no NAT64 stall), but pool_pre_ping
    # still adds a synchronous round trip to the pooler on every single
    # checkout. Since pgbouncer's transaction-pooling mode already recycles
    # backend connections for us, we recycle app-level pooled connections
    # periodically instead of pinging on every checkout. The interval is
    # deliberately long: [TIMING] instrumentation on /api/auth/login showed
    # that establishing a brand-new connection to the pooler costs ~12-14s on
    # this network, so recycling too often just re-triggers that cost on
    # whichever request lands right after a recycle.
    pool_pre_ping=False,
    pool_recycle=1800,
    # Supabase's connection pooler runs pgbouncer in transaction-pooling mode, which
    # routes different sessions to the same backend connection. asyncpg's default
    # sequential prepared-statement names ("__asyncpg_stmt_1__", ...) then collide
    # across sessions; using unique names per prepare avoids that collision.
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid4()}__",
    },
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """Dependency that yields an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def warm_pool() -> None:
    """Eagerly open the full connection pool at startup.

    SQLAlchemy's pool is lazy by default: connections are only established on
    first checkout. On this network, establishing a fresh connection to the
    pooler costs ~12-14s (see [TIMING] logs on /api/auth/login), so without
    warming, whichever request happens to be first to need a given pool slot
    pays that cost live. Opening every slot concurrently at startup moves that
    cost to boot time instead of request time.
    """
    async def _open_one() -> None:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))

    await asyncio.gather(*(_open_one() for _ in range(POOL_SIZE)), return_exceptions=True)
