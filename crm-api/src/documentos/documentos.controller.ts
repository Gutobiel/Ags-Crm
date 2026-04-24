import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentosService } from './documentos.service';
import { Documento, TipoDocumento } from './documento.entity';
import { memoryStorage } from 'multer';
import type { Response } from 'express';

@Controller('documentos')
@UseGuards(JwtAuthGuard)
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async upload(
    @UploadedFile() file: any,
    @Body('tipo') tipo: TipoDocumento,
    @Body('empresaId') empresaId: string,
    @Body('observacoes') observacoes?: string,
  ): Promise<Documento> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    return this.documentosService.create({
      nome: file.originalname,
      tipo,
      arquivo: file.originalname,
      mimeType: file.mimetype,
      tamanho: file.size,
      conteudo: file.buffer,
      empresa: { id: parseInt(empresaId) },
      observacoes,
    });
  }

  @Get()
  async findAll(): Promise<Documento[]> {
    return this.documentosService.findAll();
  }

  @Get('empresa/:empresaId')
  async findByEmpresa(
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ): Promise<Documento[]> {
    return this.documentosService.findByEmpresa(empresaId);
  }

  @Get('download/:id')
  async download(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const documento = await this.documentosService.findOne(id);
    if (!documento) {
      throw new BadRequestException('Documento não encontrado');
    }

    res.setHeader('Content-Type', documento.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${documento.nome}"`);
    res.send(documento.conteudo);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.documentosService.remove(id);
  }
}
