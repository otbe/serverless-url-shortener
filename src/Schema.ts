import {
  listRedirects,
  getRedirect,
  checkAvailability,
  createRedirect
} from './S3';
import { makeExecutableSchema } from 'graphql-tools';
import { S3 } from 'aws-sdk';

const typeDefs = `
  type Redirect {
    from: String!
    to: String!
  }

  type RedirectConnection {
    nextToken: String
    items: [Redirect]
  }
  
  type Query {
    redirects(nextToken: String): RedirectConnection!
  }

  type Mutation {
    createRedirect(from: String!, to: String!): Redirect!
  }`;

const resolvers = {
  Query: {
    redirects: (_, { nextToken }: { nextToken?: string }) =>
      listRedirects(nextToken)
  },
  RedirectConnection: {
    nextToken: (root: S3.ListObjectsV2Output) => root.NextContinuationToken,
    items: (root: S3.ListObjectsV2Output) =>
      Promise.all(root.Contents.map(x => getRedirect(x)))
  },
  Mutation: {
    createRedirect: async (_, { from, to }) => {
      await checkAvailability(from);
      return await createRedirect(from, to);
    }
  }
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
