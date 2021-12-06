import { User } from '../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BusinessEntity {
  @ManyToOne(() => User, (user) => user.id, { eager: false })
  @JoinColumn()
  createdBy: User;

  @Column({ nullable: true })
  createdById: number;

  @JoinColumn()
  @ManyToOne(() => User, (user) => user.id, { eager: false })
  updatedBy: User;

  @Column({ nullable: true })
  updatedById: number;

  @CreateDateColumn({
    nullable: false,
  })
  createdAt?: Date;

  @UpdateDateColumn({
    nullable: true,
  })
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
