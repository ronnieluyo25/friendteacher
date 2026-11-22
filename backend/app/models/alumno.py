from datetime import date
from sqlalchemy import String, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Alumno(Base):
    __tablename__ = "alumno"

    id: Mapped[int] = mapped_column(primary_key=True)
    id_usuario: Mapped[int | None] = mapped_column(ForeignKey("usuario.id"), unique=True, nullable=True)

    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    dni: Mapped[str | None] = mapped_column(String(15), unique=True, nullable=True)
    celular: Mapped[str | None] = mapped_column(String(20), nullable=True)
    correo: Mapped[str | None] = mapped_column(String(150), nullable=True)
    fec_nac: Mapped[date | None] = mapped_column(Date, nullable=True)

    usuario = relationship("Usuario")