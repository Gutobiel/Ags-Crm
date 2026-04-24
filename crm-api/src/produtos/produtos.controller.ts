import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { Produto } from './produto.entity';
import { Categoria } from './categoria.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('produtos')
@UseGuards(JwtAuthGuard)
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) { }

  @Post()
  create(@Body() produtoData: Partial<Produto>): Promise<Produto> {
    return this.produtosService.create(produtoData);
  }

  @Get()
  findAll(): Promise<Produto[]> {
    return this.produtosService.findAll();
  }

  @Get('ativos')
  findAtivos(): Promise<Produto[]> {
    return this.produtosService.findAtivos();
  }

  @Get('categorias')
  findAllCategorias(): Promise<Categoria[]> {
    return this.produtosService.findAllCategorias();
  }

  @Get('categorias/ativas')
  findCategoriasAtivas(): Promise<Categoria[]> {
    return this.produtosService.findCategoriasAtivas();
  }

  @Post('categorias')
  createCategoria(@Body() body: { nome: string }): Promise<Categoria> {
    return this.produtosService.createCategoria(body.nome);
  }

  @Put('categorias/:id')
  updateCategoria(
    @Param('id') id: string,
    @Body() body: Partial<Categoria>,
  ): Promise<Categoria | null> {
    return this.produtosService.updateCategoria(+id, body);
  }

  @Delete('categorias/:id')
  removeCategoria(@Param('id') id: string): Promise<void> {
    return this.produtosService.removeCategoria(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Produto | null> {
    return this.produtosService.findOne(+id);
  }

  @Put(':id')
  updateProduto(
    @Param('id') id: string,
    @Body() produtoData: Partial<Produto>,
  ): Promise<Produto | null> {
    return this.produtosService.update(+id, produtoData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.produtosService.remove(+id);
  }

}

