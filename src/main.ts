import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {enableSwagger} from "./plugins/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  enableSwagger(app);
  await app.listen(1337);
}
bootstrap();
