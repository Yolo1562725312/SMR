import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Room } from '../../room/entities/room.entity';
import { Checkin } from '../../checkin/entities/checkin.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  roomId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column({ default: 'pending' })
  status: string;

  @Column({ default: 0 })
  requiredEquipment: number;

  @ManyToOne(() => User, user => user.reservations)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Room, room => room.reservations)
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @OneToMany(() => Checkin, checkin => checkin.reservation)
  checkins: Checkin[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
