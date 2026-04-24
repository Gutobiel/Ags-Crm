import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tb_produtos_categorias')
export class Categoria {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true })
    nome: string;

    @Column({ default: true })
    ativo: boolean;
}
