from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CategoriaCurso(Base):
    __tablename__ = "categoria_curso"

    id: Mapped[int] = mapped_column(primary_key=True)

    des_categoria: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )