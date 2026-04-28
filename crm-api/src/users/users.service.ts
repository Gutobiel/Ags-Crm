import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { Lead } from '../leads/lead.entity';
import { Orcamento } from '../orcamentos/orcamento.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @InjectRepository(Orcamento)
    private orcamentosRepository: Repository<Orcamento>,
  ) {}

  async create(userData: {
    nome: string;
    cpf: string;
    funcao: UserRole;
    email: string;
    password: string;
  }): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [{ email: userData.email }, { cpf: userData.cpf }],
    });

    if (existingUser) {
      throw new ConflictException('Email ou CPF já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { nome: 'ASC' } });
  }

  async toggleStatus(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    user.ativo = !user.ativo;
    return this.usersRepository.save(user);
  }

  async update(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }

  async checkUserRelations(id: number): Promise<{ hasRelations: boolean; relations: string[] }> {
    const relations: string[] = [];
    
    // Verificar leads como responsável
    const leadsCount = await this.leadsRepository.count({ 
      where: { responsavel_id: id } 
    });
    if (leadsCount > 0) {
      relations.push(`${leadsCount} lead(s)`);
    }
    
    // Verificar orçamentos como responsável
    const orcamentosCount = await this.orcamentosRepository.count({ 
      where: { responsavel: { id } } 
    });
    if (orcamentosCount > 0) {
      relations.push(`${orcamentosCount} orçamento(s)`);
    }
    
    return {
      hasRelations: relations.length > 0,
      relations
    };
  }

  async remove(id: number): Promise<void> {
    try {
      await this.usersRepository.delete(id);
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException('Não é possível excluir este usuário pois existem dados relacionados a ele. Considere inativá-lo ao invés de excluir.');
      }
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }
}
