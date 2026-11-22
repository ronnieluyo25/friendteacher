from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.reporte import Reporte, fecha_local
from app.models.detalle_reporte import DetalleReporte
from app.models.precio_clase import PrecioClase
from app.schemas.reporte import ReporteCreate
from app.schemas.anular_reporte import AnularReporte
from app.core.dependencies import require_admin, require_tutor
from app.models.usuario import Usuario
from app.models.tutor import Tutor


router = APIRouter(
    prefix="/reportes",
    tags=["Reportes"]
)


def calcular_horas(hora_inicio, hora_final) -> Decimal:
    inicio = datetime.combine(datetime.today(), hora_inicio)
    final = datetime.combine(datetime.today(), hora_final)

    if final <= inicio:
        raise HTTPException(
            status_code=400,
            detail="La hora final debe ser mayor que la hora de inicio"
        )

    minutos = (final - inicio).total_seconds() / 60

    return Decimal(str(minutos / 60)).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP
    )


@router.post("/")
def crear_reporte(
    data: ReporteCreate,
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
            detail="No se encontró el perfil del tutor autenticado"
        )

    horas_calculadas = calcular_horas(
        data.hora_inicio,
        data.hora_final
    )

    precio = (
        db.query(PrecioClase)
        .filter(
            PrecioClase.id_curso == data.id_curso,
            PrecioClase.id_modalidad == data.id_modalidad,
            PrecioClase.activo == True,
            PrecioClase.fecha_inicio <= data.fec_clase
        )
        .filter(
            (PrecioClase.fecha_fin == None) |
            (PrecioClase.fecha_fin >= data.fec_clase)
        )
        .first()
    )

    if not precio:
        raise HTTPException(
            status_code=404,
            detail=(
                "No existe precio activo para el curso "
                "y modalidad seleccionados"
            )
        )

    monto_tutor = (
        horas_calculadas * Decimal(precio.precio_tutor)
    ).quantize(Decimal("0.01"))

    monto_alumno = (
        horas_calculadas * Decimal(precio.precio_alumno)
    ).quantize(Decimal("0.01"))

    reporte = Reporte(
        id_tutor=tutor.id,
        id_alumno=data.id_alumno,
        id_curso=data.id_curso,
        id_modalidad=data.id_modalidad,
        id_estado_reporte=1,
        fec_clase=data.fec_clase,
        hora_inicio=data.hora_inicio,
        hora_final=data.hora_final,
        horas_calculadas=horas_calculadas,
        monto_tutor=monto_tutor,
        monto_alumno=monto_alumno,
        usuario_registro=usuario_tutor.id
    )

    db.add(reporte)
    db.flush()

    detalle = DetalleReporte(
        id_reporte=reporte.id,
        tema_realizado=data.tema_realizado,
        tarea_realizada=data.tarea_realizada,
        desarrollo_clase=data.desarrollo_clase,
        actitud_estudiante=data.actitud_estudiante,
        logro_estudiante=data.logro_estudiante,
        recomendaciones=data.recomendaciones
    )

    db.add(detalle)
    db.commit()
    db.refresh(reporte)

    return {
        "mensaje": "Reporte registrado correctamente",
        "id_reporte": reporte.id,
        "horas_calculadas": (
            f"{float(reporte.horas_calculadas):.2f}"
        ),
        "monto_tutor": (
            f"{float(reporte.monto_tutor):.2f}"
        ),
        "monto_alumno": (
            f"{float(reporte.monto_alumno):.2f}"
        )
    }

@router.get("/")
def listar_reportes(
    db: Session = Depends(get_db)
):
    reportes = (
        db.query(Reporte)
        .join(Reporte.tutor)
        .join(Reporte.alumno)
        .join(Reporte.curso)
        .join(Reporte.modalidad)
        .join(Reporte.estado)
        .order_by(Reporte.fec_clase.desc(), Reporte.id.desc())
        .all()
    )

    return [
        {
            "id": r.id,

            "fec_clase": r.fec_clase.strftime("%d/%m/%Y") if r.fec_clase else "",
            "fec_clase_iso": r.fec_clase.strftime("%Y-%m-%d") if r.fec_clase else "",

            "hora_inicio": r.hora_inicio.strftime("%H:%M") if r.hora_inicio else "",
            "hora_final": r.hora_final.strftime("%H:%M") if r.hora_final else "",

            "horas_calculadas": f"{float(r.horas_calculadas):.2f}",
            "monto_tutor": f"{float(r.monto_tutor):.2f}",
            "monto_alumno": f"{float(r.monto_alumno):.2f}",

            "id_tutor": r.id_tutor,
            "tutor": f"{r.tutor.nombre} {r.tutor.apellido}" if r.tutor else "",

            "id_alumno": r.id_alumno,
            "alumno": f"{r.alumno.nombre} {r.alumno.apellido}" if r.alumno else "",

            "id_curso": r.id_curso,
            "curso": r.curso.des_curso if r.curso else "",

            "id_modalidad": r.id_modalidad,
            "modalidad": r.modalidad.des_modalidad if r.modalidad else "",

            "id_estado": r.id_estado_reporte,
            "estado": r.estado.des_estado if r.estado else "",

            "detalle": {
                "tema_realizado": r.detalle.tema_realizado if r.detalle else "",
                "tarea_realizada": r.detalle.tarea_realizada if r.detalle else "",
                "desarrollo_clase": r.detalle.desarrollo_clase if r.detalle else "",
                "actitud_estudiante": r.detalle.actitud_estudiante if r.detalle else "",
                "logro_estudiante": r.detalle.logro_estudiante if r.detalle else "",
                "recomendaciones": r.detalle.recomendaciones if r.detalle else "",
            }
        }
        for r in reportes
    ]


@router.put("/{id_reporte}/validar")
def validar_reporte(
    id_reporte: int,
    usuario_admin: Usuario = Depends(require_admin),
    db: Session = Depends(get_db)
):
    reporte = (
        db.query(Reporte)
        .filter(Reporte.id == id_reporte)
        .first()
    )

    if not reporte:
        raise HTTPException(
            status_code=404,
            detail="Reporte no encontrado"
        )

    reporte.id_estado_reporte = 2
    reporte.fecha_validacion = fecha_local()
    reporte.usuario_validacion = usuario_admin.id

    db.commit()
    db.refresh(reporte)

    return {
        "mensaje": "Reporte validado correctamente",
        "id_reporte": reporte.id,
        "estado": "VALIDADO"
    }

@router.get("/mis-reportes")
def listar_mis_reportes(
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
            detail="No se encontró el perfil del tutor autenticado"
        )

    reportes = (
        db.query(Reporte)
        .join(Reporte.tutor)
        .join(Reporte.alumno)
        .join(Reporte.curso)
        .join(Reporte.modalidad)
        .join(Reporte.estado)
        .filter(Reporte.id_tutor == tutor.id)
        .order_by(
            Reporte.fec_clase.desc(),
            Reporte.id.desc()
        )
        .all()
    )

    return [
        {
            "id": r.id,
            "fec_clase": (
                r.fec_clase.strftime("%d/%m/%Y")
                if r.fec_clase else ""
            ),
            "fec_clase_iso": (
                r.fec_clase.strftime("%Y-%m-%d")
                if r.fec_clase else ""
            ),
            "hora_inicio": (
                r.hora_inicio.strftime("%H:%M")
                if r.hora_inicio else ""
            ),
            "hora_final": (
                r.hora_final.strftime("%H:%M")
                if r.hora_final else ""
            ),
            "horas_calculadas": (
                f"{float(r.horas_calculadas):.2f}"
            ),
            "monto_tutor": (
                f"{float(r.monto_tutor):.2f}"
            ),
            "id_alumno": r.id_alumno,
            "alumno": (
                f"{r.alumno.nombre} {r.alumno.apellido}"
                if r.alumno else ""
            ),
            "id_curso": r.id_curso,
            "curso": (
                r.curso.des_curso
                if r.curso else ""
            ),
            "id_modalidad": r.id_modalidad,
            "modalidad": (
                r.modalidad.des_modalidad
                if r.modalidad else ""
            ),
            "id_estado": r.id_estado_reporte,
            "estado": (
                r.estado.des_estado
                if r.estado else ""
            ),
            "detalle": {
                "tema_realizado": (
                    r.detalle.tema_realizado
                    if r.detalle else ""
                ),
                "tarea_realizada": (
                    r.detalle.tarea_realizada
                    if r.detalle else ""
                ),
                "desarrollo_clase": (
                    r.detalle.desarrollo_clase
                    if r.detalle else ""
                ),
                "actitud_estudiante": (
                    r.detalle.actitud_estudiante
                    if r.detalle else ""
                ),
                "logro_estudiante": (
                    r.detalle.logro_estudiante
                    if r.detalle else ""
                ),
                "recomendaciones": (
                    r.detalle.recomendaciones
                    if r.detalle else ""
                ),
            }
        }
        for r in reportes
    ]

@router.get("/estado-pagos")
def obtener_estado_pagos_tutor(
    usuario_tutor: Usuario = Depends(require_tutor),
    db: Session = Depends(get_db)
):
    # El token devuelve el ID de la cuenta de usuario.
    # Con ese ID buscamos su perfil en la tabla tutor.
    tutor = (
        db.query(Tutor)
        .filter(Tutor.id_usuario == usuario_tutor.id)
        .first()
    )

    if not tutor:
        raise HTTPException(
            status_code=404,
            detail="No se encontró el perfil del tutor autenticado"
        )

    # Solo se consideran reportes aprobados.
    reportes = (
        db.query(Reporte)
        .join(Reporte.alumno)
        .join(Reporte.curso)
        .join(Reporte.modalidad)
        .join(Reporte.estado)
        .filter(
            Reporte.id_tutor == tutor.id,
            Reporte.id_estado_reporte == 2
        )
        .order_by(
            Reporte.fec_clase.desc(),
            Reporte.id.desc()
        )
        .all()
    )

    total_horas = sum(
        Decimal(str(reporte.horas_calculadas or 0))
        for reporte in reportes
    )

    total_generado = sum(
        Decimal(str(reporte.monto_tutor or 0))
        for reporte in reportes
    )

    return {
        "tutor": {
            "id": tutor.id,
            "nombre": f"{tutor.nombre} {tutor.apellido}"
        },
        "resumen": {
            "reportes_aprobados": len(reportes),
            "total_horas": f"{total_horas:.2f}",
            "total_generado": f"{total_generado:.2f}"
        },
        "reportes": [
            {
                "id": reporte.id,

                "fec_clase": (
                    reporte.fec_clase.strftime("%d/%m/%Y")
                    if reporte.fec_clase else ""
                ),

                "fec_clase_iso": (
                    reporte.fec_clase.strftime("%Y-%m-%d")
                    if reporte.fec_clase else ""
                ),

                "anio": (
                    reporte.fec_clase.year
                    if reporte.fec_clase else None
                ),

                "mes": (
                    reporte.fec_clase.month
                    if reporte.fec_clase else None
                ),

                "alumno": (
                    f"{reporte.alumno.nombre} "
                    f"{reporte.alumno.apellido}"
                    if reporte.alumno else ""
                ),

                "curso": (
                    reporte.curso.des_curso
                    if reporte.curso else ""
                ),

                "modalidad": (
                    reporte.modalidad.des_modalidad
                    if reporte.modalidad else ""
                ),

                "hora_inicio": (
                    reporte.hora_inicio.strftime("%H:%M")
                    if reporte.hora_inicio else ""
                ),

                "hora_final": (
                    reporte.hora_final.strftime("%H:%M")
                    if reporte.hora_final else ""
                ),

                "horas_calculadas": (
                    f"{Decimal(str(reporte.horas_calculadas or 0)):.2f}"
                ),

                "monto_tutor": (
                    f"{Decimal(str(reporte.monto_tutor or 0)):.2f}"
                ),

                "estado": (
                    reporte.estado.des_estado
                    if reporte.estado else ""
                )
            }
            for reporte in reportes
        ]
    }

@router.put("/{id_reporte}/anular")
def anular_reporte(
    id_reporte: int,
    data: AnularReporte,
    usuario_admin: Usuario = Depends(require_admin),
    db: Session = Depends(get_db)
):
    reporte = (
        db.query(Reporte)
        .filter(Reporte.id == id_reporte)
        .first()
    )

    if not reporte:
        raise HTTPException(
            status_code=404,
            detail="Reporte no encontrado"
        )

    reporte.id_estado_reporte = 3
    reporte.fecha_anulacion = fecha_local()
    reporte.motivo_anulacion = data.motivo_anulacion
    reporte.usuario_anulacion = usuario_admin.id

    db.commit()
    db.refresh(reporte)

    return {
        "mensaje": "Reporte anulado correctamente",
        "id_reporte": reporte.id,
        "estado": "ANULADO",
        "motivo": reporte.motivo_anulacion
    }


@router.put("/validar-multiple/")
def validar_reportes_multiple(
    ids_reportes: list[int],
    usuario_admin: Usuario = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if not ids_reportes:
        raise HTTPException(
            status_code=400,
            detail="Debe seleccionar al menos un reporte"
        )

    reportes = (
        db.query(Reporte)
        .filter(Reporte.id.in_(ids_reportes))
        .all()
    )

    if not reportes:
        raise HTTPException(
            status_code=404,
            detail="No se encontraron reportes"
        )

    for reporte in reportes:
        reporte.id_estado_reporte = 2
        reporte.fecha_validacion = fecha_local()
        reporte.usuario_validacion = usuario_admin.id

    db.commit()

    return {
        "mensaje": "Reportes validados correctamente",
        "cantidad": len(reportes)
    }


@router.put("/anular-multiple/")
def anular_reportes_multiple(
    data: dict,
    usuario_admin: Usuario = Depends(require_admin),
    db: Session = Depends(get_db)
):
    ids_reportes = data.get("ids_reportes", [])
    motivo_anulacion = data.get("motivo_anulacion", "")

    if not ids_reportes:
        raise HTTPException(
            status_code=400,
            detail="Debe seleccionar al menos un reporte"
        )

    if not motivo_anulacion.strip():
        raise HTTPException(
            status_code=400,
            detail="Debe ingresar el motivo de anulación"
        )

    reportes = (
        db.query(Reporte)
        .filter(Reporte.id.in_(ids_reportes))
        .all()
    )

    if not reportes:
        raise HTTPException(
            status_code=404,
            detail="No se encontraron reportes"
        )

    for reporte in reportes:
        reporte.id_estado_reporte = 3
        reporte.fecha_anulacion = fecha_local()
        reporte.motivo_anulacion = motivo_anulacion
        reporte.usuario_anulacion = usuario_admin.id

    db.commit()

    return {
        "mensaje": "Reportes anulados correctamente",
        "cantidad": len(reportes),
        "motivo": motivo_anulacion
    }