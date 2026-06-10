import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.statisticsService.getDashboardStats();
  }

  @Get('room-usage')
  getRoomUsageRate(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.statisticsService.getRoomUsageRate(startDate, endDate);
  }

  @Get('reservations')
  getReservationStats(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.statisticsService.getReservationStats(startDate, endDate);
  }

  @Get('checkins')
  getCheckinStats(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.statisticsService.getCheckinStats(startDate, endDate);
  }
}
