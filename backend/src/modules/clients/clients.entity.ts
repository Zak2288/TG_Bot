import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Appointment } from '../appointments/appointments.entity';
import { Sale } from '../sales/sales.entity';
import { Source } from '../../shared/enums/source.enum';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: Source,
    default: Source.OTHER
  })
  source: Source;

  @OneToMany(() => Appointment, appointment => appointment.client)
  appointments: Appointment[];

  @OneToMany(() => Sale, sale => sale.client)
  sales: Sale[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 