import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './config/typeOrm.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import {AuthModule} from "./app/auth/auth.module";
import {UserModule} from "./app/user/user.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..'),
      serveRoot: '/docs',
    }),
    TypeOrmModule.forRoot(TypeOrmConfig),
      AuthModule,
      UserModule,
  ],
  exports: [],
})
export class AppModule {}
