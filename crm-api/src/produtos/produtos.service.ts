import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto, TipoProduto } from './produto.entity';
import { Categoria } from './categoria.entity';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private produtosRepository: Repository<Produto>,
    @InjectRepository(Categoria)
    private categoriasRepository: Repository<Categoria>,
  ) { }

  async create(produtoData: Partial<Produto>): Promise<Produto> {
    const produto = this.produtosRepository.create(produtoData);
    return this.produtosRepository.save(produto);
  }

  async findAll(): Promise<Produto[]> {
    return this.produtosRepository.find({ order: { nome: 'ASC' } });
  }

  async findAtivos(): Promise<Produto[]> {
    return this.produtosRepository.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Produto | null> {
    return this.produtosRepository.findOne({ where: { id } });
  }

  async update(id: number, produtoData: Partial<Produto>): Promise<Produto | null> {
    await this.produtosRepository.update(id, produtoData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.produtosRepository.delete(id);
  }

  // Categorias
  async findAllCategorias(): Promise<Categoria[]> {
    return this.categoriasRepository.find({ order: { nome: 'ASC' } });
  }

  async findCategoriasAtivas(): Promise<Categoria[]> {
    return this.categoriasRepository.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async createCategoria(nome: string): Promise<Categoria> {
    const categoria = this.categoriasRepository.create({ nome });
    return this.categoriasRepository.save(categoria);
  }

  async updateCategoria(id: number, categoriaData: Partial<Categoria>): Promise<Categoria | null> {
    await this.categoriasRepository.update(id, categoriaData);
    return this.findOneCategoria(id);
  }

  async removeCategoria(id: number): Promise<void> {
    await this.categoriasRepository.delete(id);
  }

  async findOneCategoria(id: number): Promise<Categoria | null> {
    return this.categoriasRepository.findOne({ where: { id } });
  }
}
