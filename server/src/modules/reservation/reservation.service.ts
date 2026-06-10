import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto, UpdateReservationDto } from './dto/create-reservation.dto';
import { RoomService } from '../room/room.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private roomService: RoomService,
    private redisService: RedisService,
  ) {}

  async checkConflict(roomId: number, startTime: Date, endTime: Date, excludeId?: number): Promise<boolean> {
    const lockKey = `reservation:lock:${roomId}`;
    const locked = await this.redisService.setNx(lockKey, '1', 5);
    if (!locked) {
      throw new ConflictException('该会议室正在被预约，请稍后重试');
    }
    try {
      const query = this.reservationRepository
        .createQueryBuilder('r')
        .where('r.roomId = :roomId', { roomId })
        .andWhere('r.status IN (:...statuses)', { statuses: ['pending', 'confirmed'] })
        .andWhere('r.startTime < :endTime AND r.endTime > :startTime', { startTime, endTime });

      if (excludeId) {
        query.andWhere('r.id != :excludeId', { excludeId });
      }

      const conflict = await query.getOne();
      return !!conflict;
    } finally {
      await this.redisService.del(lockKey);
    }
  }

  async create(userId: number, dto: CreateReservationDto): Promise<Reservation> {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('结束时间必须大于开始时间');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('开始时间不能早于当前时间');
    }

    await this.roomService.findById(dto.roomId);

    const hasConflict = await this.checkConflict(dto.roomId, startTime, endTime);
    if (hasConflict) {
      throw new ConflictException('该时间段会议室已被预约');
    }

    const reservation = this.reservationRepository.create({
      ...dto,
      userId,
      startTime,
      endTime,
      status: 'pending',
    });
    return this.reservationRepository.save(reservation);
  }

  async findAll(userId?: number, roomId?: number, status?: string): Promise<Reservation[]> {
    const query = this.reservationRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')
      .leftJoinAndSelect('r.room', 'room')
      .select(['r', 'user.id', 'user.name', 'user.username', 'room.id', 'room.name', 'room.location']);

    if (userId) {
      query.andWhere('r.userId = :userId', { userId });
    }
    if (roomId) {
      query.andWhere('r.roomId = :roomId', { roomId });
    }
    if (status) {
      query.andWhere('r.status = :status', { status });
    }

    return query.orderBy('r.startTime', 'DESC').getMany();
  }

  async findById(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'room', 'checkins'],
    });
    if (!reservation) {
      throw new NotFoundException('预约不存在');
    }
    return reservation;
  }

  async update(id: number, dto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findById(id);

    if (dto.startTime || dto.endTime) {
      const startTime = dto.startTime ? new Date(dto.startTime) : reservation.startTime;
      const endTime = dto.endTime ? new Date(dto.endTime) : reservation.endTime;

      const hasConflict = await this.checkConflict(reservation.roomId, startTime, endTime, id);
      if (hasConflict) {
        throw new ConflictException('该时间段会议室已被预约');
      }
    }

    await this.reservationRepository.update(id, dto);
    return this.findById(id);
  }

  async confirm(id: number): Promise<Reservation> {
    await this.reservationRepository.update(id, { status: 'confirmed' });
    return this.findById(id);
  }

  async cancel(id: number): Promise<Reservation> {
    await this.reservationRepository.update(id, { status: 'cancelled' });
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.reservationRepository.delete(id);
  }

  async findByDateRange(roomId: number, startDate: string, endDate: string): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: {
        roomId,
        startTime: Between(new Date(startDate), new Date(endDate)),
        status: 'confirmed',
      },
      relations: ['user'],
    });
  }

  async autoReleaseExpired(): Promise<number> {
    const now = new Date();
    const expiredReservations = await this.reservationRepository
      .createQueryBuilder('r')
      .where('r.status = :status', { status: 'confirmed' })
      .andWhere('r.endTime < :now', { now })
      .getMany();

    if (expiredReservations.length === 0) {
      return 0;
    }

    await this.reservationRepository
      .createQueryBuilder()
      .update(Reservation)
      .set({ status: 'completed' })
      .where('status = :status AND endTime < :now', { status: 'confirmed', now })
      .execute();

    return expiredReservations.length;
  }
}
