import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { EmpresasModule } from './empresas/empresas.module';
import { ProdutosModule } from './produtos/produtos.module';
import { OrcamentosModule } from './orcamentos/orcamentos.module';
import { DocumentosModule } from './documentos/documentos.module';
import { BrandingModule } from './branding/branding.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<string>('DATABASE_URL') ? 'postgres' : 'mysql',
        url: config.get<string>('DATABASE_URL'), // Se existir a URL, ele ignora os de baixo
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '3306'), 10),
        username: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASS', 'root'),
        database: config.get<string>('DB_NAME', 'crm_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    LeadsModule,
    EmpresasModule,
    ProdutosModule,
    OrcamentosModule,
    DocumentosModule,
    BrandingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
