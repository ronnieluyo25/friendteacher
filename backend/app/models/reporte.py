from datetime import date, time, datetime
from datetime import datetime
from decimal import Decimal

from sqlalchemy import ForeignKey, Date, Time, Numeric, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def fecha_local():
    return datetime.now()


class Reporte(Base):
    __tablename__ = "reporte"

    id: Mapped[int] = mapped_column(primary_key=True)

    id_tutor: Mapped[int] = mapped_column(ForeignKey("tutor.id"), nullable=False)
    id_alumno: Mapped[int] = mapped_column(ForeignKey("alumno.id"), nullable=False)
    id_curso: Mapped[int] = mapped_column(ForeignKey("curso.id"), nullable=False)
    id_modalidad: Mapped[int] = mapped_column(ForeignKey("modalidad.id"), nullable=False)
    id_estado_reporte: Mapped[int] = mapped_column(ForeignKey("estado_reporte.id"), nullable=False)

    fec_reporte: Mapped[date] = mapped_column(Date, default=date.today)
    fec_clase: Mapped[date] = mapped_column(Date, nullable=False)

    hora_inicio: Mapped[time] = mapped_column(Time, nullable=False)
    hora_final: Mapped[time] = mapped_column(Time, nullable=False)

    horas_calculadas: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)

    monto_tutor: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    monto_alumno: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    observacion_admin: Mapped[str | None] = mapped_column(Text, nullable=True)
    motivo_anulacion: Mapped[str | None] = mapped_column(Text, nullable=True)

    fecha_registro: Mapped[datetime] = mapped_column(DateTime, default=fecha_local)
    fecha_validacion: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    fecha_anulacion: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    usuario_registro: Mapped[int | None] = mapped_column(ForeignKey("usuario.id"), nullable=True)
    usuario_validacion: Mapped[int | None] = mapped_column(ForeignKey("usuario.id"), nullable=True)
    usuario_anulacion: Mapped[int | None] = mapped_column(ForeignKey("usuario.id"), nullable=True)

    tutor = relationship("Tutor")
    alumno = relationship("Alumno")
    curso = relationship("Curso")
    modalidad = relationship("Modalidad")
    estado = relationship("EstadoReporte")

    detalle = relationship(
        "DetalleReporte",
        back_populates="reporte",
        uselist=False
    )