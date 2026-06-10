import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsInt()
  capacity: number;
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  location: string;

  @IsInt()
  @IsOptional()
  capacity: number;

  @IsString()
  @IsOptional()
  status: string;
}
