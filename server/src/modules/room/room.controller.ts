import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateRoomDto, UpdateRoomDto } from './dto/create-room.dto';
import { CreateEquipmentDto } from './dto/create-equipment.dto';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findById(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateRoomDto) {
    return this.roomService.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomDto) {
    return this.roomService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.remove(id);
  }

  @Post('equipment')
  @Roles('admin')
  addEquipment(@Body() dto: CreateEquipmentDto) {
    return this.roomService.addEquipment(dto);
  }

  @Delete('equipment/:id')
  @Roles('admin')
  removeEquipment(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.removeEquipment(id);
  }

  @Put('equipment/:id/status')
  @Roles('admin')
  updateEquipmentStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
    return this.roomService.updateEquipmentStatus(id, status);
  }
}
