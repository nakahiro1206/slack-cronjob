import { resolvers } from '@/schema/resolvers.generated';
import { typeDefs } from '@/schema/typeDefs.generated';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
});

const handler = startServerAndCreateNextHandler(apolloServer);

export { handler as GET, handler as POST };