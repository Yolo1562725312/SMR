import { Controller, Get, Post, Param, Body, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CheckinDto } from './dto/checkin.dto';

@Controller('checkins')
@UseGuards(JwtAuthGuard)
export class CheckinController {
  constructor(private checkinService: CheckinService) {}

  @Post()
  checkin(@Request() req, @Body() dto: CheckinDto) {
    return this.checkinService.checkin(req.user.id, dto);
  }

  @Post(':reservationId/checkout')
  checkout(@Request() req, @Param('reservationId', ParseIntPipe) reservationId: number) {
    return this.checkinService.checkout(req.user.id, reservationId);
  }

  @Get('reservation/:reservationId')
  findByReservation(@Param('reservationId', ParseIntPipe) reservationId: number) {
    return this.checkinService.findByReservation(reservationId);
  }

  @Get('my')
  findMyCheckins(@Request() req) {
    return this.checkinService.findByUser(req.user.id);
  }
}
