import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile() {
    return this.prisma.profile.findUnique({ where: { id: 1 } });
  }

  getLinks(profileId: number) {
    return this.prisma.professionalLink.findMany({
      where: { profileId },
      orderBy: { order: 'asc' },
    });
  }

  getSkills(profileId: number) {
    return this.prisma.skill.findMany({
      where: { profileId },
      orderBy: { order: 'asc' },
    });
  }

  getExperience(profileId: number) {
    return this.prisma.experience.findMany({
      where: { profileId },
      orderBy: { order: 'asc' },
    });
  }

  getProjects(profileId: number) {
    return this.prisma.project.findMany({
      where: { profileId },
      orderBy: { order: 'asc' },
    });
  }
}
