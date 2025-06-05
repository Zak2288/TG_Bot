import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Branch } from '../branches/branches.entity';
import { Role } from '../../shared/enums/role.enum';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    default: Role.STAFF
  })
  role: Role;

  @Column({ nullable: true })
  branchId: number;

  @ManyToOne(() => Branch, branch => branch.users)
  branch: Branch;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 