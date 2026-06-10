import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { Equipment } from './entities/equipment.entity';
import { RedisService } from '../redis/redis.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/create-room.dto';
import { CreateEquipmentDto } from './dto/create-equipment.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    private redisService: RedisService,
  ) {}

  async findAll(): Promise<Room[]> {
    const cached = await this.redisService.get('rooms:all');
    if (cached) {
      return JSON.parse(cached);
    }
    const rooms = await this.roomRepository.find({ relations: ['equipment'] });
    await this.redisService.set('rooms:all', JSON.stringify(rooms), 300);
    return rooms;
  }

  async findById(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id }, relations: ['equipment'] });
    if (!room) {
      throw new NotFoundException('会议室不存在');
    }
    return room;
  }

  async create(dto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create(dto);
    const saved = await this.roomRepository.save(room);
    await this.redisService.del('rooms:all');
    return saved;
  }

  async update(id: number, dto: UpdateRoomDto): Promise<Room> {
    await this.roomRepository.update(id, dto);
    await this.redisService.del('rooms:all');
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.roomRepository.delete(id);
    await this.redisService.del('rooms:all');
  }

  async addEquipment(dto: CreateEquipmentDto): Promise<Equipment> {
    const room = await this.findById(dto.roomId);
    const equipment = this.equipmentRepository.create(dto);
    const saved = await this.equipmentRepository.save(equipment);
    await this.redisService.del('rooms:all');
    return saved;
  }

  async removeEquipment(id: number): Promise<void> {
    await this.equipmentRepository.delete(id);
    await this.redisService.del('rooms:all');
  }

  async updateEquipmentStatus(id: number, status: string): Promise<Equipment> {
    await this.equipmentRepository.update(id, { status });
    await this.redisService.del('rooms:all');
    return this.equipmentRepository.findOne({ where: { id } });
  }
}
