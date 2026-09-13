import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { SignJWT, jwtVerify } from "jose";

type Bindings = {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
  SITE_NAME: string;
  ADMIN_PASSWORD: string;
  ADMIN_JWT_SECRET: string;
};

const SESSION_COOKIE = "sinais_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias

function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200) || "materia";
}

async function uniqueSlug(db: D1Database, base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (true) {
    const existing = await db
      .prepare("SELECT id FROM posts WHERE slug = ? LIMIT 1")
      .bind(slug)
      .first();
    if (!existing) return slug;
    slug = `${base}-${n}`;
    n++;
  }
}

function getSecretKey(secret: string) {
  return new TextEncoder().encode(secret);
}

async function requireAuth(c: any, next: any) {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return c.json({ error: "Não autenticado" }, 401);
  try {
    await jwtVerify(token, getSecretKey(c.env.ADMIN_JWT_SECRET));
  } catch {
    return c.json({ error: "Sessão inválida ou expirada" }, 401);
  }
  await next();
}

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", cors());

// ---------- Saúde ----------
app.get("/api/health", (c) =>
  c.json({ ok: true, site: c.env.SITE_NAME || "Sinais dos Tempos Web Rádio" })
);

// ---------- Autenticação ----------
app.post("/api/auth/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";

  if (!c.env.ADMIN_PASSWORD) {
    return c.json({ error: "Login administrativo não configurado no servidor." }, 500);
  }
  if (!password || password !== c.env.ADMIN_PASSWORD) {
    return c.json({ error: "Senha incorreta." }, 401);
  }

  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey(c.env.ADMIN_JWT_SECRET));

  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return c.json({ ok: true });
});

app.get("/api/auth/me", async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return c.json({ authenticated: false });
  try {
    await jwtVerify(token, getSecretKey(c.env.ADMIN_JWT_SECRET));
    return c.json({ authenticated: true });
  } catch {
    return c.json({ authenticated: false });
  }
});

app.post("/api/auth/logout", (c) => {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

// ---------- Blog ----------
app.get("/api/posts", async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id,title,slug,summary,content,image_url AS imageUrl,category,published_at AS publishedAt FROM posts WHERE status='published' ORDER BY published_at DESC, created_at DESC"
  ).all();
  return c.json(rows.results);
});

app.get("/api/posts/admin/all", requireAuth, async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id,title,slug,summary,status,category,created_at AS createdAt FROM posts ORDER BY created_at DESC"
  ).all();
  return c.json(rows.results);
});

app.get("/api/posts/:slug", async (c) => {
  const row = await c.env.DB.prepare(
    "SELECT id,title,slug,summary,content,image_url AS imageUrl,category,published_at AS publishedAt FROM posts WHERE status='published' AND slug=? LIMIT 1"
  )
    .bind(c.req.param("slug"))
    .first();
  if (!row) return c.json({ error: "Matéria não encontrada" }, 404);
  return c.json(row);
});

app.post("/api/posts", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const summary = String(body.summary || "").trim();
  const content = String(body.content || "").trim();
  const imageUrl = body.imageUrl ? String(body.imageUrl) : null;
  const category = String(body.category || "Reflexão").trim();
  const status = body.status === "published" ? "published" : "draft";

  if (!title || !content) {
    return c.json({ error: "Título e conteúdo são obrigatórios." }, 400);
  }

  const slug = await uniqueSlug(c.env.DB, slugify(title));
  const publishedAt = status === "published" ? new Date().toISOString() : null;

  await c.env.DB.prepare(
    "INSERT INTO posts (title, slug, summary, content, image_url, category, status, published_at) VALUES (?,?,?,?,?,?,?,?)"
  )
    .bind(title, slug, summary || "Mensagem da Web Rádio Sinais dos Tempos.", content, imageUrl, category, status, publishedAt)
    .run();

  return c.json({ ok: true, slug });
});

app.delete("/api/posts/:id", requireAuth, async (c) => {
  await c.env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(c.req.param("id")).run();
  return c.json({ ok: true });
});

// ---------- Louvores (músicas) ----------
app.get("/api/songs", async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id,title,artist,description,audio_key AS audioUrl,cover_key AS coverUrl FROM songs WHERE active=1 ORDER BY created_at DESC"
  ).all();
  return c.json(rows.results);
});

app.get("/api/songs/admin/all", requireAuth, async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id,title,artist,active,created_at AS createdAt FROM songs ORDER BY created_at DESC"
  ).all();
  return c.json(rows.results);
});

app.post("/api/songs", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const artist = String(body.artist || "").trim();
  const description = body.description ? String(body.description) : null;
  const audioUrl = String(body.audioUrl || "").trim();
  const coverUrl = body.coverUrl ? String(body.coverUrl) : null;

  if (!title || !artist || !audioUrl) {
    return c.json({ error: "Título, artista e áudio são obrigatórios." }, 400);
  }

  await c.env.DB.prepare(
    "INSERT INTO songs (title, artist, description, audio_key, cover_key, active) VALUES (?,?,?,?,?,1)"
  )
    .bind(title, artist, description, audioUrl, coverUrl)
    .run();

  return c.json({ ok: true });
});

app.delete("/api/songs/:id", requireAuth, async (c) => {
  await c.env.DB.prepare("DELETE FROM songs WHERE id = ?").bind(c.req.param("id")).run();
  return c.json({ ok: true });
});

// ---------- Patrocinadores ----------
app.get("/api/sponsors", async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id,name,description,logo_url AS logoUrl,banner_url AS bannerUrl,website_url AS websiteUrl,whatsapp,audio_url AS audioUrl FROM sponsors WHERE active=1 ORDER BY created_at DESC"
  ).all();
  return c.json(rows.results);
});

app.get("/api/sponsors/admin/all", requireAuth, async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id,name,active,created_at AS createdAt FROM sponsors ORDER BY created_at DESC"
  ).all();
  return c.json(rows.results);
});

app.post("/api/sponsors", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const logoUrl = body.logoUrl ? String(body.logoUrl) : null;
  const bannerUrl = body.bannerUrl ? String(body.bannerUrl) : null;
  const websiteUrl = body.websiteUrl ? String(body.websiteUrl) : null;
  const whatsapp = body.whatsapp ? String(body.whatsapp) : null;
  const audioUrl = body.audioUrl ? String(body.audioUrl) : null;

  if (!name || !description) {
    return c.json({ error: "Nome e descrição são obrigatórios." }, 400);
  }

  await c.env.DB.prepare(
    "INSERT INTO sponsors (name, description, logo_url, banner_url, website_url, whatsapp, audio_url, active) VALUES (?,?,?,?,?,?,?,1)"
  )
    .bind(name, description, logoUrl, bannerUrl, websiteUrl, whatsapp, audioUrl)
    .run();

  return c.json({ ok: true });
});

app.delete("/api/sponsors/:id", requireAuth, async (c) => {
  await c.env.DB.prepare("DELETE FROM sponsors WHERE id = ?").bind(c.req.param("id")).run();
  return c.json({ ok: true });
});

// ---------- Upload de mídia (imagens/áudio) ----------
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

function base64ToBytes(base64: string): Uint8Array {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

app.post("/api/media/upload", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const fileName = String(body.fileName || "arquivo");
  const mimeType = String(body.mimeType || "application/octet-stream");
  const base64 = String(body.base64 || "");
  const kind = body.kind === "audio" ? "audio" : "image";

  if (!base64) return c.json({ error: "Arquivo vazio." }, 400);

  const bytes = base64ToBytes(base64);
  const maxSize = kind === "audio" ? MAX_AUDIO_BYTES : MAX_IMAGE_BYTES;
  if (bytes.byteLength > maxSize) {
    return c.json({ error: "Arquivo excede o tamanho máximo permitido." }, 400);
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const key = `${kind}s/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;

  await c.env.MEDIA.put(key, bytes, {
    httpMetadata: { contentType: mimeType },
  });

  return c.json({ ok: true, url: `/api/media/${key}` });
});

app.get("/api/media/*", async (c) => {
  const key = c.req.path.replace("/api/media/", "");
  const object = await c.env.MEDIA.get(key);
  if (!object) return c.notFound();
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
});

app.notFound((c) => c.json({ error: "Rota não encontrada" }, 404));

// ---------- Fallback: qualquer outra rota serve o site (SPA) ----------
app.all("*", async (c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: "Rota não encontrada" }, 404);
  }
  const url = new URL(c.req.url);
  url.pathname = "/";
  return c.env.ASSETS.fetch(new Request(url.toString(), { method: "GET" }));
});

export default {
  fetch: app.fetch,
};
