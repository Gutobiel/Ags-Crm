import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Branding } from './branding.entity';
import { BrandingService } from './branding.service';
import { BrandingController } from './branding.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Branding]),
    MulterModule.register({
      dest: './uploads/branding',
    }),
  ],
  controllers: [BrandingController],
  providers: [BrandingService],
  exports: [BrandingService],
})
export class BrandingModule {}
