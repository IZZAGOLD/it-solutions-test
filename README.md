# Цифровая визитка

Backend-визитка на TypeScript, Node.js, NestJS, Prisma, GraphQL и PostgreSQL. API доступно для чтения через Apollo Sandbox.

Инструкция по публикации: [деплой на Render](docs/render.md).

## Запуск

Нужен Docker с Compose:

```bash
docker compose up --build -d --wait
```

Apollo Sandbox: [http://localhost:3000/graphql](http://localhost:3000/graphql).
Проверка приложения и соединения с PostgreSQL: [http://localhost:3000/health](http://localhost:3000/health).
Для загрузки интерфейса Sandbox нужен доступ к CDN Apollo; само API работает без него.

При первом запуске Compose дожидается готовности PostgreSQL, применяет миграции, заполняет базу и запускает HTTP-сервер. При последующих запусках выполняется та же последовательность. Данные PostgreSQL сохраняются в Docker volume.

```bash
docker compose logs -f app
docker compose down
```

Порт приложения можно изменить: `PORT=3001 docker compose up --build -d --wait`.
PostgreSQL доступен локально на порту `5432`; параметры подключения для разработки находятся в `.env.example`. Это локальные учётные данные тестового приложения.

## GraphQL

```graphql
query {
  profile {
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
```

Даты опыта работы имеют точность до месяца: `YYYY-MM`. `endDate: null` означает работу по настоящее время. Опыт отсортирован от последнего места работы к предыдущему, остальные списки возвращаются в порядке seed-данных. Если профиль отсутствует, API возвращает `profile: null`.

Запрос без браузера:

```bash
curl http://localhost:3000/graphql \
  -H 'Content-Type: application/json' \
  --data '{"query":"{ profile { name skills { name } } }"}'
```

## Структура

Архитектура следует устройству `notification-service`: инфраструктура и конфигурация находятся в `core`, прикладной модуль — в `modules`, внутри него разделены сервис, резолвер и GraphQL-типы.

```text
src/
  core/
    config/          # Проверка окружения и настройки GraphQL
    database/        # Prisma, исходные данные и заполнение базы
  modules/
    profile/
      graphql-types/
      resolvers/
      services/
prisma/
  schema.prisma
  migrations/
test/
```

Резолвер описывает GraphQL API и передаёт вызовы сервису. Сервис определяет выборку профиля и порядок связанных данных. Prisma отвечает за доступ к PostgreSQL, ограничения и транзакции. Отдельные репозитории и универсальные абстракции для одного небольшого модуля не нужны.

API возвращает единственный профиль с `id = 1`. Его связи загружаются отдельными `ResolveField` только при обращении к ним. Запрос имени выполняет один SQL-запрос, имя с навыками — два, все четыре связи с профилем — пять. Каждый список загружается целиком одним запросом, число запросов не зависит от числа навыков или проектов. Директивы и фрагменты обрабатывает GraphQL. Для API с одним профилем DataLoader не требуется; при добавлении списка профилей понадобится пакетная загрузка связей.

Внешние ключи связывают записи с профилем. Составные уникальные индексы начинаются с `profileId` и поддерживают выборки связей с сортировкой по `order`.

## Данные

Источник данных — резюме. Они находятся в `src/core/database/profile.data.ts`.
GitHub: [IZZAGOLD](https://github.com/IZZAGOLD). Все четыре проекта помечены как NDA; их ссылки обозначены `-`. Названия проектов описательные.

Seed выполняет вложенный Prisma `upsert`: обновляет профиль и заменяет его связанные записи в одной транзакции. Повторный запуск не создаёт дубликатов. При ошибке изменения откатываются целиком. Seed-файл является источником данных: изменения визитки, сделанные вручную в базе, перезапишутся при следующем запуске. Внутренние идентификаторы связанных записей при этом могут измениться; API их не публикует.

После редактирования данных пересоберите приложение:

```bash
docker compose up --build -d --wait
```

## Локальная разработка

Нужны Node.js 22.13+ и PostgreSQL 17. Команды ниже запускают PostgreSQL через Docker:

```bash
cp .env.example .env
docker compose up -d --wait db
npm ci
npm run start:dev
```

`start:dev` генерирует Prisma Client, собирает проект, применяет миграции и seed, затем запускает NestJS с отслеживанием изменений. После изменения `profile.data.ts` перезапустите команду, чтобы обновить базу.

Запуск собранного приложения:

```bash
npm run build
npm start
```

`DATABASE_URL` обязателен, `PORT` по умолчанию равен `3000`. Prisma CLI читает `.env` через `prisma.config.ts`, приложение — через `ConfigModule`.

## Проверки

```bash
npm run build
npm run type-check
npm run lint
npm run format:check
```

Конфиги ESLint, commitlint и хуки Husky перенесены из `notification-service`. После `npm ci` Husky подключает `pre-commit` с проверками типов, ESLint и форматирования. Линтер не меняет файлы при проверке; для автоматических исправлений есть `npm run lint:fix`. Сгенерированный Prisma Client и результаты сборки исключены из проверки.

Хук `commit-msg` проверяет Conventional Commits, например `feat: добавил профиль`. Сообщения коммитов пишутся на русском языке. Интеграционные тесты запускаются отдельно, поскольку им нужна тестовая PostgreSQL. При сборке Docker-образа установка Git-хуков отключена.

В `overrides` закреплена исправленная версия транзитивной зависимости `@graphql-tools/utils`: это устраняет prototype pollution в зависимости NestJS 11.

Интеграционные тесты запускаются с отдельным PostgreSQL, без публикации его порта:

```bash
docker compose -p business-card-test -f compose.test.yaml up --build --abort-on-container-exit --exit-code-from tests
docker compose -p business-card-test -f compose.test.yaml down --volumes
```

Тесты проверяют GraphQL-ответы, порядок данных, количество реальных SQL-запросов, директивы и фрагменты, повторный seed, откат транзакции, отсутствие профиля и страницу Sandbox. Тестовая база изменяется в ходе проверок. Локальный `npm test` требует отдельную базу в `DATABASE_URL` с суффиксом `_test` в имени, применённые миграции и предварительную сборку проекта. С другим именем базы тесты не запускаются.
