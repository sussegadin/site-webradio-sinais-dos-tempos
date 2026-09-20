import { useEffect, useRef, useState } from 'react';
import { Bold, ImagePlus, Italic, Link2, List, ListOrdered, Pencil, Quote, Save, Send, ShieldCheck, Trash2, Underline, X } from 'lucide-react';
import { Link } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, imageToUpload } from '@/lib/api';
import { useAuth } from '@/_core/hooks/useAuth';

type Post = { id: number; title: string; summary: string; content: string; category: string; imageUrl?: string | null; status: 'draft' | 'published' };
type FormState = { title: string; summary: string; content: string; category: string; imageUrl: string; imageName: string };
const empty: FormState = { title: '', summary: '', content: '', category: 'Reflexão', imageUrl: '', imageName: '' };

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function toEditorHtml(value: string) {
  if (!value) return '';
  if (/<(?:p|h[1-6]|ul|ol|blockquote|img|div)\b/i.test(value)) return value;
  return value.split(/\n{2,}/).map(paragraph => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join('');
}
function plainTextToEditorHtml(text: string) {
  const normalized = text.replace(/\r\n?/g, '\n').replace(/\s+(A Esperança que Renova|O Poder da Oração|Perseverança que Constrói|Conclusão)\s+/gi, '\n\n$1\n\n');
  return normalized.split(/\n\s*\n/).filter(block => block.trim()).map(block => {
    const clean = block.trim();
    if (/^(A Esperança que Renova|O Poder da Oração|Perseverança que Constrói|Conclusão)$/i.test(clean)) return `<h2>${escapeHtml(clean)}</h2>`;
    return `<p>${escapeHtml(clean).replace(/\n/g, '<br>')}</p>`;
  }).join('');
}
function sanitizePastedHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,meta,link,iframe,object,embed,form').forEach(node => node.remove());
  doc.querySelectorAll('*').forEach(node => {
    Array.from(node.attributes).forEach(attribute => {
      if (attribute.name.toLowerCase().startsWith('on')) node.removeAttribute(attribute.name);
      if (attribute.name.toLowerCase() === 'style') {
        const safe = attribute.value.split(';').filter((rule: string) => /^(font-family|font-size|font-weight|font-style|text-align|color)\s*:/i.test(rule.trim())).join(';');
        if (safe) node.setAttribute('style', safe); else node.removeAttribute('style');
      }
      if (attribute.name.toLowerCase() === 'href' && !/^https?:\/\//i.test(attribute.value) && !attribute.value.startsWith('/')) node.removeAttribute(attribute.name);
      if (attribute.name.toLowerCase() === 'src' && !/^https?:\/\//i.test(attribute.value) && !attribute.value.startsWith('/')) node.removeAttribute(attribute.name);
    });
  });
  return doc.body.innerHTML;
}

function ToolbarButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" className="rich-toolbar-button" title={label} aria-label={label} onMouseDown={event => { event.preventDefault(); onClick(); }}>{children}</button>;
}

export default function Editor() {
  const { isAuthenticated, loading } = useAuth();
  const client = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const posts = useQuery<Post[]>({ queryKey: ['admin-posts'], queryFn: () => apiFetch('/api/posts/admin/all'), enabled: isAuthenticated });
  const upload = useMutation({ mutationFn: (v: any) => apiFetch<{ url: string }>('/api/media/upload', { method: 'POST', body: JSON.stringify({ ...v, kind: 'image' }) }) });
  const save = useMutation({ mutationFn: ({ status, payload }: { status: 'draft' | 'published'; payload: FormState & { content: string } }) => apiFetch(editing ? `/api/posts/${editing}` : '/api/posts', { method: editing ? 'PATCH' : 'POST', body: JSON.stringify({ ...payload, status, imageUrl: payload.imageUrl || null }) }), onSuccess: (_result, variables) => { setForm(empty); setEditing(null); setError(''); setNotice(variables.status === 'published' ? 'Matéria publicada com sucesso.' : 'Rascunho salvo com sucesso.'); if (bodyRef.current) bodyRef.current.innerHTML = ''; client.invalidateQueries({ queryKey: ['admin-posts'] }); client.invalidateQueries({ queryKey: ['posts'] }); }, onError: (error: Error) => { setNotice(''); setError(error.message || 'Não foi possível salvar a matéria.'); } });
  const remove = useMutation({ mutationFn: (id: number) => apiFetch(`/api/posts/${id}`, { method: 'DELETE' }), onSuccess: () => { client.invalidateQueries({ queryKey: ['admin-posts'] }); client.invalidateQueries({ queryKey: ['posts'] }); } });

  useEffect(() => { if (bodyRef.current && document.activeElement !== bodyRef.current) bodyRef.current.innerHTML = toEditorHtml(form.content); }, [editing]);
  if (loading) return <main className="container page-main"><div className="loading-state">Verificando acesso...</div></main>;
  if (!isAuthenticated) return <main className="container page-main"><div className="locked-card"><ShieldCheck size={36}/><h1>Área reservada</h1><p>O editor é exclusivo para a administração.</p><Link href="/admin/login" className="primary-button">Entrar</Link></div></main>;

  const set = (key: keyof FormState, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const updateContent = () => set('content', bodyRef.current?.innerHTML || '');
  const edit = (post: Post) => { setEditing(post.id); setForm({ title: post.title, summary: post.summary, content: post.content, category: post.category, imageUrl: post.imageUrl || '', imageName: '' }); setError(''); setNotice(''); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => { setForm(empty); setEditing(null); setError(''); setNotice(''); if (bodyRef.current) bodyRef.current.innerHTML = ''; };
  const chooseImage = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; try { if (!file.type.startsWith('image/')) throw new Error('Escolha uma imagem.'); const prepared = await imageToUpload(file); const stored = await upload.mutateAsync(prepared); setForm(prev => ({ ...prev, imageUrl: stored.url, imageName: file.name })); setNotice('Imagem preparada e adicionada automaticamente.'); } catch (e: any) { setError(e.message); } event.target.value = ''; };
  const uploadInlineImage = async (file: File) => { if (!file.type.startsWith('image/')) return; setUploadingImage(true); try { const prepared = await imageToUpload(file); const stored = await upload.mutateAsync(prepared); document.execCommand('insertHTML', false, `<img src="${stored.url}" alt="${escapeHtml(file.name)}" />`); updateContent(); setNotice('Imagem preparada e inserida automaticamente.'); } catch (e: any) { setError(e.message || 'Não foi possível inserir a imagem.'); } finally { setUploadingImage(false); } };
  const paste = async (event: React.ClipboardEvent<HTMLDivElement>) => { const image = Array.from(event.clipboardData.files).find(file => file.type.startsWith('image/')); if (image) { event.preventDefault(); await uploadInlineImage(image); return; } const html = event.clipboardData.getData('text/html'); const plain = event.clipboardData.getData('text/plain'); if (html || plain) { event.preventDefault(); document.execCommand('insertHTML', false, html ? sanitizePastedHtml(html) : plainTextToEditorHtml(plain)); updateContent(); setNotice('Texto colado preservando títulos, parágrafos e estilos básicos.'); } };
  const command = (name: string, value?: string) => { bodyRef.current?.focus(); document.execCommand(name, false, value); updateContent(); };
  const addLink = () => { const url = window.prompt('Cole o endereço do link:'); if (url) command('createLink', url); };
  const publish = async (status: 'draft' | 'published') => { const content = bodyRef.current?.innerHTML?.trim() || ''; const payload = { ...form, title: form.title.trim(), summary: form.summary.trim(), category: form.category.trim() || 'Reflexão', content }; setForm(prev => ({ ...prev, ...payload })); if (!payload.title || !content.replace(/<[^>]+>/g, '').trim()) { setError('Informe o título e escreva o conteúdo da matéria.'); setNotice(''); return; } setError(''); setNotice('Salvando matéria...'); try { await save.mutateAsync({ status, payload }); } catch { /* O erro já é exibido pelo onError da mutation. */ } };

  return <main className="container admin-main"><div className="admin-header"><div><span className="section-kicker">PAINEL ADMINISTRATIVO</span><h1>Editor de matérias</h1><p>{editing ? 'Edite, cole o texto e publique sem perder a estrutura.' : 'Cole o texto da matéria, adicione imagens e publique.'}</p></div><Link href="/admin" className="text-link">Voltar ao painel</Link></div>
    <div className="editor-layout"><section className="editor-card rich-editor-card"><label className="editor-field"><span>Título da matéria *</span><input className="editor-title" value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Digite o título da matéria" /></label><label className="editor-field"><span>Resumo curto</span><input className="editor-summary" value={form.summary} onChange={e=>set('summary',e.target.value)} placeholder="Escreva um resumo para o blog" /></label><label className="editor-field"><span>Categoria</span><input className="editor-summary" value={form.category} onChange={e=>set('category',e.target.value)} placeholder="Ex.: Reflexão" /></label>
      <div className="image-upload"><input ref={fileRef} type="file" accept="image/*" onChange={chooseImage} hidden/><button type="button" className="image-upload-button" onClick={()=>fileRef.current?.click()} disabled={upload.isPending}><ImagePlus size={18}/>{upload.isPending?'Enviando...':'Imagem de capa'}</button>{form.imageName && <span className="image-name">{form.imageName}</span>}{form.imageUrl && <img className="image-preview" src={form.imageUrl} alt="Prévia"/>}</div>
      <div className="rich-editor-help">Cole diretamente do Word, Google Docs ou WhatsApp. Títulos, parágrafos, listas e imagens serão mantidos.</div>
      <div className="rich-toolbar" role="toolbar" aria-label="Formatação da matéria"><ToolbarButton label="Negrito" onClick={()=>command('bold')}><Bold size={16}/></ToolbarButton><ToolbarButton label="Itálico" onClick={()=>command('italic')}><Italic size={16}/></ToolbarButton><ToolbarButton label="Sublinhado" onClick={()=>command('underline')}><Underline size={16}/></ToolbarButton><ToolbarButton label="Título" onClick={()=>command('formatBlock','h2')}>H2</ToolbarButton><ToolbarButton label="Subtítulo" onClick={()=>command('formatBlock','h3')}>H3</ToolbarButton><ToolbarButton label="Lista" onClick={()=>command('insertUnorderedList')}><List size={16}/></ToolbarButton><ToolbarButton label="Lista numerada" onClick={()=>command('insertOrderedList')}><ListOrdered size={16}/></ToolbarButton><ToolbarButton label="Citação" onClick={()=>command('formatBlock','blockquote')}><Quote size={16}/></ToolbarButton><ToolbarButton label="Inserir link" onClick={addLink}><Link2 size={16}/></ToolbarButton><ToolbarButton label="Inserir imagem" onClick={()=>fileRef.current?.click()}><ImagePlus size={16}/></ToolbarButton></div>
      <div ref={bodyRef} className="rich-editor-content" contentEditable suppressContentEditableWarning onInput={updateContent} onPaste={paste} data-placeholder="Escreva ou cole aqui o conteúdo da matéria..." aria-label="Conteúdo da matéria" />
      {uploadingImage && <p className="rich-editor-status">Enviando imagem colada...</p>}{error&&<p className="form-error">{error}</p>}{notice&&<p className="form-success">{notice}</p>}<div className="editor-actions"><button type="button" className="ghost-button" onClick={reset}><X size={16}/> {editing?'Cancelar':'Limpar'}</button><button type="button" className="ghost-button" onClick={()=>publish('draft')} disabled={save.isPending}><Save size={16}/> {save.isPending?'Salvando...':'Salvar rascunho'}</button><button type="button" className="primary-button" onClick={()=>publish('published')} disabled={save.isPending}><Send size={16}/> {save.isPending?'Publicando...':'Salvar e publicar matéria'}</button></div>
    </section><aside className="ai-card"><div className="ai-title"><div><strong>Matérias cadastradas</strong><small>Abra uma matéria para editar</small></div></div>{posts.isLoading&&<p>Carregando...</p>}{posts.data?.length ? posts.data.map(post=><div className="testimonial-admin-item" key={post.id}><div><strong>{post.title}</strong><small>{post.status==='published'?'Publicada':'Rascunho'} · {post.category}</small></div><div className="announcement-admin-actions"><button type="button" title="Editar" onClick={()=>edit(post)}><Pencil size={16}/></button><button type="button" title="Excluir" onClick={()=>{if(confirm('Excluir esta matéria?')) remove.mutate(post.id)}}><Trash2 size={16}/></button></div></div>):!posts.isLoading&&<p>Nenhuma matéria cadastrada.</p>}</aside></div></main>;
}
