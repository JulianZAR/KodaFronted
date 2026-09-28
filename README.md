# NutriGO Frontend

Frontend de la aplicación NutriGO - Sistema de seguimiento nutricional personalizado.

## 🌳 Estructura de Ramas

Este repositorio implementa un flujo de trabajo Git con tres ramas principales:

### 📋 Ramas

- **`desarrollo`**: Rama de desarrollo activo donde se integran todas las nuevas funcionalidades
- **`preproduccion`**: Rama de pruebas pre-producción para validación final antes de desplegar
- **`produccion`**: Rama de producción que contiene el código estable desplegado

### 🔄 Flujo de Trabajo

```
desarrollo → preproduccion → produccion
```

1. Los desarrolladores trabajan en `desarrollo`
2. Cuando una versión está lista, se fusiona a `preproduccion` para testing
3. Después de validar en preproducción, se fusiona a `produccion` para despliegue

## 🚀 Tecnologías

- **Angular** v18.2.21
- **TypeScript**
- **Keycloak** para autenticación
- **RxJS** para manejo reactivo de datos

## 📦 Instalación

```bash
npm install
```

## 🛠️ Desarrollo

Ejecutar servidor de desarrollo:

```bash
ng serve
```

Navegar a `http://localhost:4200/`

## 🏗️ Build

```bash
ng build
```

Los artefactos se almacenarán en el directorio `dist/`

## 👨‍💻 Autor

**Julian Villamizar**
- Email: julian.villamizar200@gmail.com
- GitHub: [@JulianZAR](https://github.com/JulianZAR)

## 📝 Licencia

Proyecto académico - Universidad
