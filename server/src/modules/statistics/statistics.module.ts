import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Reservation } from '../reservation/entities/reservation.entity';
import { Room } from '../room/entities/room.entity';
import { Checkin } from '../checkin/entities/checkin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Room, Checkin])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
