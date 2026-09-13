import { desc, eq, and, or, isNull, lte, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, posts, sponsors, songs } from "../drizzle/schema";
import { ENV } from './_core/env';
let _db:ReturnType<typeof drizzle>|null=null;
export async function getDb(){if(!_db&&process.env.DATABASE_URL){try{_db=drizzle(process.env.DATABASE_URL)}catch(e){console.warn('[Database] Failed to connect:',e);_db=null}}return _db}
export async function upsertUser(user:InsertUser):Promise<void>{if(!user.openId)throw new Error('User openId is required');const db=await getDb();if(!db)return;const values:InsertUser={openId:user.openId};const updateSet:Record<string,unknown>={};for(const field of ['name','email','loginMethod'] as const){if(user[field]!==undefined){values[field]=user[field]??null;updateSet[field]=user[field]??null}}if(user.lastSignedIn){values.lastSignedIn=user.lastSignedIn;updateSet.lastSignedIn=user.lastSignedIn}else values.lastSignedIn=new Date();if(user.role){values.role=user.role;updateSet.role=user.role}else if(user.openId===ENV.ownerOpenId){values.role='admin';updateSet.role='admin'}await db.insert(users).values(values).onDuplicateKeyUpdate({set:updateSet})}
export async function getUserByOpenId(openId:string){const db=await getDb();if(!db)return;const rows=await db.select().from(users).where(eq(users.openId,openId)).limit(1);return rows[0]}
export async function listPublishedPosts(){const db=await getDb();if(!db)return[];return db.select().from(posts).where(eq(posts.status,'published')).orderBy(desc(posts.publishedAt),desc(posts.createdAt))}
export async function getPostBySlug(slug:string){const db=await getDb();if(!db)return;const rows=await db.select().from(posts).where(and(eq(posts.slug,slug),eq(posts.status,'published'))).limit(1);return rows[0]}
export async function listActiveSponsors(){const db=await getDb();if(!db)return[];const now=new Date();return db.select().from(sponsors).where(and(eq(sponsors.active,1),or(isNull(sponsors.startsAt),lte(sponsors.startsAt,now)),or(isNull(sponsors.endsAt),gte(sponsors.endsAt,now)))).orderBy(desc(sponsors.createdAt))}
export async function listActiveSongs(){const db=await getDb();if(!db)return[];return db.select().from(songs).where(eq(songs.active,1)).orderBy(desc(songs.createdAt))}
