from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DetalleReporte(Base):
    __tablename__ = "detalle_reporte"

    id: Mapped[int] = mapped_column(primary_key=True)

    id_reporte: Mapped[int] = mapped_column(
        ForeignKey("reporte.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    tema_realizado: Mapped[str | None] = mapped_column(Text, nullable=True)
    tarea_realizada: Mapped[str | None] = mapped_column(Text, nullable=True)
    desarrollo_clase: Mapped[str | None] = mapped_column(Text, nullable=True)
    actitud_estudiante: Mapped[str | None] = mapped_column(Text, nullable=True)
    logro_estudiante: Mapped[str | None] = mapped_column(Text, nullable=True)
    recomendaciones: Mapped[str | None] = mapped_column(Text, nullable=True)

    reporte = relationship("Reporte", back_populates="detalle")