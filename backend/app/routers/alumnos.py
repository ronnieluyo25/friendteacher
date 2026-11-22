from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alumno import Alumno

router = APIRouter(
    prefix="/alumnos",
    tags=["Alumnos"]
)


@router.get("/")
def listar_alumnos(db: Session = Depends(get_db)):
    alumnos = db.query(Alumno).all()

    return [
        {
            "id": alumno.id,
            "nombre": alumno.nombre,
            "apellido": alumno.apellido,
            "dni": alumno.dni,
            "celular": alumno.celular,
            "correo": alumno.correo
        }
        for alumno in alumnos
    ]