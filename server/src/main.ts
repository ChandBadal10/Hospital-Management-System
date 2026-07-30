import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Cookie Parser
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Hospital Management API')
    .setDescription('Hospital Management System Backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 5000);

  console.log(
    ` Server running at http://localhost:${process.env.PORT || 5000}/api`,
  );

  // console.log(
  //   `Swagger Docs: http://localhost:${process.env.PORT || 5000}/api/docs`,
  // );
}

bootstrap();