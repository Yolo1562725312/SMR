import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Reservation } from '../../reservation/entities/reservation.entity';
import { Equipment } from './equipment.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ length: 50 })
  location: string;

  @Column()
  capacity: number;

  @Column({ default: 'available' })
  status: string;

  @Column({ nullable: true, length: 500 })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Equipment, equipment => equipment.room)
  equipment: Equipment[];

  @OneToMany(() => Reservation, reservation => reservation.room)
  reservations: Reservation[];
}
