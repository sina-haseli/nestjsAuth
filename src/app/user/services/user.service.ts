import { Injectable } from '@nestjs/common';
import { BusinessService } from '../../base/business.service';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import CommonDeleteResponseDto from '../../common/dto/common-delete.response.dto';

@Injectable()
export class UserService extends BusinessService<User> {
  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }

  async deleteByAdmin(id: number, user: User) {
    await this.assertOrFail(id);
    await this.softDelete(this.userRepository, id, user);
    return new CommonDeleteResponseDto({ isDeleted: true });
  }

  async getOneOrFail(id: number) {
    const user = await this.getOne(id);
    this.checkNotFound(user);
    return user;
  }

  async getOne(id: number) {
    return this.userRepository.getOne(id);
  }

  async checkUserExists(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email: email } });
    return user !== undefined;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
  }

  async findById(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async create(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async save(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async update(contact: User) {
    return await this.userRepository.update(contact.id, contact);
  }
}
