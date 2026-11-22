from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.rol import Rol

router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)

@router.get("/")
def listar_roles(db: Session = Depends(get_db)):
    roles = db.query(Rol).all()
    return roles