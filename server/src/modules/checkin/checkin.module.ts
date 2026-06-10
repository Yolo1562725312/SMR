import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckinService } from './checkin.service';
import { CheckinController } from './checkin.controller';
import { Checkin } from './entities/checkin.entity';
import { ReservationModule } from '../reservation/reservation.module';

@Module({
  imports: [TypeOrmModule.forFeature([Checkin]), ReservationModule],
  controllers: [CheckinController],
  providers: [CheckinService],
  exports: [CheckinService],
})
export class CheckinModule {}
