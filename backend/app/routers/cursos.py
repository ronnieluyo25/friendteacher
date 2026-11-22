from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.curso import Curso

router = APIRouter(
    prefix="/cursos",
    tags=["Cursos"]
)


@router.get("/")
def listar_cursos(db: Session = Depends(get_db)):

    cursos = db.query(Curso).all()

    return [
        {
            "id": c.id,
            "curso": c.des_curso,
            "activo": c.activo
        }
        for c in cursos
    ]