from datetime import date
from calendar import monthrange

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.tutor import Tutor
from app.models.alumno import Alumno
from app.models.reporte import Reporte


router = APIRouter(
    prefix="/pagos",
    tags=["Pagos"]
)


def obtener_rango_fechas(
    periodo: str | None,
    fecha_inicio: date | None,
    fecha_fin: date | None
):
    if periodo and (fecha_inicio or fecha_fin):
        raise HTTPException(
            status_code=400,
            detail="Use periodo o rango de fechas, no ambos"
        )

    if periodo:
        try:
            anio, mes = map(int, periodo.split("-"))
            ultimo_dia = monthrange(anio, mes)[1]

            return (
                date(anio, mes, 1),
                date(anio, mes, ultimo_dia)
            )

        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="El periodo debe tener formato YYYY-MM. Ejemplo: 2026-06"
            )

    if fecha_inicio and fecha_fin:
        if fecha_fin < fecha_inicio:
            raise HTTPException(
                status_code=400,
                detail="La fecha_fin no puede ser menor que fecha_inicio"
            )

        return fecha_inicio, fecha_fin

    if fecha_inicio and not fecha_fin:
        raise HTTPException(
            status_code=400,
            detail="Debe enviar fecha_fin si envía fecha_inicio"
        )

    if fecha_fin and not fecha_inicio:
        raise HTTPException(
            status_code=400,
            detail="Debe enviar fecha_inicio si envía fecha_fin"
        )

    return None, None


@router.get("/tutores/{id_tutor}")
def pago_tutor(
    id_tutor: int,
    periodo: str | None = Query(default=None, description="Formato YYYY-MM. Ejemplo: 2026-06"),
    fecha_inicio: date | None = Query(default=None),
    fecha_fin: date | None = Query(default=None),
    db: Session = Depends(get_db)
):

    tutor = (
        db.query(Tutor)
        .filter(Tutor.id == id_tutor)
        .first()
    )

    if not tutor:
        raise HTTPException(
            status_code=404,
            detail="Tutor no encontrado"
        )

    fecha_desde, fecha_hasta = obtener_rango_fechas(
        periodo,
        fecha_inicio,
        fecha_fin
    )

    query = (
        db.query(Reporte)
        .filter(
            Reporte.id_tutor == id_tutor,
            Reporte.id_estado_reporte == 2
        )
    )

    if fecha_desde and fecha_hasta:
        query = query.filter(
            Reporte.fec_clase >= fecha_desde,
            Reporte.fec_clase <= fecha_hasta
        )

    reportes = query.all()

    total_horas = sum(float(r.horas_calculadas) for r in reportes)
    total_pagar = sum(float(r.monto_tutor) for r in reportes)

    return {
        "id_tutor": tutor.id,
        "tutor": f"{tutor.nombre} {tutor.apellido}",
        "periodo": periodo,
        "fecha_inicio": fecha_desde,
        "fecha_fin": fecha_hasta,
        "total_horas": total_horas,
        "total_pagar": total_pagar,
        "reportes": [
            {
                "id_reporte": r.id,
                "fecha_clase": r.fec_clase,
                "curso": r.curso.des_curso if r.curso else None,
                "modalidad": r.modalidad.des_modalidad if r.modalidad else None,
                "horas": float(r.horas_calculadas),
                "monto_tutor": float(r.monto_tutor)
            }
            for r in reportes
        ]
    }


@router.get("/alumnos/{id_alumno}")
def pago_alumno(
    id_alumno: int,
    periodo: str | None = Query(default=None, description="Formato YYYY-MM. Ejemplo: 2026-06"),
    fecha_inicio: date | None = Query(default=None),
    fecha_fin: date | None = Query(default=None),
    db: Session = Depends(get_db)
):

    alumno = (
        db.query(Alumno)
        .filter(Alumno.id == id_alumno)
        .first()
    )

    if not alumno:
        raise HTTPException(
            status_code=404,
            detail="Alumno no encontrado"
        )

    fecha_desde, fecha_hasta = obtener_rango_fechas(
        periodo,
        fecha_inicio,
        fecha_fin
    )

    query = (
        db.query(Reporte)
        .filter(
            Reporte.id_alumno == id_alumno,
            Reporte.id_estado_reporte == 2
        )
    )

    if fecha_desde and fecha_hasta:
        query = query.filter(
            Reporte.fec_clase >= fecha_desde,
            Reporte.fec_clase <= fecha_hasta
        )

    reportes = query.all()

    total_horas = sum(float(r.horas_calculadas) for r in reportes)
    total_cobrar = sum(float(r.monto_alumno) for r in reportes)

    return {
        "id_alumno": alumno.id,
        "alumno": f"{alumno.nombre} {alumno.apellido}",
        "periodo": periodo,
        "fecha_inicio": fecha_desde,
        "fecha_fin": fecha_hasta,
        "total_horas": total_horas,
        "total_cobrar": total_cobrar,
        "reportes": [
            {
                "id_reporte": r.id,
                "fecha_clase": r.fec_clase,
                "curso": r.curso.des_curso if r.curso else None,
                "modalidad": r.modalidad.des_modalidad if r.modalidad else None,
                "horas": float(r.horas_calculadas),
                "monto_alumno": float(r.monto_alumno)
            }
            for r in reportes
        ]
    }