import { Controller, Get, Post, Put, Delete, Param, Body, Query, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateReservationDto, UpdateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateReservationDto) {
    return this.reservationService.create(req.user.id, dto);
  }

  @Get()
  findAll(
    @Query('userId') userId?: number,
    @Query('roomId') roomId?: number,
    @Query('status') status?: string,
  ) {
    return this.reservationService.findAll(userId, roomId, status);
  }

  @Get('room/:roomId/schedule')
  getSchedule(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reservationService.findByDateRange(roomId, startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.findById(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReservationDto) {
    return this.reservationService.update(id, dto);
  }

  @Put(':id/confirm')
  @Roles('admin')
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.confirm(id);
  }

  @Put(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.remove(id);
  }
}
