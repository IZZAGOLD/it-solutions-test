import { Prisma } from '../../generated/prisma/client';

export const profileData = {
  id: 1,
  name: 'Бандурин Михаил Павлович',
  description:
    'Frontend и React Native Developer, более 5 лет коммерческой разработки на TypeScript, React, Next.js и React Native. ' +
    'В Rootcode руковожу frontend-командой в fintech и Web3. ' +
    'С нуля вывел в продакшен 4 продукта, проектирую архитектуру по Feature-Sliced Design и развиваю общий UI-kit. ' +
    'Работаю с web и мобильными приложениями, производительностью и CI/CD. ' +
    'Node.js, NestJS, PostgreSQL и TypeORM использую в учебных проектах.',
  links: {
    create: [
      { name: 'GitHub', url: 'https://github.com/IZZAGOLD', order: 0 },
      { name: 'Telegram', url: 'https://t.me/maitreja', order: 1 },
      { name: 'Email', url: 'mailto:bandurin.front@gmail.com', order: 2 },
    ],
  },
  skills: {
    create: [
      'TypeScript',
      'JavaScript',
      'React',
      'Next.js',
      'React Native',
      'Expo',
      'Effector',
      'Redux Toolkit',
      'Redux Saga',
      'TanStack Query',
      'MobX',
      'Zustand',
      'REST API',
      'GraphQL',
      'Apollo Client',
      'WebSocket',
      'Centrifugo',
      'HTML5',
      'CSS3',
      'styled-components',
      'Feature-Sliced Design',
      'Vite',
      'SSR',
      'Vitest',
      'Playwright',
      'Jest',
      'Detox',
      'Git',
      'GitLab CI',
      'Docker',
      'Fastlane',
      'Nginx',
      'Kubernetes',
      'Helm',
      'JWT',
      'Keycloak',
      'RBAC',
      'WatermelonDB',
      'WebRTC',
      'Code Review',
      'Node.js',
      'NestJS',
      'PostgreSQL',
      'TypeORM',
    ].map((name, order) => ({ name, order })),
  },
  experience: {
    create: [
      {
        company: 'Rootcode',
        position: 'Frontend-разработчик (Team Lead, React / React Native)',
        startDate: '2023-03',
        endDate: null,
        achievements: [
          'Спроектировал и вывел в продакшен с нуля 4 продукта: криптобиржу, криптообменник, корпоративный сайт и некастодиальный Web3-кошелёк.',
          'Внедрил Feature-Sliced Design, собственные npm-пакеты и общий UI-kit на дизайн-токенах: до 40% кода переиспользуется между проектами.',
          'Руковожу frontend-командой, менторю 2 инженеров, провожу более 50 code review в месяц, оцениваю и декомпозирую задачи.',
          'Отвечаю за frontend криптобиржи из 6 приложений; интегрировал REST API, GraphQL и обновления в реальном времени через Centrifugo.',
          'Внедрил JWT, SSO через Keycloak, ролевую модель доступа и биометрическую авторизацию в мобильных приложениях.',
          'Поддерживаю Lighthouse на уровне 90+ и контролирую размер бандлов в CI.',
          'Настроил GitLab CI и Fastlane: мобильный релиз сократился с 2 дней до 3 часов.',
          'Web3-кошелёк для iOS и Android получил более 1000 установок за 3 месяца.',
        ],
        order: 0,
      },
      {
        company: 'WelbeX',
        position: 'Frontend-разработчик (React, React Native)',
        startDate: '2021-02',
        endDate: '2023-03',
        achievements: [
          'Разработал корпоративный мессенджер на React Native с интеграцией Битрикс24: WebSocket, push-уведомления и офлайн-режим на WatermelonDB.',
          'Разработал мобильные приложения для водителей и грузовладельцев Altek LLC: GPS-трекинг, оптимизация маршрутов и Google Maps.',
          'Разработал личный кабинет партнёра логистической платформы на React, TypeScript и TanStack Query.',
        ],
        order: 1,
      },
    ],
  },
  projects: {
    create: [
      {
        name: 'Криптобиржа (NDA)',
        description:
          'Frontend из 6 приложений: лендинг, личный кабинет, админ-панель, база знаний, мобильное приложение и SSO. React, Next.js, React Native, Effector, GraphQL и Centrifugo.',
        url: '-',
        order: 0,
      },
      {
        name: 'Криптообменник (NDA)',
        description:
          'Продукт на TypeScript и React, разработанный с нуля в Rootcode.',
        url: '-',
        order: 1,
      },
      {
        name: 'Корпоративный сайт (NDA)',
        description: 'Сайт на Next.js с серверным рендерингом и SEO.',
        url: '-',
        order: 2,
      },
      {
        name: 'Некастодиальный Web3-кошелёк (NDA)',
        description:
          'Приложение на React Native для iOS и Android, более 1000 установок за первые 3 месяца.',
        url: '-',
        order: 3,
      },
    ],
  },
} satisfies Prisma.ProfileCreateInput;
