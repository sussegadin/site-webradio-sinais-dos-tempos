import { useEffect, useMemo, useState } from 'react';
import { Check, Eye, EyeOff, GripVertical, LayoutTemplate, MonitorPlay, Plus, Save, Trash2, Type, X } from 'lucide-react';
import { Link } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/_core/hooks/useAuth';

type Block = { id: string; type: string; label: string; title: string; body: string; visible: boolean };

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

  const content = useQuery<any[]>({
    queryKey: ['admin-site-content'],
    queryFn: () => apiFetch('/api/site-content/admin/all'),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const raw = content.data?.find((item: any) => item.contentKey === 'home_blocks')?.contentValue;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        setBlocks(parsed);
        setSelectedId(parsed[0].id);
      }
    } catch { /* usa os blocos padrão */ }
  }, [content.data]);

  const selected = useMemo(() => blocks.find(block => block.id === selectedId) || blocks[0], [blocks, selectedId]);

  useEffect(() => {
    if (selected) setDraft({ ...selected });
  }, [selectedId, selected?.id]);

  const save = useMutation({
    mutationFn: (nextBlocks: Block[]) => apiFetch('/api/site-content', {
      method: 'PUT',
      body: JSON.stringify({ home_blocks: JSON.stringify(nextBlocks) }),
    }),
    onSuccess: () => {
      setSaved(true);
      setNotice('Site publicado com sucesso.');
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (loading) return <main className="container page-main"><div className="loading-state">Verificando acesso...</div></main>;
  if (!isAuthenticated) return <main className="container page-main"><div className="locked-card"><LayoutTemplate size={36} /><h1>Editor visual</h1><p>Entre para alterar a estrutura da página inicial.</p><Link href="/admin/login" className="primary-button">Entrar</Link></div></main>;

  const selectBlock = (block: Block) => {
    setSelectedId(block.id);
    setNotice('');
  };

  const applyDraft = () => {
    if (!draft) return;
    setBlocks(prev => prev.map(block => block.id === draft.id ? draft : block));
    setNotice(`Alterações aplicadas somente em “${draft.label}”. Clique em “Publicar site” para colocar no ar.`);
  };

  const add = () => {
    const block: Block = { id: `custom-${Date.now()}`, type: 'custom', label: 'Nova seção', title: 'Nova seção', body: 'Escreva o conteúdo desta seção.', visible: true };
    setBlocks(prev => [...prev, block]);
    setSelectedId(block.id);
    setNotice('Nova seção criada como rascunho.');
  };

  const move = (target: string) => {
    if (!drag || drag === target) return;
    const next = [...blocks];
    const from = next.findIndex(block => block.id === drag);
    const to = next.findIndex(block => block.id === target);
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setBlocks(next);
    setDrag(null);
    setNotice('Ordem alterada no rascunho.');
  };

  const toggle = (block: Block) => {
    setBlocks(prev => prev.map(item => item.id === block.id ? { ...item, visible: !item.visible } : item));
    setNotice(`Visibilidade de “${block.label}” alterada no rascunho.`);
  };

  const remove = (block: Block) => {
    if (!window.confirm(`Excluir somente “${block.label}”?`)) return;
    const next = blocks.filter(item => item.id !== block.id);
    setBlocks(next);
    setSelectedId(next[0]?.id || '');
    setNotice('Bloco removido do rascunho.');
  };

  return <main className="container admin-main">
    <div className="admin-header">
      <div><span className="section-kicker">EDITOR DO SITE</span><h1>Minha página inicial</h1><p>Como no Carrd: escolha uma seção à esquerda e edite somente essa seção.</p></div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Link href="/" className="text-link"><MonitorPlay size={16} /> Pré-visualizar</Link><Link href="/admin" className="text-link">Painel</Link></div>
    </div>

    {notice && <div className="site-content-card" role="status" style={{ marginBottom: 18, display: 'flex', gap: 10, alignItems: 'center' }}><Check size={18} color="var(--gold-light)" />{notice}</div>}

    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 340px) minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>
      <aside className="editor-card" style={{ position: 'sticky', top: 20 }}>
        <div className="ai-title"><LayoutTemplate size={22} /><div><strong>Seções da página</strong><small>Selecione uma seção para editar</small></div></div>
        <div style={{ display: 'grid', gap: 8 }}>
          {blocks.map((block, index) => <div key={block.id} draggable onDragStart={() => setDrag(block.id)} onDragOver={event => event.preventDefault()} onDrop={() => move(block.id)} onClick={() => selectBlock(block)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 10px', borderRadius: 8, border: `1px solid ${selected?.id === block.id ? 'var(--gold-light)' : 'rgba(255,255,255,.12)'}`, background: selected?.id === block.id ? 'rgba(212,164,65,.12)' : 'transparent', opacity: block.visible ? 1 : .52, cursor: 'pointer' }}>
            <GripVertical size={16} aria-label="Arrastar para ordenar" /><span style={{ flex: 1 }}><strong style={{ display: 'block' }}>{index + 1}. {block.label}</strong><small>{block.visible ? 'Visível' : 'Oculto'}</small></span><button type="button" title={block.visible ? 'Ocultar esta seção' : 'Mostrar esta seção'} onClick={event => { event.stopPropagation(); toggle(block); }}>{block.visible ? <Eye size={15} /> : <EyeOff size={15} />}</button>
          </div>)}
        </div>
        <button className="ghost-button" type="button" onClick={add} style={{ width: '100%', marginTop: 14 }}><Plus size={16} /> Nova seção</button>
        <div className="editor-actions" style={{ marginTop: 16 }}><span className="save-status">{saved ? 'Publicado' : 'Rascunho'}</span><button className="primary-button" type="button" onClick={() => save.mutate(blocks)} disabled={save.isPending}><Save size={16} /> {save.isPending ? 'Publicando...' : 'Publicar site'}</button></div>
      </aside>

      <section className="editor-card">
        {draft && selected ? <><div className="ai-title"><div><span className="section-kicker">SEÇÃO SELECIONADA</span><strong>{selected.label}</strong><small>Somente esta seção será alterada.</small></div><span style={{ color: selected.visible ? 'var(--gold-light)' : 'var(--muted)' }}>{selected.visible ? 'Ativa' : 'Oculta'}</span></div>
          <div className="site-content-card" style={{ marginBottom: 20 }}><span className="section-kicker">PRÉVIA DO BLOCO</span><h2 style={{ margin: '8px 0' }}>{draft.title || 'Sem título'}</h2><p style={{ marginBottom: 0 }}>{draft.body || 'Sem descrição'}</p></div>
          <div style={{ display: 'grid', gap: 16 }}><label>Nome da seção<input value={draft.label} onChange={event => setDraft({ ...draft, label: event.target.value })} /></label><label>Título<input value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label><label>Descrição<textarea rows={6} value={draft.body} onChange={event => setDraft({ ...draft, body: event.target.value })} /></label></div>
          <div className="editor-actions"><button className="ghost-button" type="button" onClick={() => setDraft({ ...selected })}><X size={16} /> Descartar alterações</button><button className="primary-button" type="button" onClick={applyDraft}><Check size={16} /> Aplicar nesta seção</button>{selected.type === 'custom' && <button type="button" title="Excluir somente esta seção" onClick={() => remove(selected)}><Trash2 size={16} /></button>}</div>
        </> : <div className="locked-card"><Type size={30} /><h2>Selecione uma seção</h2><p>Escolha uma seção na coluna esquerda para começar.</p></div>}
      </section>
    </div>
  </main>;
}
