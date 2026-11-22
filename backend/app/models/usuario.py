from datetime import datetime
from sqlalchemy import String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuario"

    id: Mapped[int] = mapped_column(primary_key=True)
    id_rol: Mapped[int] = mapped_column(ForeignKey("rol.id"), nullable=False)
    username: Mapped[str | None] = mapped_column(String(50),unique=True,nullable=True)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    ultimo_acceso: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    

    rol = relationship("Rol")