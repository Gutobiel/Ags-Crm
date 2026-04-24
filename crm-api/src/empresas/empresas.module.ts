import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';
import { Empresa } from './empresa.entity';
import { Lead } from '../leads/lead.entity';
import { Orcamento } from '../orcamentos/orcamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Empresa, Lead, Orcamento])],
  controllers: [EmpresasController],
  providers: [EmpresasService],
  exports: [EmpresasService],
})
export class EmpresasModule {}
