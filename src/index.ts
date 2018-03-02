import { graphqlLambda } from 'apollo-server-lambda';
import { schema } from './Schema';

export const api = graphqlLambda({ schema });
