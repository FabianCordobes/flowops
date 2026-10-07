import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Profile } from './entities/profile.entity.js';
import { UserRole } from '@flowops/shared';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async findById(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async findOperators(): Promise<Profile[]> {
    return this.profileRepository.find({
      where: {
        role: UserRole.OPERATOR,
      },
      order: {
        fullName: 'ASC',
        email: 'ASC'
      },
    });
  }
}
