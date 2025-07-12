# 🧩 Microservicio de Usuarios y Posts (Python usando FastAPI) con Frontend en ReactJS

Este proyecto implementa una arquitectura basada en microservicios con:

- Frontend en React
- Backend dividido en dos microservicios:
  - `users-microservice` (autenticación y gestión de usuarios)
  - `posts-microservice` (gestión de publicaciones)
- Base de datos PostgreSQL
- Redis para manejo de sesiones o caché

---

## 📥 Clonación del Repositorio

Primero, clona este repositorio:

```bash
git clone https://github.com/wFercho/post_users_prueba_tecnica.git
cd post_users_prueba_tecnica
```

---

## 📦 Estructura de Contenedores

| Servicio              | Puerto Host | Tecnología       | Descripción                        |
|-----------------------|-------------|------------------|------------------------------------|
| `frontend`            | `3000`      | React            | Interfaz de usuario                |
| `users-microservice`  | `8000`      | FastAPI + Uvicorn| API de autenticación y usuarios    |
| `posts-microservice`  | `8001`      | FastAPI + Uvicorn| API para creación y gestión de posts |
| `app-postgres`        | `5432`      | PostgreSQL       | Base de datos para ambos servicios |
| `users-redis`         | `6379`      | Redis            | Almacenamiento en caché o tokens   |

---

## 🚀 Requisitos

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## 🔧 Configuración

1. Crea un archivo `.env` en la raíz del proyecto (si no existe):

```env
DATABASE_URL=postgresql://user:password@app-postgres:5432/auth_db
REDIS_URL=redis://users-redis:6379
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
DEBUG=False
```

> ⚠️ **Nota:** subir el archivo `.env` al repositorio **no es recomendable en entornos reales** ya que puede exponer información sensible como credenciales o claves privadas.  
> En este proyecto se incluye el `.env` **únicamente por motivos prácticos y de demostración.**

---

## ▶️ Cómo iniciar

```bash
docker-compose up --build
```

Una vez levantado el entorno, accede a:

- [Frontend](http://localhost:3000/login) → http://localhost:3000  
- [API de usuarios](http://localhost:8000/health) → http://localhost:8000  
- [API de posts](http://localhost:8001/health) → http://localhost:8001  

---

## 🛠️ Desarrollo

- Ambos microservicios usan `--reload` para recargar automáticamente al detectar cambios.
- El código fuente está montado en los contenedores mediante volúmenes, permitiendo desarrollo en vivo.

---

## 🗃️ Volúmenes persistentes

- `pgdata`: almacena los datos de PostgreSQL.
- `redis_data`: almacena los datos de Redis.

---

## 🌐 Red interna

Todos los servicios se comunican a través de una red Docker llamada `internal-net`.

---

## 📤 Endpoints (referencia rápida)

- `GET /users/me` → datos del usuario actual
- `POST /users/register` → registro de usuarios
- `POST /auth/login` → inicio de sesión
- `GET /posts` → listado público de posts
- `POST /posts` → creación de post (requiere autenticación)

---

## 📁 Estructura del proyecto (simplificada)

```
.
├── frontend/              # Código del frontend (React)
├── users/                 # Microservicio de usuarios
│   └── Dockerfile
├── posts/                 # Microservicio de posts
│   └── Dockerfile
├── docker-compose.yml
└── .env                   # ⚠️ Subido solo por motivos prácticos
```

---

## 📌 Notas

- Puedes usar nombres de servicio como `http://users-microservice:8000` para comunicar los microservicios internamente.
- Desde el frontend, en desarrollo local, asegúrate de apuntar a `http://localhost:8000` o `8001` según el microservicio.
