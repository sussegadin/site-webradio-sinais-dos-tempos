import { useState } from 'react';
import { Bell, Check, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/_core/hooks/useAuth';

type Announcement = { id: number; title: string; message: string; variant: string; linkUrl?: string | null; linkLabel?: string | null; active: number; startsAt?: string | null; endsAt?: string | null };

function toIso(value: string) { return value ? new Date(value).toISOString() : null; }
function formatWindow(value?: string | null) { return value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'sem limite'; }

export default function AnnouncementsAdmin() {
  const { isAuthenticated, loading } = useAuth();
  const client = useQueryClient();
  const [title, setTitle] = useState(''); const [message, setMessage] = useState(''); const [variant, setVariant] = useState('info');
  const [linkUrl, setLinkUrl] = useState(''); const [linkLabel, setLinkLabel] = useState(''); const [startsAt, setStartsAt] = useState(''); const [endsAt, setEndsAt] = useState(''); const [error, setError] = useState('');
  const announcements = useQuery<Announcement[]>({ queryKey: ['admin-announcements'], queryFn: () => apiFetch('/api/announcements/admin/all'), enabled: isAuthenticated });
  const refresh = () => { client.invalidateQueries({ queryKey: ['admin-announcements'] }); client.invalidateQueries({ queryKey: ['announcements'] }); };
  const create = useMutation({ mutationFn: () => apiFetch('/api/announcements', { method: 'POST', body: JSON.stringify({ title, message, variant, linkUrl: linkUrl || null, linkLabel: linkLabel || null, startsAt: toIso(startsAt), endsAt: toIso(endsAt), active: true }) }), onSuccess: () => { setTitle(''); setMessage(''); setLinkUrl(''); setLinkLabel(''); setStartsAt(''); setEndsAt(''); setError(''); refresh(); } });
  const toggle = useMutation({ mutationFn: ({ id, active }: { id: number; active: boolean }) => apiFetch(`/api/announcements/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) }), onSuccess: refresh });
  const remove = useMutation({ mutationFn: (id: number) => apiFetch(`/api/announcements/${id}`, { method: 'DELETE' }), onSuccess: refresh });
  if (loading) return <main className="container page-main"><div className="loading-state">Verificando acesso...</div></main>;
  if (!isAuthenticated) return <main className="container page-main"><div className="locked-card"><ShieldCheck size={36}/><h1>Área reservada</h1><p>O painel de avisos é exclusivo para a administração.</p><Link href="/admin/login" className="primary-button">Entrar</Link></div></main>;
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setError(''); try { await create.mutateAsync(); } catch (err: any) { setError(err.message || 'Não foi possível salvar o aviso.'); } };
  return <main className="container admin-main"><div className="admin-header"><div><span className="section-kicker">PAINEL ADMINISTRATIVO</span><h1>Avisos do site</h1><p>Publique comunicados importantes sem editar o código.</p></div><Link href="/" className="text-link">Ver site público</Link></div>
    <div className="announcement-admin-layout"><form className="editor-card announcement-form" onSubmit={submit}><div className="ai-title"><Bell size={22}/><strong>Novo aviso</strong></div><label>Título<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={120} required placeholder="Ex.: Programação especial hoje"/></label><label>Mensagem<textarea value={message} onChange={e=>setMessage(e.target.value)} maxLength={500} required placeholder="Escreva o comunicado para os ouvintes..."/></label><div className="announcement-fields"><label>Tipo<select value={variant} onChange={e=>setVariant(e.target.value)}><option value="info">Informativo</option><option value="success">Positivo</option><option value="warning">Atenção</option></select></label><label>Texto do link<input value={linkLabel} onChange={e=>setLinkLabel(e.target.value)} placeholder="Saiba mais"/></label></div><label>URL do link<input type="url" value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} placeholder="https://..."/></label><div className="announcement-fields"><label>Exibir a partir de<input type="datetime-local" value={startsAt} onChange={e=>setStartsAt(e.target.value)}/></label><label>Ocultar após<input type="datetime-local" value={endsAt} onChange={e=>setEndsAt(e.target.value)}/></label></div>{error&&<p className="form-error">{error}</p>}<button className="primary-button" disabled={create.isPending}>{create.isPending?'Salvando...':'Publicar aviso'}</button></form>
      <aside className="ai-card"><div className="ai-title"><div><strong>Avisos cadastrados</strong><small>Ativos, inativos e programados</small></div></div>{announcements.isLoading&&<p>Carregando...</p>}{announcements.data?.length ? <div className="announcement-admin-list">{announcements.data.map(item=><div className="announcement-admin-item" key={item.id}><div><strong>{item.title}</strong><small>{item.active?'Ativo':'Inativo'} · {item.variant} · {formatWindow(item.startsAt)} até {formatWindow(item.endsAt)}</small><p>{item.message}</p></div><div className="announcement-admin-actions"><button type="button" title={item.active?'Desativar':'Ativar'} onClick={()=>toggle.mutate({id:item.id,active:!item.active})}>{item.active?<Check size={16}/>:<Bell size={16}/>}</button><button type="button" title="Excluir" onClick={()=>{if(confirm('Excluir este aviso?')) remove.mutate(item.id)}}><Trash2 size={16}/></button></div></div>)}</div>:!announcements.isLoading&&<p>Nenhum aviso cadastrado ainda.</p>}</aside>
    </div></main>;
}
