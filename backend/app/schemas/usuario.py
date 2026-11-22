from datetime import date
from pydantic import BaseModel


class UsuarioCreate(BaseModel):
    username: str
    password: str
    id_rol: int

    nombre: str
    apellido: str
    dni: str | None = None
    celular: str | None = None
    correo: str | None = None
    fec_nac: date | None = None