import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkin } from './entities/checkin.entity';
import { CheckinDto } from './dto/checkin.dto';
import { ReservationService } from '../reservation/reservation.service';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(Checkin)
    private checkinRepository: Repository<Checkin>,
    private reservationService: ReservationService,
  ) {}

  async checkin(userId: number, dto: CheckinDto): Promise<Checkin> {
    const reservation = await this.reservationService.findById(dto.reservationId);

    if (reservation.userId !== userId) {
      throw new BadRequestException('您不是该预约的创建者');
    }

    if (reservation.status !== 'confirmed') {
      throw new BadRequestException('预约状态不允许签到');
    }

    const existing = await this.checkinRepository.findOne({
      where: { reservationId: dto.reservationId, userId },
    });
    if (existing && existing.checkinTime) {
      throw new BadRequestException('您已签到');
    }

    const now = new Date();
    const isLate = now > new Date(reservation.startTime.getTime() + 15 * 60 * 1000);

    if (existing) {
      await this.checkinRepository.update(existing.id, {
        checkinTime: now,
        status: 'checked_in',
        isLate,
      });
      return this.checkinRepository.findOne({ where: { id: existing.id } });
    }

    const checkin = this.checkinRepository.create({
      userId,
      reservationId: dto.reservationId,
      checkinTime: now,
      status: 'checked_in',
      isLate,
    });
    return this.checkinRepository.save(checkin);
  }

  async checkout(userId: number, reservationId: number): Promise<Checkin> {
    const checkin = await this.checkinRepository.findOne({
      where: { reservationId, userId },
    });
    if (!checkin) {
      throw new NotFoundException('签到记录不存在');
    }
    if (checkin.checkoutTime) {
      throw new BadRequestException('您已签退');
    }
    if (!checkin.checkinTime) {
      throw new BadRequestException('您尚未签到');
    }

    await this.checkinRepository.update(checkin.id, {
      checkoutTime: new Date(),
      status: 'checked_out',
    });
    return this.checkinRepository.findOne({ where: { id: checkin.id } });
  }

  async findByReservation(reservationId: number): Promise<Checkin[]> {
    return this.checkinRepository.find({
      where: { reservationId },
      relations: ['user'],
    });
  }

  async findByUser(userId: number): Promise<Checkin[]> {
    return this.checkinRepository.find({
      where: { userId },
      relations: ['reservation', 'reservation.room'],
    });
  }
}
