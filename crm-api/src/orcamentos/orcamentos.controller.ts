import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrcamentosService } from './orcamentos.service';
import { Orcamento, StatusOrcamento, StatusPagamento } from './orcamento.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orcamentos')
@UseGuards(JwtAuthGuard)
export class OrcamentosController {
  constructor(private readonly orcamentosService: OrcamentosService) {}

  @Post()
  create(
    @Body() orcamentoData: Partial<Orcamento>,
    @Request() req,
  ): Promise<Orcamento> {
    return this.orcamentosService.create(orcamentoData, req.user.userId);
  }

  @Get()
  findAll(
    @Query('status') status?: StatusOrcamento,
    @Query('statusPagamento') statusPagamento?: StatusPagamento,
  ): Promise<Orcamento[]> {
    return this.orcamentosService.findAll(status, statusPagamento);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Orcamento | null> {
    return this.orcamentosService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() orcamentoData: Partial<Orcamento>,
  ): Promise<Orcamento | null> {
    return this.orcamentosService.update(+id, orcamentoData);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: StatusOrcamento,
  ): Promise<Orcamento | null> {
    return this.orcamentosService.updateStatus(+id, status);
  }

  @Put(':id/status-pagamento')
  updateStatusPagamento(
    @Param('id') id: string,
    @Body('statusPagamento') statusPagamento: StatusPagamento,
  ): Promise<Orcamento | null> {
    return this.orcamentosService.updateStatusPagamento(+id, statusPagamento);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.orcamentosService.remove(+id);
  }
}
