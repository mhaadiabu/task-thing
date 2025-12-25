import { initTRPC } from '@trpc/server';
import type { IncomingHttpHeaders } from 'http';

export type Context = {
  headers: IncomingHttpHeaders;
};

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
