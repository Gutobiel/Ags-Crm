import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { Empresa } from './empresa.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('empresas')
@UseGuards(JwtAuthGuard)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  create(@Body() empresaData: Partial<Empresa>): Promise<Empresa> {
    return this.empresasService.create(empresaData);
  }

  @Get()
  findAll(): Promise<Empresa[]> {
    return this.empresasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Empresa | null> {
    return this.empresasService.findOne(+id);
  }

  @Get(':id/check-relations')
  checkRelations(@Param('id') id: string) {
    return this.empresasService.checkEmpresaRelations(+id);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.empresasService.toggleStatus(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() empresaData: Partial<Empresa>,
  ): Promise<Empresa | null> {
    return this.empresasService.update(+id, empresaData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.empresasService.remove(+id);
  }
}
