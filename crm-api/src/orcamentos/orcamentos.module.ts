import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orcamento } from './orcamento.entity';
import { OrcamentosController } from './orcamentos.controller';
import { OrcamentosService } from './orcamentos.service';


@Module({
  imports: [TypeOrmModule.forFeature([Orcamento])],
  controllers: [OrcamentosController],
  providers: [OrcamentosService],
  exports: [OrcamentosService],
})
export class OrcamentosModule {}
