from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class EstadoReporte(Base):
    __tablename__ = "estado_reporte"

    id: Mapped[int] = mapped_column(primary_key=True)
    des_estado: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)