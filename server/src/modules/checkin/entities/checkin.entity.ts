import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Reservation } from '../../reservation/entities/reservation.entity';

@Entity('checkins')
export class Checkin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  reservationId: number;

  @Column({ type: 'datetime', nullable: true })
  checkinTime: Date;

  @Column({ type: 'datetime', nullable: true })
  checkoutTime: Date;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: false })
  isLate: boolean;

  @ManyToOne(() => User, user => user.checkins)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Reservation, reservation => reservation.checkins)
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
