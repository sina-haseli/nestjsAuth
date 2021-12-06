import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Role {
  constructor(role: Partial<Role>) {
    Object.assign(this, role);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  title: string;

  @ManyToMany(() => Permission, (permission) => permission.id, {
    eager: false,
  })
  @JoinTable({
    name: 'role_permission',
  })
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role, {
    eager: false,
  })
  users: User[];

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
