import { IsInt } from 'class-validator';

export class CheckinDto {
  @IsInt()
  reservationId: number;
}
