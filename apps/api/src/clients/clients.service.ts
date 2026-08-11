import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client) private readonly clients: Repository<Client>,
  ) {}

  findAll(userId: string, q?: string) {
    const qb = this.clients
      .createQueryBuilder('c')
      .where('c.userId = :userId', { userId })
      .orderBy('c.name', 'ASC');
    if (q?.trim()) {
      qb.andWhere(
        '(LOWER(c.name) LIKE :q OR LOWER(c.email) LIKE :q OR LOWER(c.company) LIKE :q)',
        { q: `%${q.toLowerCase()}%` },
      );
    }
    return qb.getMany();
  }

  async findOne(userId: string, id: string) {
    const client = await this.clients.findOne({ where: { id, userId } });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  create(userId: string, dto: CreateClientDto) {
    const client = this.clients.create({ ...dto, userId });
    return this.clients.save(client);
  }

  async update(userId: string, id: string, dto: UpdateClientDto) {
    const client = await this.findOne(userId, id);
    Object.assign(client, dto);
    return this.clients.save(client);
  }

  async remove(userId: string, id: string) {
    const client = await this.findOne(userId, id);
    await this.clients.remove(client);
    return { ok: true };
  }
}
