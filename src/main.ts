import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {enableSwagger} from "./plugins/swagger";
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  enableSwagger(app);
  app.use(cookieParser());
  await app.listen(1337);
}
bootstrap();
