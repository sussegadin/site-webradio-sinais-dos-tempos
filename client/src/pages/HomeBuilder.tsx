import { useEffect, useState } from 'react';
import { Check, Eye, EyeOff, GripVertical, LayoutTemplate, Plus, Save, Trash2, Type, X } from 'lucide-react';
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
  const [drag, setDrag] = useState<string | null>(null);
  const [editing, setEditing] = useState<Block | null>(null);
  const [draft, setDraft] = useState<Block | null>(null);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');

  const content = useQuery<any[]>({
    queryKey: ['admin-site-content'],
    queryFn: () => apiFetch('/api/site-content/admin/all'),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const raw = content.data?.find((x: any) => x.contentKey === 'home_blocks')?.contentValue;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setBlocks(parsed);
      } catch { /* mantém os blocos padrão */ }
    }
  }, [content.data]);

  const save = useMutation({
    mutationFn: (nextBlocks: Block[]) => apiFetch('/api/site-content', {
      method: 'PUT',
      body: JSON.stringify({ home_blocks: JSON.stringify(nextBlocks) }),
    }),
    onSuccess: () => {
      setSaved(true);
      setNotice('Alterações publicadas com sucesso.');
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (loading) return <main className="container page-main"><div className="loading-state">Verificando acesso...</div></main>;
  if (!isAuthenticated) return <main className="container page-main"><div className="locked-card"><LayoutTemplate size={36} /><h1>Editor visual</h1><p>Entre para alterar a estrutura da página inicial.</p><Link href="/admin/login" className="primary-button">Entrar</Link></div></main>;

  const openEditor = (block: Block) => {
    setEditing(block);
    setDraft({ ...block });
    setNotice('');
  };

  const closeEditor = () => {
    setEditing(null);
    setDraft(null);
  };

  const applyEditor = () => {
    if (!draft) return;
    setBlocks(prev => prev.map(block => block.id === draft.id ? draft : block));
    setNotice(`“${draft.label}” foi alterado nesta sessão. Clique em “Publicar alterações” para colocar no ar.`);
    closeEditor();
  };

  const add = () => {
    const newBlock: Block = { id: `custom-${Date.now()}`, type: 'custom', label: 'Nova seção', title: 'Nova seção', body: 'Escreva o conteúdo desta seção.', visible: true };
    setBlocks(prev => [...prev, newBlock]);
    openEditor(newBlock);
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
    setNotice('Ordem alterada nesta sessão. Publique para confirmar.');
  };

  const toggleVisibility = (block: Block) => {
    const action = block.visible ? 'ocultar' : 'mostrar';
    if (!window.confirm(`Deseja ${action} somente o bloco “${block.label}”?`)) return;
    setBlocks(prev => prev.map(item => item.id === block.id ? { ...item, visible: !item.visible } : item));
    setNotice(`O bloco “${block.label}” será ${action === 'ocultar' ? 'ocultado' : 'mostrado'} após publicar.`);
  };

  const remove = (block: Block) => {
    if (!window.confirm(`Excluir definitivamente o bloco “${block.label}”?`)) return;
    setBlocks(prev => prev.filter(item => item.id !== block.id));
    setNotice(`O bloco “${block.label}” foi removido da lista. Publique para confirmar.`);
  };

  return <main className="container admin-main">
    <div className="admin-header">
      <div><span className="section-kicker">EDITOR VISUAL</span><h1>Estrutura da página inicial</h1><p>Edite um bloco por vez. Nada é publicado até você clicar em “Publicar alterações”.</p></div>
      <Link href="/admin" className="text-link">Voltar ao painel</Link>
    </div>

    {notice && <div className="site-content-card" role="status" style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}><Check size={18} color="var(--gold-light)" />{notice}</div>}

    <section className="editor-card">
      <div className="ai-title"><LayoutTemplate size={22} /><div><strong>Escolha um bloco para editar</strong><small>Cada cartão abaixo controla somente a sua própria seção.</small></div></div>
      <div style={{ display: 'grid', gap: 12 }}>
        {blocks.map(block => <div key={block.id} className="testimonial-admin-item" draggable onDragStart={() => setDrag(block.id)} onDragOver={event => event.preventDefault()} onDrop={() => move(block.id)} style={{ opacity: block.visible ? 1 : .58 }}>
          <GripVertical size={18} aria-label="Arraste para ordenar" />
          <div style={{ flex: 1, minWidth: 0 }}><strong>{block.label}</strong><small style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{block.title}</small><small>{block.visible ? 'Visível no site' : 'Oculto no site'}</small></div>
          <button type="button" title={block.visible ? 'Ocultar somente este bloco' : 'Mostrar somente este bloco'} onClick={() => toggleVisibility(block)}>{block.visible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
          <button type="button" className="primary-button" title={`Editar somente ${block.label}`} onClick={() => openEditor(block)}><Type size={16} /> Editar este bloco</button>
          {block.type === 'custom' && <button type="button" title="Excluir somente este bloco" onClick={() => remove(block)}><Trash2 size={16} /></button>}
        </div>)}
      </div>
      <button className="ghost-button" type="button" onClick={add}><Plus size={16} /> Adicionar novo bloco</button>
      <div className="editor-actions"><span className="save-status">{saved ? 'Publicado.' : 'As alterações estão em rascunho até publicar.'}</span><button className="primary-button" type="button" onClick={() => save.mutate(blocks)} disabled={save.isPending}><Save size={16} /> {save.isPending ? 'Publicando...' : 'Publicar alterações'}</button></div>
    </section>

    {editing && draft && <div className="editor-card" style={{ marginTop: 24 }}>
      <div className="ai-title"><div><span className="section-kicker">EDITANDO SOMENTE ESTE BLOCO</span><strong>{editing.label}</strong><small>As mudanças abaixo não afetam os outros blocos.</small></div><button type="button" title="Fechar sem aplicar" onClick={closeEditor}><X size={18} /></button></div>
      <label>Nome da seção<input value={draft.label} onChange={event => setDraft({ ...draft, label: event.target.value })} /></label>
      <label>Título<input value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label>
      <label>Descrição<textarea rows={5} value={draft.body} onChange={event => setDraft({ ...draft, body: event.target.value })} /></label>
      <div className="site-content-card" style={{ marginTop: 16 }}><strong>Antes de aplicar</strong><p style={{ marginBottom: 0 }}>Confira se você está editando “{editing.label}”. Os outros blocos não serão alterados.</p></div>
      <div className="editor-actions"><button className="ghost-button" type="button" onClick={closeEditor}>Cancelar</button><button className="primary-button" type="button" onClick={applyEditor}><Check size={16} /> Aplicar somente neste bloco</button></div>
    </div>}
  </main>;
}
