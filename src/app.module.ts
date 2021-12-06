import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './config/typeOrm.config';

@Module({
  imports: [TypeOrmModule.forRoot(TypeOrmConfig)],
  exports: [],
})
export class AppModule {}
