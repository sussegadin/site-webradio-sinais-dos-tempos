import { Bell, FileText, HeartHandshake, LayoutDashboard, MessageSquareQuote, Music2, Settings2, Type } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';

const areas = [
  { href: '/admin/editor', icon: FileText, title: 'Blog e matérias', text: 'Criar, editar, publicar, salvar rascunhos e excluir matérias.' },
  { href: '/admin/louvores', icon: Music2, title: 'Louvores e MP3', text: 'Cadastrar, editar, ativar, desativar e remover músicas.' },
  { href: '/admin/patrocinadores', icon: HeartHandshake, title: 'Patrocinadores', text: 'Gerenciar nomes, descrições, logos, links, WhatsApp e áudio.' },
  { href: '/admin/textos', icon: Type, title: 'Textos da home', text: 'Alterar títulos, chamadas, descrições e missão do site.' },
  { href: '/admin/avisos', icon: Bell, title: 'Avisos', text: 'Publicar comunicados, agendar validade e controlar visibilidade.' },
  { href: '/admin/testemunhos', icon: MessageSquareQuote, title: 'Testemunhos', text: 'Revisar, aprovar, editar, ordenar e remover depoimentos.' },
];

export default function AdminDashboard() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <main className="container page-main"><div className="loading-state">Verificando acesso...</div></main>;
  if (!isAuthenticated) return <main className="container page-main"><div className="locked-card"><LayoutDashboard size={36}/><h1>Painel administrativo</h1><p>Entre para editar todas as áreas do site.</p><Link href="/admin/login" className="primary-button">Entrar</Link></div></main>;
  return <main className="container admin-main">
    <div className="admin-header"><div><span className="section-kicker">CONTROLE DO SITE</span><h1>Painel administrativo</h1><p>Escolha uma área para editar o conteúdo publicado na Web Rádio.</p></div><Link href="/" className="text-link">Ver site público</Link></div>
    <section className="site-content-card" style={{ marginBottom: 24 }}><div className="ai-title"><LayoutDashboard size={22}/><div><strong>Editor completo</strong><small>As alterações são salvas no banco Cloudflare e aparecem no site sem editar código.</small></div></div></section>
    <div className="post-grid">{areas.map(({ href, icon: Icon, title, text }) => <Link key={href} href={href} className="sponsor-card" style={{ textDecoration: 'none' }}><Icon size={30} color="var(--gold-light)"/><span className="sponsor-label">EDITAR ÁREA</span><h2>{title}</h2><p>{text}</p><span className="text-link">Abrir editor →</span></Link>)}</div>
    <section className="site-content-card" style={{ marginTop: 24 }}><div className="ai-title"><Settings2 size={22}/><div><strong>Configuração e segurança</strong><small>O acesso é protegido por senha administrativa e sessão segura.</small></div></div></section>
  </main>;
}
