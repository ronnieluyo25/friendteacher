from datetime import date
from calendar import monthrange

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.reporte import Reporte


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
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
            return date(anio, mes, 1), date(anio, mes, ultimo_dia)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="El periodo debe tener formato YYYY-MM"
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


@router.get("/resumen")
def resumen_dashboard(
    periodo: str | None = Query(default=None, description="Formato YYYY-MM. Ejemplo: 2026-06"),
    fecha_inicio: date | None = Query(default=None),
    fecha_fin: date | None = Query(default=None),
    db: Session = Depends(get_db)
):

    fecha_desde, fecha_hasta = obtener_rango_fechas(
        periodo,
        fecha_inicio,
        fecha_fin
    )

    query = (
        db.query(Reporte)
        .filter(Reporte.id_estado_reporte == 2)
    )

    if fecha_desde and fecha_hasta:
        query = query.filter(
            Reporte.fec_clase >= fecha_desde,
            Reporte.fec_clase <= fecha_hasta
        )

    reportes = query.all()

    total_reportes = len(reportes)
    total_horas = sum(float(r.horas_calculadas) for r in reportes)
    total_pagar_tutores = sum(float(r.monto_tutor) for r in reportes)
    total_cobrar_alumnos = sum(float(r.monto_alumno) for r in reportes)
    ganancia_bruta = total_cobrar_alumnos - total_pagar_tutores

    return {
        "periodo": periodo,
        "fecha_inicio": fecha_desde,
        "fecha_fin": fecha_hasta,
        "total_reportes": total_reportes,
        "total_horas": total_horas,
        "total_pagar_tutores": total_pagar_tutores,
        "total_cobrar_alumnos": total_cobrar_alumnos,
        "ganancia_bruta": ganancia_bruta
    }