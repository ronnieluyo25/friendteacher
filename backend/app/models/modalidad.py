from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Modalidad(Base):
    __tablename__ = "modalidad"

    id: Mapped[int] = mapped_column(primary_key=True)

    des_modalidad: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )