import { describe, expect, it } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';
function publicContext(): TrpcContext { return { user: null, req: { protocol: 'https', headers: {} } as TrpcContext['req'], res: {} as TrpcContext['res'] }; }
describe('public content contracts',()=>{
 it('returns a list shape for blog posts',async()=>{const result=await appRouter.createCaller(publicContext()).blog.list();expect(Array.isArray(result)).toBe(true)});
 it('returns a list shape for active sponsors',async()=>{const result=await appRouter.createCaller(publicContext()).sponsors.list();expect(Array.isArray(result)).toBe(true)});
 it('returns a list shape for active songs',async()=>{const result=await appRouter.createCaller(publicContext()).louvores.list();expect(Array.isArray(result)).toBe(true)});
});
