import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { validateEnvironment } from '../config/environment.config';
import { profileData } from './profile.data';

async function seed() {
  const environment = validateEnvironment(process.env);
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: environment.DATABASE_URL }),
  });

  try {
    const { id, links, skills, experience, projects, ...profile } = profileData;
    await prisma.profile.upsert({
      where: { id },
      create: profileData,
      update: {
        ...profile,
        links: { deleteMany: {}, ...links },
        skills: { deleteMany: {}, ...skills },
        experience: { deleteMany: {}, ...experience },
        projects: { deleteMany: {}, ...projects },
      },
    });
    console.log('Данные визитки сохранены');
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error: unknown) => {
  console.error('Не удалось заполнить базу данных', error);
  process.exitCode = 1;
});
