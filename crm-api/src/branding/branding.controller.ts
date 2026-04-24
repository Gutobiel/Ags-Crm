import { Controller, Get, Put, Body, Post, Delete, UseInterceptors, UploadedFile, Res, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Response } from 'express';
import { existsSync, unlinkSync } from 'fs';
import { BrandingService } from './branding.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const brandingStorage = diskStorage({
  destination: './uploads/branding',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('branding')
export class BrandingController {
  constructor(private brandingService: BrandingService) {}

  // GET público — qualquer um pode buscar o branding (necessário para tela de login)
  @Get()
  async get() {
    return this.brandingService.get();
  }

  // PUT protegido — apenas admin pode alterar
  @Put()
  @UseGuards(JwtAuthGuard)
  async update(@Body() body: any) {
    return this.brandingService.update(body);
  }

  // Upload de logo
  @Post('logo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: brandingStorage }))
  async uploadLogo(@UploadedFile() file: any) {
    return this.brandingService.updateLogo(file.filename);
  }

  // Upload de favicon
  @Post('favicon')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: brandingStorage }))
  async uploadFavicon(@UploadedFile() file: any) {
    return this.brandingService.updateFavicon(file.filename);
  }

  // Upload de imagem de fundo do login (máximo 3)
  @Post('login-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: brandingStorage }))
  async uploadLoginImage(@UploadedFile() file: any) {
    const branding = await this.brandingService.get();
    const currentImages: string[] = branding.loginImages ? JSON.parse(branding.loginImages) : [];
    
    if (currentImages.length >= 3) {
      // Remover o arquivo que acabou de ser enviado
      const filePath = join(process.cwd(), 'uploads', 'branding', file.filename);
      if (existsSync(filePath)) unlinkSync(filePath);
      throw new BadRequestException('Limite máximo de 3 imagens de fundo atingido. Remova uma antes de adicionar outra.');
    }
    
    currentImages.push(file.filename);
    return this.brandingService.update({ loginImages: JSON.stringify(currentImages) });
  }

  // Remover imagem de fundo do login
  @Delete('login-image/:filename')
  @UseGuards(JwtAuthGuard)
  async deleteLoginImage(@Param('filename') filename: string) {
    const branding = await this.brandingService.get();
    const currentImages: string[] = branding.loginImages ? JSON.parse(branding.loginImages) : [];
    
    const filtered = currentImages.filter(img => img !== filename);
    
    // Remover arquivo do disco
    const filePath = join(process.cwd(), 'uploads', 'branding', filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
    
    return this.brandingService.update({ loginImages: JSON.stringify(filtered) });
  }

  // Servir arquivos de branding (logos, favicons, imagens de login)
  @Get('file/:filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', 'branding', filename);
    if (existsSync(filePath)) {
      return (res as any).sendFile(filePath);
    }
    return (res as any).status(404).json({ message: 'Arquivo não encontrado' });
  }
}
