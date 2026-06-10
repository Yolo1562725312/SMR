import { IsString, IsNotEmpty, IsInt, IsDateString, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  roomId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}

export class UpdateReservationDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsDateString()
  @IsOptional()
  startTime: string;

  @IsDateString()
  @IsOptional()
  endTime: string;

  @IsString()
  @IsOptional()
  status: string;
}
