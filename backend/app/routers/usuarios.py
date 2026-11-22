from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.models.tutor import Tutor
from app.models.alumno import Alumno
from app.schemas.usuario import UsuarioCreate
from app.core.security import hash_password
from app.core.dependencies import require_admin


router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


@router.post("/")
def crear_usuario(
    data: UsuarioCreate,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    if data.id_rol not in [2, 3]:
        raise HTTPException(
            status_code=400,
            detail="Desde la API solo se pueden crear usuarios TUTOR o ALUMNO"
        )

    existe_username = (
        db.query(Usuario)
        .filter(Usuario.username == data.username)
        .first()
    )

    if existe_username:
        raise HTTPException(
            status_code=400,
            detail="El username ya existe"
        )

    usuario = Usuario(
        username=data.username,
        password_hash=hash_password(data.password),
        id_rol=data.id_rol,
        email=data.correo,
        activo=True
    )

    db.add(usuario)
    db.flush()

    if data.id_rol == 2:
        perfil = Tutor(
            id_usuario=usuario.id,
            nombre=data.nombre,
            apellido=data.apellido,
            dni=data.dni,
            celular=data.celular,
            correo=data.correo,
            fec_nac=data.fec_nac
        )
        tipo_usuario = "TUTOR"

    else:
        perfil = Alumno(
            id_usuario=usuario.id,
            nombre=data.nombre,
            apellido=data.apellido,
            dni=data.dni,
            celular=data.celular,
            correo=data.correo,
            fec_nac=data.fec_nac
        )
        tipo_usuario = "ALUMNO"

    db.add(perfil)
    db.commit()
    db.refresh(usuario)

    return {
        "mensaje": f"Usuario {tipo_usuario} creado correctamente",
        "id_usuario": usuario.id,
        "username": usuario.username,
        "id_rol": usuario.id_rol,
        "tipo_usuario": tipo_usuario
    }


@router.get("/")
def listar_usuarios(
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    usuarios = db.query(Usuario).all()

    return [
        {
            "id_usuario": u.id,
            "username": u.username,
            "email": u.email,
            "id_rol": u.id_rol,
            "rol": u.rol.des_rol if u.rol else None,
            "activo": u.activo
        }
        for u in usuarios
    ]


@router.get("/{id_usuario}")
def obtener_usuario(
    id_usuario: int,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == id_usuario)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    perfil = None

    if usuario.id_rol == 2:
        perfil = (
            db.query(Tutor)
            .filter(Tutor.id_usuario == usuario.id)
            .first()
        )

    elif usuario.id_rol == 3:
        perfil = (
            db.query(Alumno)
            .filter(Alumno.id_usuario == usuario.id)
            .first()
        )

    return {
        "id_usuario": usuario.id,
        "username": usuario.username,
        "email": usuario.email,
        "id_rol": usuario.id_rol,
        "rol": usuario.rol.des_rol if usuario.rol else None,
        "activo": usuario.activo,
        "perfil": {
            "id": perfil.id if perfil else None,
            "nombre": perfil.nombre if perfil else None,
            "apellido": perfil.apellido if perfil else None,
            "dni": perfil.dni if perfil else None,
            "celular": perfil.celular if perfil else None,
            "correo": perfil.correo if perfil else None,
            "fec_nac": perfil.fec_nac if perfil else None
        } if perfil else None
    }


@router.patch("/{id_usuario}/desactivar")
def desactivar_usuario(
    id_usuario: int,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == id_usuario)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    if usuario.id_rol == 1:
        raise HTTPException(
            status_code=400,
            detail="No se puede desactivar un usuario ADMIN desde la API"
        )

    usuario.activo = False

    db.commit()
    db.refresh(usuario)

    return {
        "mensaje": "Usuario desactivado correctamente",
        "id_usuario": usuario.id,
        "username": usuario.username,
        "activo": usuario.activo
    }


@router.patch("/{id_usuario}/activar")
def activar_usuario(
    id_usuario: int,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):

    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == id_usuario)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    usuario.activo = True

    db.commit()
    db.refresh(usuario)

    return {
        "mensaje": "Usuario activado correctamente",
        "id_usuario": usuario.id,
        "username": usuario.username,
        "activo": usuario.activo
    }

## Nuevo

@router.patch("/{id_usuario}/actualizar")
def actualizar_usuario(
    id_usuario: int,
    data: dict,
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == id_usuario)
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    usuario.username = data.get("username", usuario.username)
    usuario.email = data.get("email", usuario.email)

    if usuario.id_rol == 2:
        perfil = (
            db.query(Tutor)
            .filter(Tutor.id_usuario == usuario.id)
            .first()
        )
    elif usuario.id_rol == 3:
        perfil = (
            db.query(Alumno)
            .filter(Alumno.id_usuario == usuario.id)
            .first()
        )
    else:
        perfil = None

    if perfil:
        perfil.nombre = data.get("nombre", perfil.nombre)
        perfil.apellido = data.get("apellido", perfil.apellido)
        perfil.dni = data.get("dni", perfil.dni)
        perfil.celular = data.get("celular", perfil.celular)
        perfil.correo = data.get("correo", perfil.correo)
        perfil.fec_nac = data.get("fec_nac", perfil.fec_nac)

    db.commit()

    return {
        "mensaje": "Usuario actualizado correctamente"
    }