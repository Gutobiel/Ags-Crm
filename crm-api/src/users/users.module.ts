import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Lead } from '../leads/lead.entity';
import { Orcamento } from '../orcamentos/orcamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Lead, Orcamento])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
