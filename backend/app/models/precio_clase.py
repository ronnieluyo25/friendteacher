from datetime import date

from sqlalchemy import (
    ForeignKey,
    Numeric,
    Boolean,
    Date
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from app.database import Base


class PrecioClase(Base):
    __tablename__ = "precio_clase"

    id: Mapped[int] = mapped_column(primary_key=True)

    id_curso: Mapped[int] = mapped_column(
        ForeignKey("curso.id")
    )

    id_modalidad: Mapped[int] = mapped_column(
        ForeignKey("modalidad.id")
    )

    precio_tutor: Mapped[float] = mapped_column(
        Numeric(10, 2)
    )

    precio_alumno: Mapped[float] = mapped_column(
        Numeric(10, 2)
    )

    activo: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    fecha_inicio: Mapped[date] = mapped_column(
        Date
    )

    fecha_fin: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    curso = relationship("Curso")
    modalidad = relationship("Modalidad")