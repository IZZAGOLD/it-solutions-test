export function validateEnvironment(environment: Record<string, unknown>) {
  const databaseUrl = environment.DATABASE_URL;
  if (typeof databaseUrl !== 'string' || !databaseUrl) {
    throw new Error('Необходимо задать DATABASE_URL');
  }

  const url = new URL(databaseUrl);
  if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL должен указывать на PostgreSQL');
  }

  const port = Number(environment.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT должен быть целым числом от 1 до 65535');
  }

  return { ...environment, DATABASE_URL: databaseUrl, PORT: port };
}
