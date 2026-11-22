from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.core.security import verify_password, create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    usuario = (
        db.query(Usuario)
        .filter(Usuario.username == form_data.username)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos"
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=403,
            detail="Usuario inactivo"
        )

    if not verify_password(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos"
        )

    token = create_access_token(
        {
            "id_usuario": usuario.id,
            "username": usuario.username,
            "id_rol": usuario.id_rol
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "id_usuario": usuario.id,
        "username": usuario.username,
        "id_rol": usuario.id_rol
    }