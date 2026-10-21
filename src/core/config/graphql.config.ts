import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

export const graphqlConfig: ApolloDriverConfig = {
  driver: ApolloDriver,
  autoSchemaFile: true,
  sortSchema: true,
  playground: false,
  introspection: true,
  includeStacktraceInErrorResponses: false,
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({
      embed: true,
      document: `query BusinessCard {
        profile {
          name
          description
          links { name url }
          skills { name }
          experience { company position startDate endDate achievements }
          projects { name description url }
        }
      }`,
    }),
  ],
};
