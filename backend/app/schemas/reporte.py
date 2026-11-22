from datetime import date, time
from pydantic import BaseModel
from app.schemas.anular_reporte import AnularReporte


class ReporteCreate(BaseModel):
    id_alumno: int
    id_curso: int
    id_modalidad: int
    fec_clase: date
    hora_inicio: time
    hora_final: time

    tema_realizado: str | None = None
    tarea_realizada: str | None = None
    desarrollo_clase: str | None = None
    actitud_estudiante: str | None = None
    logro_estudiante: str | None = None
    recomendaciones: str | None = None