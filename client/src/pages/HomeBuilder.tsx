import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Eye, EyeOff, GripVertical, ImagePlus, LayoutTemplate, MonitorPlay, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { Link } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch, fileToBase64 } from '@/lib/api';
import { useAuth } from '@/_core/hooks/useAuth';

type Block = { id: string; type: string; label: string; title: string; body: string; visible: boolean; imageUrl?: string; buttonText?: string; buttonUrl?: string };

const defaults: Block[] = [
  { id: 'hero', type: 'hero', label: 'Capa principal', title: 'Mensagem que transforma vidas.', body: 'Imagem, título, chamada e botões da primeira tela.', visible: true },
  { id: 'radio', type: 'radio', label: 'Rádio ao vivo', title: 'Uma programação para acompanhar você', body: 'Cartão de transmissão online.', visible: true },
  { id: 'blog', type: 'blog', label: 'Matérias', title: 'Palavras para o caminho', body: 'Grade com as últimas matérias publicadas.', visible: true },
  { id: 'testimonials', type: 'testimonials', label: 'Testemunhos', title: 'Palavras que renovam a esperança.', body: 'Depoimentos aprovados dos ouvintes.', visible: true },
  { id: 'mission', type: 'mission', label: 'Nossa missão', title: 'Conteúdo que aponta para o alto.', body: 'Texto institucional e chamada final.', visible: true },
];

export default function HomeBuilder() {
  const { isAuthenticated, loading } = useAuth();
  const [blocks, setBlocks] = useState<Block[]>(defaults);
  const [selectedId, setSelectedId] = useState('hero');
  const [draft, setDraft] = useState<Block | null>(null);
  const [drag, setDrag] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const content = useQuery<any[]>({ queryKey: ['admin-site-content'], queryFn: () => apiFetch('/api/site-content/admin/all'), enabled: isAuthenticated });
  useEffect(() => {
    const raw = content.data?.find((item: any) => item.contentKey === 'home_blocks')?.contentValue;
    if (!raw) return;
    try { const parsed = JSON.parse(raw); if (Array.isArray(parsed) && parsed.length) { setBlocks(parsed); setSelectedId(parsed[0].id); } } catch { /* usa padrão */ }
  }, [content.data]);

  const selected = useMemo(() => blocks.find(block => block.id === selectedId) || blocks[0], [blocks, selectedId]);
  useEffect(() => { if (selected) setDraft({ ...selected }); }, [selectedId, selected?.id]);

  const publishPayload = (nextBlocks: Block[]) => {
    const byType = (type: string) => nextBlocks.find(block => block.type === type);
    const hero = byType('hero');
    const radio = byType('radio');
    const mission = byType('mission');
    return {
      home_blocks: JSON.stringify(nextBlocks),
      ...(hero ? { hero_title_line: hero.title, hero_title_accent: '', hero_description: hero.body } : {}),
      ...(radio ? { radio_title: radio.title, radio_description: radio.body } : {}),
      ...(mission ? { mission_title: mission.title, mission_description: mission.body } : {}),
    };
  };

  const save = useMutation({
    mutationFn: (nextBlocks: Block[]) => apiFetch('/api/site-content', { method: 'PUT', body: JSON.stringify(publishPayload(nextBlocks)) }),
    onSuccess: () => { setSaved(true); setNotice('Site publicado com sucesso.'); setError(''); setTimeout(() => setSaved(false), 2500); },
    onError: (err: any) => setError(err.message || 'Não foi possível publicar as alterações.'),
  });
  const upload = useMutation({ mutationFn: (value: any) => apiFetch<{ url: string }>('/api/media/upload', { method: 'POST', body: JSON.stringify({ ...value, kind: 'image' }) }) });

  if (loading) return <main className="container page-main"><div className="loading-state">Verificando acesso...</div></main>;
  if (!isAuthenticated) return <main className="container page-main"><div className="locked-card"><LayoutTemplate size={36} /><h1>Editor visual</h1><p>Entre para alterar a estrutura da página inicial.</p><Link href="/admin/login" className="primary-button">Entrar</Link></div></main>;

  const setDraftField = (key: keyof Block, value: string) => setDraft(prev => prev ? { ...prev, [key]: value } : prev);
  const selectBlock = (block: Block) => { setSelectedId(block.id); setNotice(''); setError(''); };
  const applyDraft = () => { if (!draft) return; setBlocks(prev => prev.map(block => block.id === draft.id ? draft : block)); setNotice(`Alterações aplicadas somente em “${draft.label}”. Clique em “Publicar site”.`); };
  const chooseImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file || !draft) return;
    if (!file.type.startsWith('image/')) { setError('Escolha um arquivo de imagem.'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('A imagem deve ter no máximo 8 MB.'); return; }
    try { setError(''); const stored = await upload.mutateAsync({ fileName: file.name, mimeType: file.type, base64: await fileToBase64(file) }); setDraftField('imageUrl', stored.url); setNotice('Imagem carregada no rascunho. Clique em “Aplicar nesta seção” e depois em “Publicar site”.'); } catch (err: any) { setError(err.message || 'Não foi possível carregar a imagem.'); }
    event.target.value = '';
  };
  const add = () => { const block: Block = { id: `custom-${Date.now()}`, type: 'custom', label: 'Nova seção', title: 'Nova seção', body: 'Escreva o conteúdo desta seção.', visible: true }; setBlocks(prev => [...prev, block]); setSelectedId(block.id); setNotice('Nova seção criada no rascunho.'); };
  const move = (target: string) => { if (!drag || drag === target) return; const next = [...blocks]; const from = next.findIndex(block => block.id === drag); const to = next.findIndex(block => block.id === target); const [item] = next.splice(from, 1); next.splice(to, 0, item); setBlocks(next); setDrag(null); setNotice('Ordem alterada no rascunho.'); };
  const toggle = (block: Block) => { setBlocks(prev => prev.map(item => item.id === block.id ? { ...item, visible: !item.visible } : item)); setNotice(`Visibilidade de “${block.label}” alterada no rascunho.`); };
  const remove = (block: Block) => { if (!window.confirm(`Excluir somente “${block.label}”?`)) return; const next = blocks.filter(item => item.id !== block.id); setBlocks(next); setSelectedId(next[0]?.id || ''); setNotice('Bloco removido do rascunho.'); };

  return <main className="container admin-main">
    <div className="admin-header"><div><span className="section-kicker">EDITOR DO SITE</span><h1>Minha página inicial</h1><p>Selecione uma seção, edite os campos e publique quando estiver pronto.</p></div><div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Link href="/" className="text-link"><MonitorPlay size={16} /> Pré-visualizar</Link><Link href="/admin" className="text-link">Painel</Link></div></div>
    {notice && <div className="site-content-card" role="status" style={{ marginBottom: 18, display: 'flex', gap: 10, alignItems: 'center' }}><Check size={18} color="var(--gold-light)" />{notice}</div>}
    {error && <div className="form-error" role="alert" style={{ marginBottom: 18 }}>{error}</div>}
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 340px) minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>
      <aside className="editor-card" style={{ position: 'sticky', top: 20 }}><div className="ai-title"><LayoutTemplate size={22} /><div><strong>Seções da página</strong><small>Clique em uma seção para editar</small></div></div><div style={{ display: 'grid', gap: 8 }}>{blocks.map((block, index) => <div key={block.id} draggable onDragStart={() => setDrag(block.id)} onDragOver={event => event.preventDefault()} onDrop={() => move(block.id)} onClick={() => selectBlock(block)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 10px', borderRadius: 8, border: `1px solid ${selected?.id === block.id ? 'var(--gold-light)' : 'rgba(255,255,255,.12)'}`, background: selected?.id === block.id ? 'rgba(212,164,65,.12)' : 'transparent', opacity: block.visible ? 1 : .52, cursor: 'pointer' }}><GripVertical size={16} /><span style={{ flex: 1 }}><strong style={{ display: 'block' }}>{index + 1}. {block.label}</strong><small>{block.visible ? 'Visível' : 'Oculto'}</small></span><button type="button" title={block.visible ? 'Ocultar esta seção' : 'Mostrar esta seção'} onClick={event => { event.stopPropagation(); toggle(block); }}>{block.visible ? <Eye size={15} /> : <EyeOff size={15} />}</button></div>)}</div><button className="ghost-button" type="button" onClick={add} style={{ width: '100%', marginTop: 14 }}><Plus size={16} /> Nova seção</button><div className="editor-actions" style={{ marginTop: 16 }}><span className="save-status">{saved ? 'Publicado' : 'Rascunho'}</span><button className="primary-button" type="button" onClick={() => save.mutate(blocks)} disabled={save.isPending}><Save size={16} /> {save.isPending ? 'Publicando...' : 'Publicar site'}</button></div></aside>
      <section className="editor-card">{draft && selected ? <><div className="ai-title"><div><span className="section-kicker">EDITANDO SOMENTE ESTA SEÇÃO</span><strong>{selected.label}</strong><small>Os outros blocos não serão alterados.</small></div><span style={{ color: selected.visible ? 'var(--gold-light)' : 'var(--muted)' }}>{selected.visible ? 'Ativa' : 'Oculta'}</span></div><div className="site-content-card" style={{ marginBottom: 20 }}><span className="section-kicker">PRÉVIA AO VIVO</span>{draft.imageUrl && <img src={draft.imageUrl} alt="Prévia da seção" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8, margin: '10px 0' }} />}<h2 style={{ margin: '8px 0' }}>{draft.title || 'Sem título'}</h2><p style={{ marginBottom: 0 }}>{draft.body || 'Sem descrição'}</p></div><div style={{ display: 'grid', gap: 16 }}><label>Nome da seção<input autoComplete="off" value={draft.label} onChange={event => setDraftField('label', event.target.value)} /></label><label>Título<input autoComplete="off" value={draft.title} onChange={event => setDraftField('title', event.target.value)} /></label><label>Descrição<textarea rows={6} value={draft.body} onChange={event => setDraftField('body', event.target.value)} /></label><div className="image-upload"><input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={chooseImage} hidden/><button type="button" className="image-upload-button" onClick={() => fileRef.current?.click()} disabled={upload.isPending}><ImagePlus size={18} />{upload.isPending ? 'Carregando imagem...' : 'Escolher imagem desta seção'}</button>{draft.imageUrl && <button type="button" className="ghost-button" onClick={() => setDraftField('imageUrl', '')}><X size={16} /> Remover imagem</button>}<small><Upload size={13} /> PNG, JPG, WEBP ou GIF até 8 MB.</small></div><label>Texto do botão (opcional)<input autoComplete="off" value={draft.buttonText || ''} onChange={event => setDraftField('buttonText', event.target.value)} placeholder="Ex.: Ouça ao vivo" /></label><label>Link do botão (opcional)<input autoComplete="off" value={draft.buttonUrl || ''} onChange={event => setDraftField('buttonUrl', event.target.value)} placeholder="Ex.: /louvores ou https://..." /></label></div><div className="editor-actions"><button className="ghost-button" type="button" onClick={() => setDraft({ ...selected })}><X size={16} /> Descartar alterações</button><button className="primary-button" type="button" onClick={applyDraft}><Check size={16} /> Aplicar nesta seção</button>{selected.type === 'custom' && <button type="button" title="Excluir somente esta seção" onClick={() => remove(selected)}><Trash2 size={16} /></button>}</div></> : <div className="locked-card"><LayoutTemplate size={30} /><h2>Selecione uma seção</h2><p>Escolha uma seção na coluna esquerda para começar.</p></div>}</section>
    </div>
  </main>;
}
