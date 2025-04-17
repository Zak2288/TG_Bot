import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './clients.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Source } from '../../shared/enums/source.enum';
import { Cache } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @Inject('CACHE_MANAGER')
    private cacheManager: Cache
  ) {}

  async findAll(options?: any): Promise<Client[]> {
    return this.clientRepository.find(options);
  }

  async findOne(id: number): Promise<Client | null> {
    const startTime = Date.now();
    try {
      // Проверяем кэш
      const cachedClient = await this.cacheManager.get<Client>(`client:${id}`);
      if (cachedClient) {
        const endTime = Date.now();
        this.logger.log(`Клиент получен из кэша за ${endTime - startTime}ms`);
        return cachedClient;
      }

      // Если нет в кэше, получаем из БД
      const client = await this.clientRepository.findOne({ where: { id } });
      if (client) {
        await this.cacheManager.set(`client:${id}`, client, 30000);
      }

      const endTime = Date.now();
      this.logger.log(`Время получения клиента из БД: ${endTime - startTime}ms`);
      
      return client;
    } catch (error) {
      this.logger.error(`Ошибка при получении клиента: ${error.message}`);
      throw error;
    }
  }

  async findByPhone(phone: string): Promise<Client | null> {
    return this.clientRepository.findOne({ where: { phone } });
  }

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const startTime = Date.now();
    try {
      const clientData: Partial<Client> = {
        ...createClientDto,
        source: createClientDto.source ? createClientDto.source as unknown as Source : undefined
      };
      
      const client = this.clientRepository.create(clientData);
      const savedClient = await this.clientRepository.save(client);
      
      // Кэшируем клиента
      await this.cacheManager.set(`client:${savedClient.id}`, savedClient, 30000);
      
      const endTime = Date.now();
      this.logger.log(`Время создания клиента: ${endTime - startTime}ms`);
      
      return savedClient;
    } catch (error) {
      this.logger.error(`Ошибка при создании клиента: ${error.message}`);
      throw error;
    }
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const clientData: Partial<Client> = {
      ...updateClientDto,
      source: updateClientDto.source ? updateClientDto.source as unknown as Source : undefined
    };
    
    await this.clientRepository.update(id, clientData);
    const updated = await this.clientRepository.findOne({ where: { id } });
    if (!updated) {
      throw new NotFoundException(`Клиент с ID ${id} не найден`);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    const result = await this.clientRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Клиент с ID ${id} не найден`);
    }
  }
} 