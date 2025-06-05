import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointments.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async findAll(query: any) {
    const { status, branchId, startDate, endDate, clientId, source, page = 1, limit = 10 } = query;
    
    const queryBuilder = this.appointmentRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.client', 'client')
      .leftJoinAndSelect('appointment.service', 'service')
      .leftJoinAndSelect('appointment.branch', 'branch');

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (branchId) {
      queryBuilder.andWhere('appointment.branchId = :branchId', { branchId });
    }

    if (clientId) {
      queryBuilder.andWhere('appointment.clientId = :clientId', { clientId });
    }
    
    if (source) {
      queryBuilder.andWhere('appointment.source = :source', { source });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('appointment.startTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('appointment.startTime >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('appointment.startTime <= :endDate', { endDate });
    }

    const skip = (page - 1) * limit;
    const [appointments, total] = await queryBuilder
      .orderBy('appointment.startTime', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: appointments,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    };
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['client', 'service', 'branch']
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async create(data: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointmentRepository.create(data);
    return await this.appointmentRepository.save(appointment);
  }

  async update(id: number, data: Partial<Appointment>): Promise<Appointment> {
    await this.appointmentRepository.update(id, data);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const appointment = await this.findOne(id);
    const appointmentId = appointment.id;
    await this.appointmentRepository.remove(appointment);
    return { id: appointmentId };
  }
} 