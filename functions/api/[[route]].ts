import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings={DB:D1Database;MEDIA:R2Bucket;SITE_NAME:string};
const app=new Hono<{Bindings:Bindings}>();
app.use('*',cors());
app.get('/health',(c)=>c.json({ok:true,site:c.env.SITE_NAME||'Sinais dos Tempos Web Rádio',runtime:'cloudflare-pages-functions'}));
app.get('/posts',async(c)=>{const rows=await c.env.DB.prepare("SELECT id,title,slug,summary,content,image_url AS imageUrl,category,published_at AS publishedAt FROM posts WHERE status='published' ORDER BY published_at DESC, created_at DESC").all();return c.json(rows.results)});
app.get('/posts/:slug',async(c)=>{const row=await c.env.DB.prepare("SELECT id,title,slug,summary,content,image_url AS imageUrl,category,published_at AS publishedAt FROM posts WHERE status='published' AND slug=? LIMIT 1").bind(c.req.param('slug')).first();if(!row)return c.json({error:'Matéria não encontrada'},404);return c.json(row)});
app.get('/sponsors',async(c)=>{const rows=await c.env.DB.prepare("SELECT id,name,description,logo_url AS logoUrl,banner_url AS bannerUrl,website_url AS websiteUrl,whatsapp,audio_url AS audioUrl FROM sponsors WHERE active=1 ORDER BY created_at DESC").all();return c.json(rows.results)});
app.get('/songs',async(c)=>{const rows=await c.env.DB.prepare("SELECT id,title,artist,description,audio_key AS audioKey,cover_key AS coverKey FROM songs WHERE active=1 ORDER BY created_at DESC").all();return c.json(rows.results)});
app.get('/media/:key{.+}',async(c)=>{const object=await c.env.MEDIA.get(c.req.param('key'));if(!object)return c.notFound();const headers=new Headers();object.writeHttpMetadata(headers);headers.set('cache-control','public, max-age=31536000, immutable');return new Response(object.body,{headers})});
app.notFound((c)=>c.json({error:'Rota não encontrada'},404));
export const onRequest=app.fetch;
export default app;
