import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Appointment } from '../appointments/appointments.entity';
import { Sale } from '../sales/sales.entity';
import { Service } from '../services/services.entity';

@Entity()
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'time', nullable: true })
  workingHoursStart: string;

  @Column({ type: 'time', nullable: true })
  workingHoursEnd: string;

  @OneToMany(() => User, user => user.branch)
  users: User[];

  @OneToMany(() => Appointment, appointment => appointment.branch)
  appointments: Appointment[];

  @OneToMany(() => Sale, sale => sale.branch)
  sales: Sale[];

  @OneToMany(() => Service, service => service.branch)
  services: Service[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 