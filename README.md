# Sistema de Registro de Puntos de Interés con Base de Datos Geoespacial

## Descripción del proyecto

Este proyecto implementa un sistema web para registrar y consultar puntos de interés geográficos, utilizando una arquitectura basada en contenedores Docker. La solución está compuesta por un backend en NestJS, una base de datos PostgreSQL con extensión PostGIS para capacidades geoespaciales, un frontend estático en HTML/CSS/JavaScript y un proxy reverso con Nginx.

El sistema permite almacenar puntos de interés con nombre, descripción, coordenadas geográficas y clasificación jerárquica mediante categorías y subcategorías. Además, soporta el cargado inicial de datos de ejemplo, persistencia mediante volúmenes y comunicación interna entre servicios mediante una red Docker definida por el usuario.

---

## Objetivo

Desplegar una solución completa en entorno local que permita:

- Registrar puntos de interés geográficos.
- Consultar todos los puntos registrados.
- Filtrar puntos por categoría o subcategoría.
- Realizar búsquedas por proximidad geográfica.
- Acceder al sistema desde un navegador a través de Nginx.
- Mantener persistencia de datos mediante volúmenes Docker.
- Levantar toda la solución con Docker Compose.

---

## Tecnologías utilizadas

### Backend
- NestJS
- TypeORM
- PostgreSQL driver (`pg`)

### Base de datos
- PostgreSQL 16
- PostGIS 3.5

### Frontend
- HTML5
- CSS3
- JavaScript

### Proxy reverso
- Nginx

### Contenerización
- Docker
- Docker Compose

---

## Justificación de tecnologías

### NestJS
Se eligió NestJS porque permite construir una API REST estructurada, mantenible y escalable dentro del ecosistema Node.js. Su organización modular facilita la separación de responsabilidades entre controladores, servicios y entidades.

### PostgreSQL + PostGIS
PostgreSQL es un sistema de gestión de bases de datos robusto y ampliamente utilizado. Se eligió junto con PostGIS porque el proyecto requiere almacenar coordenadas geográficas y realizar consultas espaciales, como búsquedas por proximidad.

### Nginx
Se eligió Nginx porque funciona como punto de entrada único al sistema. Además de servir el frontend estático, permite redirigir las solicitudes hacia la API REST del backend.

### Docker Compose
Se utilizó Docker Compose porque permite orquestar todos los contenedores de forma centralizada, facilitando la construcción, ejecución y detención de todo el sistema con pocos comandos.

---

## Arquitectura de la solución

El sistema está compuesto por los siguientes servicios:

### 1. `db`
Contenedor con PostgreSQL y PostGIS.
- Almacena las categorías, subcategorías y puntos de interés.
- Usa volumen persistente para conservar datos.
- Ejecuta scripts de inicialización y seeding al crear la base por primera vez.

### 2. `app`
Contenedor con la API REST en NestJS.
- Expone la lógica de negocio.
- Se conecta al contenedor `db`.
- Atiende solicitudes que llegan desde Nginx.

### 3. `nginx`
Contenedor que:
- Sirve el frontend estático ubicado en `web/`.
- Redirige las solicitudes `/api` hacia el backend NestJS.
- Funciona como punto de entrada principal del sistema.

---

## Estructura del repositorio

```text
geo-points-api/
├── app/
│   ├── src/
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── services/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── docker/
│   ├── nginx/
│   │   └── default.conf
│   └── postgres/
│       └── init/
│           ├── 01-init.sql
│           └── 02-seed.sql
│
├── web/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── docker-compose.yml
├── .env
└── README.md
