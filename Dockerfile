# =====================================================================
# Etapa 1: BUILD — Construye la aplicacion Angular
# =====================================================================
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (mejor cache de capas)
COPY package.json package-lock.json ./

# Instalar dependencias de forma reproducible
RUN npm ci

# Copiar el resto del codigo fuente
COPY . .

# Construir la aplicacion en modo produccion
RUN npm run build -- --configuration production

# =====================================================================
# Etapa 2: SERVE — Servir la app con Nginx
# =====================================================================
FROM nginx:1.27-alpine AS serve

# Eliminar la configuracion por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuracion personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados desde la etapa de build
COPY --from=build /app/dist/nutrigo-frontend/browser /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Nginx arranca en primer plano
CMD ["nginx", "-g", "daemon off;"]
