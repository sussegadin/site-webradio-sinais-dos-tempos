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
  return <main className="container admin-main"><div className="admin-header"><div><span className="section-kicker">PAINEL ADMINISTRATIVO</span><h1>Textos do site</h1><p>Edite as frases da página inicial sem alterar o código.</p></div><Link href="/" className="text-link">Ver site público</Link></div><section className="site-content-card"><div className="ai-title"><Type size={22}/><div><strong>Página inicial</strong><small>Os campos abaixo aparecem na home do site.</small></div></div><div className="site-content-grid">{fields.map(([key, label, kind]) => <label key={key}>{label}{kind === 'textarea' ? <textarea value={values[key] || ''} onChange={e=>setValues(prev=>({...prev,[key]:e.target.value}))} maxLength={500}/> : <input value={values[key] || ''} onChange={e=>setValues(prev=>({...prev,[key]:e.target.value}))} maxLength={500}/>}<small>{(values[key] || '').length}/500</small></label>)}</div><div className="editor-actions"><span className="save-status">{saved ? 'Textos salvos.' : 'As alterações serão refletidas na página inicial após salvar.'}</span><button className="primary-button" onClick={()=>save.mutate()} disabled={save.isPending}>{save.isPending ? 'Salvando...' : <><Save size={16}/> Salvar textos</>}</button></div></section></main>;
}
