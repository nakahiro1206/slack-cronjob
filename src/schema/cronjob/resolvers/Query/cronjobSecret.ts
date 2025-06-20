import type   { QueryResolvers } from './../../../types.generated';
export const cronjobSecret: NonNullable<QueryResolvers['cronjobSecret']> = async (_parent, _arg, _ctx) => {
    return process.env.CRON_SECRET || '';
};