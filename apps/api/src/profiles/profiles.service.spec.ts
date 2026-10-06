import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Profile, UserRole } from './entities/profile.entity.js';
import { ProfilesService } from './profiles.service.js';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let repository: {
    findOne: ReturnType<typeof vi.fn>;
  };

  const profile: Profile = {
    id: '4c20e4a7-0de9-45b4-9f15-e7afb1eae0e9',
    fullName: 'Fabian Cordobes',
    email: 'admin@flowops.local',
    role: UserRole.ADMIN,
    createdAt: new Date('2026-10-06T21:39:20.643Z'),
    updatedAt: new Date('2026-10-06T21:39:57.573Z'),
  };

  beforeEach(async () => {
    repository = {
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: getRepositoryToken(Profile),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get(ProfilesService);
  });

  it('should return a profile by id', async () => {
    repository.findOne.mockResolvedValue(profile);

    const result = await service.findById(profile.id);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: {
        id: profile.id,
      },
    });

    expect(result).toEqual(profile);
  });

  it('should throw NotFoundException when profile does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findById('missing-user-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
