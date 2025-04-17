import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from '../clients/clients.entity';
import { Service } from '../services/services.entity';
import { Branch } from '../branches/branches.entity';
import { AppointmentStatus } from '../../shared/enums/appointment-status.enum';
import { Source } from '../../shared/enums/source.enum';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clientId: number;

  @Column()
  branchId: number;

  @Column()
  serviceId: number;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED
  })
  status: AppointmentStatus;

  @Column({
    type: 'enum',
    enum: Source,
    default: Source.OTHER
  })
  source: Source;

  @Column({ nullable: true })
  sourceId: string;

  @Column({ nullable: true })
  cancellationReason: string;

  @ManyToOne(() => Client, client => client.appointments)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;
} 