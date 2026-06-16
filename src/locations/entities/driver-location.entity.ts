import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('driver_locations')
@Index(['driverId', 'recordedAt'])
export class DriverLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver: User;

  @Column({ name: 'driver_id' })
  driverId: number;

  @Column({ type: 'real' })
  latitude: number;

  @Column({ type: 'real' })
  longitude: number;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;
}
