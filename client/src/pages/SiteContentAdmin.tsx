import { useEffect, useState } from 'react';
import { Save, ShieldCheck, Type } from 'lucide-react';
import { Link } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/_core/hooks/useAuth';

const fields = [
  ['hero_eyebrow', 'Texto pequeno acima do título', 'input'],
  ['hero_title_line', 'Primeira linha do título principal', 'input'],
  ['hero_title_accent', 'Linha destacada do título principal', 'input'],
  ['hero_description', 'Descrição principal da página inicial', 'textarea'],
  ['radio_title', 'Título do cartão da rádio', 'input'],
  ['radio_description', 'Descrição do cartão da rádio', 'textarea'],
  ['mission_kicker', 'Texto pequeno da seção de missão', 'input'],
  ['mission_title', 'Título da seção de missão', 'input'],
  ['mission_description', 'Descrição da seção de missão', 'textarea'],
  ['social_whatsapp', 'Link do WhatsApp (https://wa.me/...)', 'input'],
  ['social_facebook', 'Link do Facebook', 'input'],
  ['social_instagram', 'Link do Instagram', 'input'],
  ['social_youtube', 'Link do YouTube', 'input'],
] as const;

export default function SiteContentAdmin() {
  const { isAuthenticated, loading } = useAuth();
  const client = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const content = useQuery<any[]>({ queryKey: ['admin-site-content'], queryFn: () => apiFetch('/api/site-content/admin/all'), enabled: isAuthenticated });
  useEffect(() => { if (content.data) setValues(Object.fromEntries(content.data.map(item => [item.contentKey, item.contentValue]))); }, [content.data]);
  const save = useMutation({ mutationFn: () => apiFetch('/api/site-content', { method: 'PUT', body: JSON.stringify(values) }), onSuccess: () => { client.invalidateQueries({ queryKey: ['site-content'] }); client.invalidateQueries({ queryKey: ['admin-site-content'] }); setSaved(true); setTimeout(() => setSaved(false), 2500); } });
  if (loading) return <main className="container page-main"><div className="loading-state">Verificando acesso...</div></main>;
  if (!isAuthenticated) return <main className="container page-main"><div className="locked-card"><ShieldCheck size={36}/><h1>Área reservada</h1><p>A edição dos textos é exclusiva para a administração.</p><Link href="/admin/login" className="primary-button">Entrar</Link></div></main>;
  return <main className="container admin-main"><div className="admin-header"><div><span className="section-kicker">PAINEL ADMINISTRATIVO</span><h1>Textos e redes sociais</h1><p>Edite as frases da página inicial e os links exibidos no rodapé.</p></div><Link href="/admin" className="text-link">Voltar ao painel</Link></div><section className="site-content-card"><div className="ai-title"><Type size={22}/><div><strong>Página inicial e redes sociais</strong><small>Preencha os links completos, começando com https://.</small></div></div><div className="site-content-grid">{fields.map(([key, label, kind]) => <label key={key}>{label}{kind === 'textarea' ? <textarea value={values[key] || ''} onChange={e=>setValues(prev=>({...prev,[key]:e.target.value}))} maxLength={500}/> : <input type={key.startsWith('social_') ? 'url' : 'text'} value={values[key] || ''} onChange={e=>setValues(prev=>({...prev,[key]:e.target.value}))} maxLength={500}/>}<small>{(values[key] || '').length}/500</small></label>)}</div><div className="editor-actions"><span className="save-status">{saved ? 'Textos e links salvos.' : 'As alterações serão refletidas no site após salvar.'}</span><button className="primary-button" onClick={()=>save.mutate()} disabled={save.isPending}>{save.isPending ? 'Salvando...' : <><Save size={16}/> Salvar alterações</>}</button></div></section></main>;
}
