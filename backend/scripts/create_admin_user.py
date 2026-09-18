import argparse
import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import AsyncSessionLocal, engine
from app.core.security import hash_password
from app.models import Base
from app.models.user import User, UserRole
from sqlalchemy import select


async def create_admin(email: str, password: str, full_name: str) -> None:
    print("[*] Ensuring database tables exist...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[+] Database schema verified.")

    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(User).where(User.email == email))
        if existing.scalar_one_or_none():
            print(f"[!] A user with email '{email}' already exists. No action taken.")
            return

        user = User(
            email=email,
            hashed_password=hash_password(password),
            full_name=full_name,
            role=UserRole.PLATFORM_ADMIN,
            is_active=True,
        )
        db.add(user)
        await db.commit()

        print(f"[SUCCESS] Created Platform Admin user: {user.email} (role={user.role.value})")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed a Platform Admin user into the database.")
    parser.add_argument("--email", required=True, help="Email address for the admin user")
    parser.add_argument("--password", required=True, help="Password for the admin user")
    parser.add_argument("--full-name", default="Platform Admin", help="Full name for the admin user")
    args = parser.parse_args()

    asyncio.run(create_admin(args.email, args.password, args.full_name))


if __name__ == "__main__":
    main()
