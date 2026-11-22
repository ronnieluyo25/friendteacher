from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Curso(Base):
    __tablename__ = "curso"

    id: Mapped[int] = mapped_column(primary_key=True)

    id_categoria: Mapped[int] = mapped_column(
        ForeignKey("categoria_curso.id"),
        nullable=False
    )

    des_curso: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    activo: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    categoria = relationship("CategoriaCurso")