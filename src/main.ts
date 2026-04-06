import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Simplificado el import
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Simplificado el import
import { AllExeptionsFilter } from './common/filtrers/http-exeptions.filter';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. HABILITAR CORS (Vital para que Swagger no de "Failed to fetch")
  app.enableCors();


  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));

  app.useGlobalFilters(new AllExeptionsFilter());
  
  const config = new DocumentBuilder()
    .setTitle('API Con vulnerabilidades de seguridad') // Corregido typo
    .setDescription('Documento de API')
    .setVersion('1.0.0')
    .addTag('tasks') // Opcional: para organizar tus rutas
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // 3. CAMBIAR RUTA DE DOCS (Opcional, pero común dejarlo en /docs o api/docs)
  SwaggerModule.setup('api/docs', app, document); 

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

//? MySQL
//!npm i mysql2
//?npm i @types/mysql -D

//? Postgrest
//? npm i pg
//? npm i @types/pg -D

//?Swagger
// npm install --save @nestjs/swagger

