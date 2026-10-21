import { execFileSync } from 'node:child_process';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaPg } from '@prisma/adapter-pg';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';
import { profileData } from '../src/core/database/profile.data';
import { PrismaClient } from '../src/generated/prisma/client';

describe('Визитка (GraphQL + PostgreSQL)', () => {
  let app: INestApplication;
  const queries: string[] = [];
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !new URL(databaseUrl).pathname.endsWith('_test')) {
    throw new Error(
      'Тестам нужна отдельная DATABASE_URL с именем базы, заканчивающимся на _test',
    );
  }
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
    log: [{ emit: 'event', level: 'query' }],
  });

  function seed() {
    execFileSync(process.execPath, ['dist/core/database/seed.js'], {
      stdio: 'pipe',
    });
  }

  function graphql(query: string, variables?: Record<string, unknown>) {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables });
  }

  beforeAll(async () => {
    seed();
    await prisma.$connect();
    prisma.$on('query', (event) => queries.push(event.query));

    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    queries.length = 0;
  });

  afterAll(async () => {
    await app?.close();
    await prisma.$disconnect();
  });

  it('проверка готовности учитывает соединение с PostgreSQL', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .set('Host', 'healthcheck.railway.app')
      .expect(200);

    expect(response.body).toEqual({ status: 'ok' });
    expect(queries).toHaveLength(1);
    expect(queries[0]).toContain('SELECT 1');
  });

  it('проверка готовности возвращает 503 при ошибке базы', async () => {
    const query = jest
      .spyOn(prisma, '$queryRaw')
      .mockRejectedValueOnce(new Error('Внутренняя ошибка подключения'));

    try {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(503);

      expect(response.body.message).toBe('База данных недоступна');
      expect(response.text).not.toContain('Внутренняя ошибка подключения');
    } finally {
      query.mockRestore();
    }
  });

  it('возвращает профиль со всеми связанными данными', async () => {
    const response = await graphql(`
      {
        profile {
          id
          name
          description
          links {
            name
            url
          }
          skills {
            name
          }
          experience {
            company
            position
            startDate
            endDate
            achievements
          }
          projects {
            name
            description
            url
          }
        }
      }
    `).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.profile).toEqual({
      id: '1',
      name: profileData.name,
      description: profileData.description,
      links: profileData.links.create.map(({ name, url }) => ({ name, url })),
      skills: profileData.skills.create.map(({ name }) => ({ name })),
      experience: profileData.experience.create.map(
        ({ order: _order, ...item }) => item,
      ),
      projects: profileData.projects.create.map(
        ({ order: _order, ...item }) => item,
      ),
    });
    expect(queries).toHaveLength(5);
  });

  it('не загружает связи, когда запрошено только имя', async () => {
    const response = await graphql('{ profile { name } }').expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.profile).toEqual({ name: profileData.name });
    expect(queries).toHaveLength(1);
    expect(queries[0]).toContain('"Profile"');
  });

  it('загружает все навыки одним запросом без запросов на каждый навык', async () => {
    const response = await graphql('{ profile { skills { name } } }').expect(
      200,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.profile.skills).toHaveLength(
      profileData.skills.create.length,
    );
    expect(queries).toHaveLength(2);
    expect(queries[1]).toContain('"Skill"');
  });

  it('учитывает директивы, переменные, алиасы и фрагменты', async () => {
    const response = await graphql(
      `
        query Card($showProjects: Boolean!) {
          card: profile {
            ...Details
            projects @include(if: $showProjects) {
              name
            }
          }
        }
        fragment Details on Profile {
          name
          experience {
            company
          }
        }
      `,
      { showProjects: false },
    ).expect(200);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.card).toEqual({
      name: profileData.name,
      experience: [{ company: 'Rootcode' }, { company: 'WelbeX' }],
    });
    expect(queries).toHaveLength(2);
  });

  it('повторный seed обновляет данные без дубликатов', async () => {
    await prisma.profile.update({
      where: { id: 1 },
      data: { name: 'Старое имя' },
    });
    seed();
    seed();

    expect(await prisma.profile.count()).toBe(1);
    expect(await prisma.profile.findUnique({ where: { id: 1 } })).toMatchObject(
      { name: profileData.name },
    );
    expect(await prisma.skill.count()).toBe(profileData.skills.create.length);
    expect(await prisma.experience.count()).toBe(2);
    expect(await prisma.project.count()).toBe(4);
    expect(await prisma.professionalLink.count()).toBe(
      profileData.links.create.length,
    );
  });

  it('ошибка заполнения откатывает удаление связей и обновление профиля', async () => {
    await expect(
      prisma.profile.update({
        where: { id: 1 },
        data: {
          name: 'Не должно сохраниться',
          skills: {
            deleteMany: {},
            create: [
              { name: 'Дубликат', order: 0 },
              { name: 'Дубликат', order: 1 },
            ],
          },
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });

    expect(await prisma.profile.findUnique({ where: { id: 1 } })).toMatchObject(
      { name: profileData.name },
    );
    expect(await prisma.skill.count()).toBe(profileData.skills.create.length);
  });

  it('возвращает null, если профиль отсутствует', async () => {
    try {
      await prisma.profile.delete({ where: { id: 1 } });
      const response = await graphql(
        '{ profile { name skills { name } } }',
      ).expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.profile).toBeNull();
    } finally {
      seed();
    }
  });

  it('отдаёт страницу Apollo Sandbox', async () => {
    const response = await request(app.getHttpServer())
      .get('/graphql')
      .set('Accept', 'text/html')
      .expect(200);

    expect(response.text).toContain('embeddable-sandbox.cdn.apollographql.com');
  });

  it('отклоняет неизвестные поля до обращения к базе', async () => {
    const response = await graphql('{ profile { password } }').expect(400);

    expect(response.body.errors[0].extensions.code).toBe(
      'GRAPHQL_VALIDATION_FAILED',
    );
    expect(response.body.errors[0].extensions.stacktrace).toBeUndefined();
    expect(queries).toHaveLength(0);
  });
});
