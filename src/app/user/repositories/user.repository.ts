import { EntityRepository } from 'typeorm';
import { User } from '../entities/user.entity';
import { BusinessRepository } from '../../base/business.repository';

@EntityRepository(User)
export class UserRepository extends BusinessRepository<User> {
  async getOne(id: number) {
    const query = await this.createQueryBuilder('user').where('user.id = :id', {
      id,
    });
    return await query.getOne();
  }
}
