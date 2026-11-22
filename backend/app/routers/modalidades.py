from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.modalidad import Modalidad

router = APIRouter(
    prefix="/modalidades",
    tags=["Modalidades"]
)


@router.get("/")
def listar_modalidades(db: Session = Depends(get_db)):

    modalidades = db.query(Modalidad).all()

    return [
        {
            "id": m.id,
            "modalidad": m.des_modalidad
        }
        for m in modalidades
    ]