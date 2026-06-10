import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation } from '../reservation/entities/reservation.entity';
import { Room } from '../room/entities/room.entity';
import { Checkin } from '../checkin/entities/checkin.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Checkin)
    private checkinRepository: Repository<Checkin>,
    private redisService: RedisService,
  ) {}

  async getRoomUsageRate(startDate: string, endDate: string) {
    const cacheKey = `stats:room_usage:${startDate}:${endDate}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const rooms = await this.roomRepository.find();
    const result = [];

    for (const room of rooms) {
      const totalReservations = await this.reservationRepository.count({
        where: {
          roomId: room.id,
          status: 'confirmed',
          startTime: Between(new Date(startDate), new Date(endDate)),
        },
      });

      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const totalSlots = days * 8;

      result.push({
        roomId: room.id,
        roomName: room.name,
        location: room.location,
        totalReservations,
        usageRate: totalSlots > 0 ? parseFloat(((totalReservations / totalSlots) * 100).toFixed(2)) : 0,
      });
    }

    await this.redisService.set(cacheKey, JSON.stringify(result), 600);
    return result;
  }

  async getReservationStats(startDate: string, endDate: string) {
    const cacheKey = `stats:reservations:${startDate}:${endDate}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const total = await this.reservationRepository.count({
      where: { startTime: Between(new Date(startDate), new Date(endDate)) },
    });

    const confirmed = await this.reservationRepository.count({
      where: { startTime: Between(new Date(startDate), new Date(endDate)), status: 'confirmed' },
    });

    const cancelled = await this.reservationRepository.count({
      where: { startTime: Between(new Date(startDate), new Date(endDate)), status: 'cancelled' },
    });

    const completed = await this.reservationRepository.count({
      where: { startTime: Between(new Date(startDate), new Date(endDate)), status: 'completed' },
    });

    const result = { total, confirmed, cancelled, completed };
    await this.redisService.set(cacheKey, JSON.stringify(result), 600);
    return result;
  }

  async getCheckinStats(startDate: string, endDate: string) {
    const totalCheckins = await this.checkinRepository.count({
      where: { checkinTime: Between(new Date(startDate), new Date(endDate)) },
    });

    const lateCheckins = await this.checkinRepository.count({
      where: {
        checkinTime: Between(new Date(startDate), new Date(endDate)),
        isLate: true,
      },
    });

    return {
      totalCheckins,
      lateCheckins,
      onTimeRate: totalCheckins > 0 ? parseFloat((((totalCheckins - lateCheckins) / totalCheckins) * 100).toFixed(2)) : 0,
    };
  }

  async getDashboardStats() {
    const cacheKey = 'stats:dashboard';
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayReservations = await this.reservationRepository.count({
      where: { startTime: Between(today, tomorrow), status: 'confirmed' },
    });

    const totalRooms = await this.roomRepository.count();
    const availableRooms = await this.roomRepository.count({ where: { status: 'available' } });

    const activeCheckins = await this.checkinRepository.count({
      where: { status: 'checked_in' },
    });

    const result = {
      todayReservations,
      totalRooms,
      availableRooms,
      activeCheckins,
    };

    await this.redisService.set(cacheKey, JSON.stringify(result), 60);
    return result;
  }
}
