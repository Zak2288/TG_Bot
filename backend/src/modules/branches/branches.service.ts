import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './branches.entity';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) {}

  async findAll(): Promise<Branch[]> {
    return this.branchRepository.find();
  }

  async findOne(id: number): Promise<Branch> {
    const branch = await this.branchRepository.findOne({ where: { id } });
    if (!branch) {
      throw new NotFoundException(`Филиал с ID ${id} не найден`);
    }
    return branch;
  }

  async create(branchData: Partial<Branch>): Promise<Branch> {
    const branch = this.branchRepository.create(branchData);
    return this.branchRepository.save(branch);
  }

  async update(id: number, branchData: Partial<Branch>): Promise<Branch> {
    await this.branchRepository.update(id, branchData);
    const updated = await this.branchRepository.findOne({ where: { id } });
    if (!updated) {
      throw new NotFoundException(`Филиал с ID ${id} не найден`);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    const result = await this.branchRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Филиал с ID ${id} не найден`);
    }
  }
} 