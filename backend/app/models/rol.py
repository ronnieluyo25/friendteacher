from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Rol(Base):
    __tablename__ = "rol"

    id: Mapped[int] = mapped_column(primary_key=True)
    des_rol: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)