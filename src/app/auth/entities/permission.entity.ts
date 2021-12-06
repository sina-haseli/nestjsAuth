import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Permission {
  constructor(code: string, title: string) {
    this.code = code;
    this.title = title;
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  title: string;

  @Column({ nullable: true })
  code: string;

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
