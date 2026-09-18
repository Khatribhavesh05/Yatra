from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, UUIDMixin, TimestampMixin


class Grievance(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "grievances"

    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    reporter_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    reporter_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reporter_email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="OPEN", nullable=False)
