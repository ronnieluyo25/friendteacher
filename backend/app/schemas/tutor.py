from datetime import date

from pydantic import BaseModel, Field


class TutorPerfilUpdate(BaseModel):
    celular: str | None = Field(
        default=None,
        max_length=20
    )

    correo: str | None = Field(
        default=None,
        max_length=150
    )

    fec_nac: date | None = None