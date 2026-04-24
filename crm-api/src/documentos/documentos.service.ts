import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento, TipoDocumento } from './documento.entity';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private documentosRepository: Repository<Documento>,
  ) {}

  async create(documentoData: {
    nome: string;
    tipo: TipoDocumento;
    arquivo: string;
    mimeType: string;
    tamanho: number;
    conteudo: Buffer;
    empresa: { id: number };
    usuario?: { id: number };
    observacoes?: string;
  }): Promise<Documento> {
    const documento = this.documentosRepository.create(documentoData);
    return this.documentosRepository.save(documento);
  }

  async findAll(): Promise<Documento[]> {
    return this.documentosRepository.find({
      relations: ['empresa', 'usuario'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmpresa(empresaId: number): Promise<Documento[]> {
    return this.documentosRepository.find({
      where: { empresa: { id: empresaId } },
      relations: ['empresa', 'usuario'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Documento | null> {
    return this.documentosRepository.findOne({
      where: { id },
      relations: ['empresa', 'usuario'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.documentosRepository.delete(id);
  }
}
