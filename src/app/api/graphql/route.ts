import { resolvers } from '@/schema/resolvers.generated';
import { typeDefs } from '@/schema/typeDefs.generated';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';

const apolloServer = new ApolloServer<{}>({
    typeDefs,
    resolvers,
});

const handler = startServerAndCreateNextHandler(apolloServer, {
    context: async (req: NextRequest) => {
        return {};
    },
});

export async function GET(request: NextRequest) {
    return handler(request);
}

export async function POST(request: NextRequest) {
    return handler(request);
}