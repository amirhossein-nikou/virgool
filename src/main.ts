import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { SwaggerConfigInit } from './config/swagger.config';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe);
  app.useStaticAssets("public")  
  SwaggerConfigInit(app)
  app.use(cookieParser(process.env.COOKIE_SECRET))
  const {PORT,DB_HOST} = process.env
  await app.listen(3000, () => {
    console.log(`http://${DB_HOST}:${PORT}`)
    console.log(`http://${DB_HOST}:${PORT}/swagger#/`)
  });
}
bootstrap();
