from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import roles
from app.routers import tutores
from app.routers import alumnos

from app.routers import cursos
from app.routers import modalidades

from app.routers import reportes
from app.routers import pagos

from app.routers import dashboard

from app.routers import auth
from app.routers import usuarios


app = FastAPI(
    title="FriendTeacher API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(roles.router)
app.include_router(tutores.router)
app.include_router(alumnos.router)
app.include_router(cursos.router)
app.include_router(modalidades.router)
app.include_router(reportes.router)
app.include_router(pagos.router)
app.include_router(dashboard.router)
app.include_router(auth.router)
app.include_router(usuarios.router)

@app.get("/")
def home():
    return {"message": "API FriendTeacher funcionando"}