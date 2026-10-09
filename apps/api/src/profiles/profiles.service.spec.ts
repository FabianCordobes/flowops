import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserRole } from '@flowops/shared';
import { Profile } from './entities/profile.entity.js';
import { ProfilesService } from './profiles.service.js';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let repository: {
    findOne: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
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
        find: vi.fn(),
        save: vi.fn(),
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

  it('should return operators ordered by full name and email', async () => {
    const operators: Profile[] = [
      {
        id: '8e0d9bb4-38d1-4a29-875d-3fb13ed9c55e',
        fullName: 'Operator One',
        email: 'operator@flowops.local',
        role: UserRole.OPERATOR,
        createdAt: new Date('2026-10-06T21:39:20.643Z'),
        updatedAt: new Date('2026-10-06T21:39:57.573Z'),
      },
    ];

    repository.find.mockResolvedValue(operators);

    const result = await service.findOperators();

    expect(repository.find).toHaveBeenCalledWith({
      where: {
        role: UserRole.OPERATOR,
      },
      order: {
        fullName: 'ASC',
        email: 'ASC',
      },
    });

    expect(result).toEqual(operators);
  });

  describe('updateMyProfile', () => {
    it('should update the authenticated user full name', async () => {
      const existingProfile = { ...profile };

      repository.findOne.mockResolvedValue(existingProfile);
      repository.save.mockImplementation(async (value) => value);

      const result = await service.updateMyProfile(
        profile.id,
        'Maria Gonzalez',
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: profile.id },
      });

      expect(repository.save).toHaveBeenCalledWith({
        ...existingProfile,
        fullName: 'Maria Gonzalez',
      });

      expect(result.fullName).toBe('Maria Gonzalez');
    });

    it('should trim spaces from the full name', async () => {
      repository.findOne.mockResolvedValue({ ...profile });
      repository.save.mockImplementation(async (value) => value);

      const result = await service.updateMyProfile(
        profile.id,
        '  Maria Gonzalez  ',
      );

      expect(result.fullName).toBe('Maria Gonzalez');
    });

    it('should reject a name containing only spaces', async () => {
      await expect(
        service.updateMyProfile(profile.id, '   '),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should reject a name longer than 100 characters', async () => {
      await expect(
        service.updateMyProfile(profile.id, 'A'.repeat(101)),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should reject updating a nonexistent profile', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.updateMyProfile(
          'missing-user-id',
          'Maria Gonzalez',
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
