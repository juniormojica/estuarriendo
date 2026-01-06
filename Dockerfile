# 1. Usamos exactamente la versión que tienes instalada
FROM node:22.12.0-slim

# 2. Definimos el directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos todo tu proyecto
COPY . .

# 4. Entramos a la carpeta backend e instalamos dependencias
RUN cd backend && npm install

# 5. Exponemos el puerto que usa tu servidor (por defecto 3000)
EXPOSE 3000

# 6. Comando para iniciar tu aplicación
CMD ["node", "backend/server.js"]