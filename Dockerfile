# 1. Usar la versión de Node que tienes en tu PC
FROM node:22.12.0-slim

# 2. Crear carpeta de trabajo
WORKDIR /app

# 3. Copiar todo el proyecto
COPY . .

# 4. Instalar dependencias entrando a la carpeta backend
# Usamos el flag --prefix para no tener problemas de rutas
RUN npm install --prefix backend

# 5. Informar el puerto
EXPOSE 3000

# 6. Ejecutar el servidor directamente señalando la ruta
# IMPORTANTE: Asegúrate que el archivo se llame index.js
CMD ["node", "backend/index.js"]