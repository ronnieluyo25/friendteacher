from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.dependencies import require_tutor
from app.models.usuario import Usuario
from app.models.tutor import Tutor
from app.schemas.tutor import TutorPerfilUpdate


router = APIRouter(
    prefix="/tutores",
    tags=["Tutores"]
)


@router.get("/")
def listar_tutores(db: Session = Depends(get_db)):
    tutores = db.query(Tutor).all()

    return [
        {
            "id": tutor.id,
            "nombre": tutor.nombre,
            "apellido": tutor.apellido,
            "dni": tutor.dni,
            "celular": tutor.celular,
            "correo": tutor.correo
        }
        for tutor in tutores
    ]

@router.get("/mi-perfil")
def obtener_mi_perfil(
    usuario_tutor: Usuario = Depends(require_tutor),
    db: Session = Depends(get_db)
):
    tutor = (
        db.query(Tutor)
        .filter(Tutor.id_usuario == usuario_tutor.id)
        .first()
    )

    if not tutor:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el perfil del tutor"
        )

    return {
        "id_tutor": tutor.id,
        "id_usuario": usuario_tutor.id,
        "username": usuario_tutor.username,
        "email_usuario": usuario_tutor.email,
        "nombre": tutor.nombre,
        "apellido": tutor.apellido,
        "dni": tutor.dni,
        "celular": tutor.celular or "",
        "correo": tutor.correo or "",
        "fec_nac": (
            tutor.fec_nac.strftime("%Y-%m-%d")
            if tutor.fec_nac
            else ""
        )
    }

@router.put("/mi-perfil")
def actualizar_mi_perfil(
    data: TutorPerfilUpdate,
    usuario_tutor: Usuario = Depends(require_tutor),
    db: Session = Depends(get_db)
):
    tutor = (
        db.query(Tutor)
        .filter(Tutor.id_usuario == usuario_tutor.id)
        .first()
    )

    if not tutor:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el perfil del tutor"
        )

    datos = data.model_dump(exclude_unset=True)

    if "correo" in datos and datos["correo"]:
        correo_existente = (
            db.query(Tutor)
            .filter(
                Tutor.correo == datos["correo"],
                Tutor.id != tutor.id
            )
            .first()
        )

        if correo_existente:
            raise HTTPException(
                status_code=400,
                detail="El correo ya pertenece a otro tutor"
            )

    for campo, valor in datos.items():
        setattr(tutor, campo, valor)

    try:
        db.commit()
        db.refresh(tutor)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="No se pudo actualizar el perfil"
        )

    return {
        "mensaje": "Perfil actualizado correctamente",
        "perfil": {
            "nombre": tutor.nombre,
            "apellido": tutor.apellido,
            "dni": tutor.dni,
            "celular": tutor.celular or "",
            "correo": tutor.correo or "",
            "fec_nac": (
                tutor.fec_nac.strftime("%Y-%m-%d")
                if tutor.fec_nac
                else ""
            )
        }
    }