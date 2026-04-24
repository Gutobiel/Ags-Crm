import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeadsService } from './leads.service';
import { Lead, LeadStage, LeadStatus, TipoServico, OrigemLead, TagNegociacao, TagContrato } from './lead.entity';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async create(
    @Body()
    createLeadDto: {
      nomeResponsavel: string;
      empresa?: string;
      cnpjCpf?: string;
      localidade?: string;
      email?: string;
      telefone?: string;
      valorEstimado?: number;
      observacoes?: string;
      responsavel_id?: number;
      servico?: TipoServico;
      origem?: OrigemLead;
      statusNegociacao?: LeadStatus;
      tagNegociacao?: TagNegociacao;
      tagContrato?: TagContrato;
      proximaData?: string | Date;
      andamento?: string;
      etapa?: LeadStage;
      consultaSerasa?: string;
      preOrcamento?: string;
      cpfObrigatorio?: boolean;
      tipoPessoa?: string;
      cep?: string;
      latitude?: number;
      longitude?: number;
    },
    @Request() req,
  ): Promise<Lead> {
    return this.leadsService.create(createLeadDto, req.user);
  }

  @Get()
  async findAll(@Request() req): Promise<Lead[]> {
    return this.leadsService.findAll(req.user);
  }

  @Get('stage/:stage')
  async findByStage(@Param('stage') stage: LeadStage, @Request() req): Promise<Lead[]> {
    return this.leadsService.findByStage(stage, req.user);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<Lead | null> {
    return this.leadsService.findOne(id, req.user);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeadDto: Partial<Lead>,
    @Request() req,
  ): Promise<Lead | null> {
    return this.leadsService.update(id, updateLeadDto, req.user);
  }

  @Put(':id/stage')
  async updateStage(
    @Param('id', ParseIntPipe) id: number,
    @Body('etapa') etapa: LeadStage,
    @Request() req,
  ): Promise<Lead | null> {
    return this.leadsService.updateStage(id, etapa, req.user);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    return this.leadsService.remove(id, req.user);
  }
}
