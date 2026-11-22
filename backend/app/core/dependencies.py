from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.core.security import decode_access_token


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Token inválido o expirado"
        )

    id_usuario = payload.get("id_usuario")

    if id_usuario is None:
        raise HTTPException(
            status_code=401,
            detail="Token inválido"
        )

    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == id_usuario)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Usuario no encontrado"
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=403,
            detail="Usuario inactivo"
        )

    return usuario


def require_admin(
    usuario: Usuario = Depends(get_current_user)
):

    if usuario.id_rol != 1:
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios ADMIN pueden realizar esta acción"
        )

    return usuario


def require_tutor(
    usuario: Usuario = Depends(get_current_user)
):

    if usuario.id_rol != 2:
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios TUTOR pueden realizar esta acción"
        )

    return usuario


def require_alumno(
    usuario: Usuario = Depends(get_current_user)
):

    if usuario.id_rol != 3:
        raise HTTPException(
            status_code=403,
            detail="Solo usuarios ALUMNO pueden realizar esta acción"
        )

    return usuario