import { ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { validateEnvironment } from './core/config/environment.config';
import { graphqlConfig } from './core/config/graphql.config';
import { HealthModule } from './core/health/health.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>(graphqlConfig),
    HealthModule,
    ProfileModule,
  ],
})
export class AppModule {}
