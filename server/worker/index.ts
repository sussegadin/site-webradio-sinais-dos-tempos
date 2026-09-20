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

function sanitizeArticleHtml(value: string): string {
  if (!/<[a-z][\s\S]*>/i.test(value)) {
    return `<p>${value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r?\n/g, "<br>")}</p>`;
  }
  return value
    .replace(/<\/?(script|style|meta|link|iframe|object|embed|form)[^>]*>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(href|src)\s*=\s*(["'])\s*(javascript:|data:)[^"']*\2/gi, "")
    .replace(/\s+style\s*=\s*(["'])(.*?)\1/gi, (_match, quote, style) => {
      const safe = String(style).split(";").filter(rule => /^(font-family|font-size|font-weight|font-style|text-align|color)\s*:/i.test(rule.trim())).join(";");
      return safe ? ` style=${quote}${safe}${quote}` : "";
    });
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
    const { payload } = await jwtVerify(token, getSecretKey(c.env.ADMIN_JWT_SECRET));
    if (payload.role !== "owner") return c.json({ error: "Somente o proprietário pode editar este site." }, 403);
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

  const token = await new SignJWT({ role: "owner", scope: "site:write" })
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
    const { payload } = await jwtVerify(token, getSecretKey(c.env.ADMIN_JWT_SECRET));
    return c.json({ authenticated: payload.role === "owner", role: payload.role || null });
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
    "SELECT id,title,slug,summary,content,image_url AS imageUrl,status,category,created_at AS createdAt FROM posts ORDER BY created_at DESC"
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
  const content = sanitizeArticleHtml(String(body.content || "").trim());
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

app.patch("/api/posts/:id", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const summary = String(body.summary || "").trim();
  const content = sanitizeArticleHtml(String(body.content || "").trim());
  const category = String(body.category || "Reflexão").trim();
  const imageUrl = body.imageUrl ? String(body.imageUrl) : null;
  const status = body.status === "published" ? "published" : "draft";
  if (!title || !content) return c.json({ error: "Título e conteúdo são obrigatórios." }, 400);
  const publishedAt = status === "published" ? new Date().toISOString() : null;
  const result = await c.env.DB.prepare("UPDATE posts SET title=?,summary=?,content=?,image_url=?,category=?,status=?,published_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(title, summary || "Mensagem da Web Rádio Sinais dos Tempos.", content, imageUrl, category, status, publishedAt, c.req.param("id")).run();
  if (!result.meta.changes) return c.json({ error: "Matéria não encontrada." }, 404);
  return c.json({ ok: true });
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
    "SELECT id,title,artist,description,audio_key AS audioUrl,cover_key AS coverUrl,active,created_at AS createdAt FROM songs ORDER BY created_at DESC"
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

app.patch("/api/songs/:id", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const artist = String(body.artist || "").trim();
  const description = body.description ? String(body.description) : null;
  const audioUrl = String(body.audioUrl || "").trim();
  const coverUrl = body.coverUrl ? String(body.coverUrl) : null;
  const active = body.active === false ? 0 : 1;
  if (!title || !artist || !audioUrl) return c.json({ error: "Título, artista e áudio são obrigatórios." }, 400);
  const result = await c.env.DB.prepare("UPDATE songs SET title=?,artist=?,description=?,audio_key=?,cover_key=?,active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(title, artist, description, audioUrl, coverUrl, active, c.req.param("id")).run();
  if (!result.meta.changes) return c.json({ error: "Louvor não encontrado." }, 404);
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
    "SELECT id,name,description,logo_url AS logoUrl,banner_url AS bannerUrl,website_url AS websiteUrl,whatsapp,audio_url AS audioUrl,active,created_at AS createdAt FROM sponsors ORDER BY created_at DESC"
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

app.patch("/api/sponsors/:id", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const logoUrl = body.logoUrl ? String(body.logoUrl) : null;
  const bannerUrl = body.bannerUrl ? String(body.bannerUrl) : null;
  const websiteUrl = body.websiteUrl ? String(body.websiteUrl) : null;
  const whatsapp = body.whatsapp ? String(body.whatsapp) : null;
  const audioUrl = body.audioUrl ? String(body.audioUrl) : null;
  const active = body.active === false ? 0 : 1;
  if (!name || !description) return c.json({ error: "Nome e descrição são obrigatórios." }, 400);
  const result = await c.env.DB.prepare("UPDATE sponsors SET name=?,description=?,logo_url=?,banner_url=?,website_url=?,whatsapp=?,audio_url=?,active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(name, description, logoUrl, bannerUrl, websiteUrl, whatsapp, audioUrl, active, c.req.param("id")).run();
  if (!result.meta.changes) return c.json({ error: "Patrocinador não encontrado." }, 404);
  return c.json({ ok: true });
});

app.delete("/api/sponsors/:id", requireAuth, async (c) => {
  await c.env.DB.prepare("DELETE FROM sponsors WHERE id = ?").bind(c.req.param("id")).run();
  return c.json({ ok: true });
});

// ---------- Avisos do site ----------
app.get("/api/announcements", async (c) => {
  const now = new Date().toISOString();
  const rows = await c.env.DB.prepare(
    "SELECT id,title,message,variant,link_url AS linkUrl,link_label AS linkLabel FROM announcements WHERE active=1 AND (starts_at IS NULL OR starts_at <= ?) AND (ends_at IS NULL OR ends_at >= ?) ORDER BY created_at DESC LIMIT 3"
  ).bind(now, now).all();
  return c.json(rows.results);
});

app.get("/api/announcements/admin/all", requireAuth, async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id,title,message,variant,link_url AS linkUrl,link_label AS linkLabel,active,starts_at AS startsAt,ends_at AS endsAt,created_at AS createdAt FROM announcements ORDER BY created_at DESC"
  ).all();
  return c.json(rows.results);
});

app.post("/api/announcements", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const message = String(body.message || "").trim();
  const variant = ["info", "success", "warning"].includes(body.variant) ? body.variant : "info";
  const linkUrl = body.linkUrl ? String(body.linkUrl).trim() : null;
  const linkLabel = body.linkLabel ? String(body.linkLabel).trim() : null;
  const startsAt = body.startsAt ? String(body.startsAt) : null;
  const endsAt = body.endsAt ? String(body.endsAt) : null;
  const active = body.active === false ? 0 : 1;

  if (title.length < 3 || title.length > 120 || !message || message.length > 500) {
    return c.json({ error: "Informe um título de 3 a 120 caracteres e uma mensagem de até 500 caracteres." }, 400);
  }
  if (linkUrl && !/^https?:\/\//i.test(linkUrl)) {
    return c.json({ error: "O link deve começar com http:// ou https://." }, 400);
  }
  if (startsAt && endsAt && startsAt > endsAt) {
    return c.json({ error: "O início do aviso deve ser anterior ao fim." }, 400);
  }

  await c.env.DB.prepare(
    "INSERT INTO announcements (title,message,variant,link_url,link_label,active,starts_at,ends_at) VALUES (?,?,?,?,?,?,?,?)"
  ).bind(title, message, variant, linkUrl, linkLabel, active, startsAt, endsAt).run();
  return c.json({ ok: true });
});

app.patch("/api/announcements/:id", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const id = c.req.param("id");
  const existing = await c.env.DB.prepare("SELECT * FROM announcements WHERE id=? LIMIT 1").bind(id).first();
  if (!existing) return c.json({ error: "Aviso não encontrado." }, 404);
  const title = String(body.title ?? existing.title ?? "").trim();
  const message = String(body.message ?? existing.message ?? "").trim();
  const variant = ["info", "success", "warning"].includes(body.variant ?? existing.variant) ? (body.variant ?? existing.variant) : "info";
  const linkUrl = body.linkUrl === undefined ? (existing.link_url == null ? null : String(existing.link_url)) : (body.linkUrl ? String(body.linkUrl).trim() : null);
  const linkLabel = body.linkLabel === undefined ? (existing.link_label == null ? null : String(existing.link_label)) : (body.linkLabel ? String(body.linkLabel).trim() : null);
  const startsAt = body.startsAt === undefined ? (existing.starts_at == null ? null : String(existing.starts_at)) : (body.startsAt ? String(body.startsAt) : null);
  const endsAt = body.endsAt === undefined ? (existing.ends_at == null ? null : String(existing.ends_at)) : (body.endsAt ? String(body.endsAt) : null);
  const active = body.active === undefined ? Number(existing.active || 0) : (body.active ? 1 : 0);
  if (title.length < 3 || title.length > 120 || !message || message.length > 500) return c.json({ error: "Informe um título de 3 a 120 caracteres e uma mensagem de até 500 caracteres." }, 400);
  if (linkUrl && !/^https?:\/\//i.test(linkUrl)) return c.json({ error: "O link deve começar com http:// ou https://." }, 400);
  if (startsAt && endsAt && startsAt > endsAt) return c.json({ error: "O início do aviso deve ser anterior ao fim." }, 400);
  await c.env.DB.prepare("UPDATE announcements SET title=?,message=?,variant=?,link_url=?,link_label=?,active=?,starts_at=?,ends_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(title, message, variant, linkUrl, linkLabel, active, startsAt, endsAt, id).run();
  return c.json({ ok: true });
});

app.delete("/api/announcements/:id", requireAuth, async (c) => {
  await c.env.DB.prepare("DELETE FROM announcements WHERE id=?").bind(c.req.param("id")).run();
  return c.json({ ok: true });
});

// ---------- Textos editáveis do site ----------
app.get("/api/site-content", async (c) => {
  const rows = await c.env.DB.prepare("SELECT content_key AS contentKey,content_value AS contentValue FROM site_content").all();
  return c.json(Object.fromEntries(rows.results.map((row: any) => [row.contentKey, row.contentValue])));
});

app.get("/api/site-content/admin/all", requireAuth, async (c) => {
  const rows = await c.env.DB.prepare("SELECT content_key AS contentKey,content_value AS contentValue,updated_at AS updatedAt FROM site_content ORDER BY content_key").all();
  return c.json(rows.results);
});

app.put("/api/site-content", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const allowedKeys = ["hero_eyebrow", "hero_title_line", "hero_title_accent", "hero_description", "radio_title", "radio_description", "mission_kicker", "mission_title", "mission_description", "home_blocks", "site_settings", "social_whatsapp", "social_facebook", "social_instagram", "social_youtube"];
  const entries = new Map(Object.entries(body).filter(([key, value]) => allowedKeys.includes(key) && typeof value === "string") as [string, string][]);
  if (typeof body.home_blocks === "string") {
    try {
      const blocks = JSON.parse(body.home_blocks);
      if (!Array.isArray(blocks)) throw new Error("home_blocks deve ser uma lista");
      const byType = (type: string) => blocks.find((block: any) => block?.type === type);
      const hero = byType("hero");
      const radio = byType("radio");
      const mission = byType("mission");
      if (hero) {
        entries.set("hero_title_line", String(hero.title || ""));
        entries.set("hero_title_accent", "");
        entries.set("hero_description", String(hero.body || ""));
      }
      if (radio) {
        entries.set("radio_title", String(radio.title || ""));
        entries.set("radio_description", String(radio.body || ""));
      }
      if (mission) {
        entries.set("mission_title", String(mission.title || ""));
        entries.set("mission_description", String(mission.body || ""));
      }
    } catch {
      return c.json({ error: "O conteúdo das seções da home não é um JSON válido." }, 400);
    }
  }
  if (typeof body.site_settings === "string") {
    try {
      const settings = JSON.parse(body.site_settings);
      if (!settings || typeof settings !== "object" || Array.isArray(settings)) throw new Error("site_settings deve ser um objeto");
      const allowedSettings = ["customDomain", "faviconUrl", "seoTitle", "seoDescription", "canonicalUrl", "ogImage", "analyticsId", "customCss", "customJs", "localFonts", "passwordEnabled", "passwordHint", "redirectUrl", "frameProtection", "updateFrequency", "downloadMode", "showBranding", "qrEnabled", "shareImage", "formMode", "customCode"];
      entries.set("site_settings", JSON.stringify(Object.fromEntries(Object.entries(settings).filter(([key]) => allowedSettings.includes(key)))));
    } catch {
      return c.json({ error: "As configurações avançadas não são um JSON válido." }, 400);
    }
  }
  if (!entries.size) return c.json({ error: "Nenhum texto válido foi enviado." }, 400);
  for (const [key, value] of Array.from(entries.entries())) {
    const text = String(value).trim();
    const maxLength = key === "home_blocks" ? 20000 : key === "site_settings" ? 50000 : 500;
    if (!text || text.length > maxLength) return c.json({ error: `O campo ${key} excede o limite permitido.` }, 400);
    await c.env.DB.prepare("INSERT INTO site_content (content_key,content_value,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(content_key) DO UPDATE SET content_value=excluded.content_value,updated_at=CURRENT_TIMESTAMP").bind(key, text).run();
  }
  return c.json({ ok: true });
});

// ---------- Testemunhos ----------
app.get("/api/testimonials", async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id,name,content,location,image_url AS imageUrl,display_order AS displayOrder FROM testimonials WHERE active=1 AND moderation_status='approved' ORDER BY display_order ASC,created_at DESC"
  ).all();
  return c.json(rows.results);
});

app.get("/api/testimonials/admin/all", requireAuth, async (c) => {
  const status = c.req.query("status");
  const allowedStatus = ["pending", "approved", "rejected"].includes(status || "") ? status : null;
  const rows = await c.env.DB.prepare(
    `SELECT id,name,content,location,image_url AS imageUrl,active,display_order AS displayOrder,moderation_status AS moderationStatus,submitted_at AS submittedAt,moderated_at AS moderatedAt,moderation_note AS moderationNote,created_at AS createdAt,updated_at AS updatedAt FROM testimonials ${allowedStatus ? "WHERE moderation_status=?" : ""} ORDER BY CASE moderation_status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,display_order ASC,created_at DESC`
  ).bind(...(allowedStatus ? [allowedStatus] : [])).all();
  return c.json(rows.results);
});

app.post("/api/testimonials/submit", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  if (String(body.website || "").trim()) return c.json({ ok: true });
  const name = String(body.name || "").trim();
  const content = String(body.content || "").trim();
  const location = body.location ? String(body.location).trim() : null;
  if (name.length < 2 || name.length > 120) return c.json({ error: "O nome deve ter entre 2 e 120 caracteres." }, 400);
  if (content.length < 10 || content.length > 1000) return c.json({ error: "O testemunho deve ter entre 10 e 1000 caracteres." }, 400);
  if (location && location.length > 120) return c.json({ error: "A localização deve ter no máximo 120 caracteres." }, 400);
  const inserted = await c.env.DB.prepare("INSERT INTO testimonials (name,content,location,active,display_order,moderation_status,submitted_at) VALUES (?,?,?,0,0,'pending',CURRENT_TIMESTAMP)").bind(name, content, location).run();
  await c.env.DB.prepare("INSERT INTO notifications (type,title,message,reference_id) VALUES (?,?,?,?)").bind("testimonial_pending", "Novo testemunho aguardando moderação", `${name} enviou um testemunho para análise.`, inserted.meta.last_row_id).run();
  return c.json({ ok: true });
});

app.post("/api/testimonials", requireAuth, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const content = String(body.content || "").trim();
  const location = body.location ? String(body.location).trim() : null;
  const imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null;
  const displayOrder = Number.isInteger(body.displayOrder) ? body.displayOrder : 0;
  const active = body.active === false ? 0 : 1;
  if (name.length < 2 || name.length > 120) return c.json({ error: "O nome deve ter entre 2 e 120 caracteres." }, 400);
  if (content.length < 10 || content.length > 1000) return c.json({ error: "O testemunho deve ter entre 10 e 1000 caracteres." }, 400);
  if (location && location.length > 120) return c.json({ error: "A localização deve ter no máximo 120 caracteres." }, 400);
  if (imageUrl && !/^https?:\/\//i.test(imageUrl) && !imageUrl.startsWith("/api/media/")) return c.json({ error: "A imagem deve usar uma URL HTTP(S) ou mídia do site." }, 400);
  if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 9999) return c.json({ error: "A ordem deve ser um número inteiro entre 0 e 9999." }, 400);
  await c.env.DB.prepare("INSERT INTO testimonials (name,content,location,image_url,active,display_order) VALUES (?,?,?,?,?,?)").bind(name, content, location, imageUrl, active, displayOrder).run();
  return c.json({ ok: true });
});

app.patch("/api/testimonials/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const content = String(body.content || "").trim();
  const location = body.location ? String(body.location).trim() : null;
  const imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null;
  const displayOrder = Number.isInteger(body.displayOrder) ? body.displayOrder : 0;
  const active = body.active === false ? 0 : 1;
  if (name.length < 2 || name.length > 120 || content.length < 10 || content.length > 1000) return c.json({ error: "Nome ou testemunho inválido." }, 400);
  if (location && location.length > 120) return c.json({ error: "A localização deve ter no máximo 120 caracteres." }, 400);
  if (imageUrl && !/^https?:\/\//i.test(imageUrl) && !imageUrl.startsWith("/api/media/")) return c.json({ error: "A imagem deve usar uma URL HTTP(S) ou mídia do site." }, 400);
  if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 9999) return c.json({ error: "A ordem deve ser um número inteiro entre 0 e 9999." }, 400);
  const result = await c.env.DB.prepare("UPDATE testimonials SET name=?,content=?,location=?,image_url=?,active=?,display_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(name, content, location, imageUrl, active, displayOrder, id).run();
  if (!result.meta.changes) return c.json({ error: "Testemunho não encontrado." }, 404);
  return c.json({ ok: true });
});

app.patch("/api/testimonials/:id/moderate", requireAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const moderationStatus = body.moderationStatus;
  if (!["approved", "rejected"].includes(moderationStatus)) return c.json({ error: "Status de moderação inválido." }, 400);
  const note = body.moderationNote ? String(body.moderationNote).trim().slice(0, 500) : null;
  const active = moderationStatus === "approved" ? 1 : 0;
  const result = await c.env.DB.prepare("UPDATE testimonials SET moderation_status=?,active=?,moderated_at=CURRENT_TIMESTAMP,moderation_note=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(moderationStatus, active, note, id).run();
  if (!result.meta.changes) return c.json({ error: "Testemunho não encontrado." }, 404);
  return c.json({ ok: true });
});

app.delete("/api/testimonials/:id", requireAuth, async (c) => {
  const result = await c.env.DB.prepare("DELETE FROM testimonials WHERE id=?").bind(c.req.param("id")).run();
  if (!result.meta.changes) return c.json({ error: "Testemunho não encontrado." }, 404);
  return c.json({ ok: true });
});

// ---------- Notificações administrativas ----------
app.get("/api/notifications", requireAuth, async (c) => {
  const limitParam = Number(c.req.query("limit") || 30);
  const limit = Number.isInteger(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 30;
  const rows = await c.env.DB.prepare(
    `SELECT id,type,title,message,reference_id AS referenceId,read_at AS readAt,created_at AS createdAt
     FROM notifications ORDER BY created_at DESC LIMIT ${limit}`
  ).all();
  const unread = await c.env.DB.prepare("SELECT COUNT(*) AS count FROM notifications WHERE read_at IS NULL").first();
  return c.json({ items: rows.results, unreadCount: Number((unread as any)?.count || 0) });
});

app.patch("/api/notifications/:id/read", requireAuth, async (c) => {
  const result = await c.env.DB.prepare("UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE id=?").bind(c.req.param("id")).run();
  if (!result.meta.changes) return c.json({ error: "Notificação não encontrada." }, 404);
  return c.json({ ok: true });
});

app.post("/api/notifications/read-all", requireAuth, async (c) => {
  await c.env.DB.prepare("UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE read_at IS NULL").run();
  return c.json({ ok: true });
});

// ---------- Upload de mídia (imagens/áudio) ----------
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 64 * 1024 * 1024;

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
  const kind = body.kind === "audio" || body.kind === "video" ? body.kind : "image";

  if (!base64) return c.json({ error: "Arquivo vazio." }, 400);

  const bytes = base64ToBytes(base64);
  const maxSize = kind === "audio" ? MAX_AUDIO_BYTES : kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
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

app.get("/api/media/list", requireAuth, async (c) => {
  const listed = await c.env.MEDIA.list({ limit: 100 });
  return c.json({
    items: listed.objects.map((object) => ({
      key: object.key,
      url: `/api/media/${object.key}`,
      size: object.size,
      uploaded: object.uploaded,
    })),
  });
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
