<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Teslo API

1. Clonar proyecto
2. `yarn install`
3. Clonar el archivo `.env.template` y renombrarlo a `.env`
4. Cambiar las variables de entorno
5. Levantar la base de datos

```
docker-compose up -d
```

6. Levantar:

npm run start:dev
yarn start:dev

```

7. Ejecutar SEED manual si hace falta

```
http://localhost:3000/api/seed
```

> Nota: si la base de datos está vacía, el backend ahora ejecuta el seed automáticamente al iniciar.

# Production notes:
