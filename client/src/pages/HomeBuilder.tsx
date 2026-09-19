import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3, Check, ChevronDown, ChevronRight, Code2, Copy, Eye, EyeOff,
  FileArchive, FileText, FolderOpen, Globe2, GripVertical, ImagePlus, KeyRound,
  LayoutTemplate, Link2, MonitorPlay, Move, Palette, Plus, Save, Settings2,
  ShieldCheck, SlidersHorizontal, Sparkles, Trash2, Type, Upload, Video, X,
} from 'lucide-react';
import { Link } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch, fileToBase64 } from '@/lib/api';
import { useAuth } from '@/_core/hooks/useAuth';

type Block = {
  id: string; type: string; label: string; title: string; body: string; visible: boolean;
  imageUrl?: string; buttonText?: string; buttonUrl?: string; style?: Record<string, string>;
};

type SiteSettings = {
  customDomain: string; faviconUrl: string; seoTitle: string; seoDescription: string; canonicalUrl: string;
  ogImage: string; analyticsId: string; customCss: string; customJs: string; localFonts: string;
  passwordEnabled: boolean; passwordHint: string; redirectUrl: string; frameProtection: boolean;
  updateFrequency: string; downloadMode: boolean; showBranding: boolean; qrEnabled: boolean;
  shareImage: string; formMode: string; customCode: string;
};

const defaults: Block[] = [
  { id: 'hero', type: 'hero', label: 'Capa principal', title: 'Mensagem que transforma vidas.', body: 'Imagem, título, chamada e botões da primeira tela.', visible: true },
  { id: 'radio', type: 'radio', label: 'Rádio ao vivo', title: 'Uma programação para acompanhar você', body: 'Cartão de transmissão online.', visible: true },
  { id: 'blog', type: 'blog', label: 'Matérias', title: 'Palavras para o caminho', body: 'Grade com as últimas matérias publicadas.', visible: true },
  { id: 'testimonials', type: 'testimonials', label: 'Testemunhos', title: 'Palavras que renovam a esperança.', body: 'Depoimentos aprovados dos ouvintes.', visible: true },
  { id: 'mission', type: 'mission', label: 'Nossa missão', title: 'Conteúdo que aponta para o alto.', body: 'Texto institucional e chamada final.', visible: true },
];

const defaultSettings: SiteSettings = {
  customDomain: '', faviconUrl: '', seoTitle: 'Sinais dos Tempos — Web Rádio', seoDescription: 'A Rádio dos Remanescentes.', canonicalUrl: '',
  ogImage: '', analyticsId: '', customCss: '', customJs: '', localFonts: '', passwordEnabled: false, passwordHint: '', redirectUrl: '',
  frameProtection: true, updateFrequency: 'instant', downloadMode: false, showBranding: false, qrEnabled: false, shareImage: '', formMode: 'advanced', customCode: '',
};

const settingGroups = [
  { id: 'publish', label: 'Publicação', icon: Globe2, items: ['URLs de domínio personalizados', 'Sem marca', 'Transferências de local', 'Compartilhamento', 'Frequência de atualização'] },
  { id: 'media', label: 'Mídia e assets', icon: ImagePlus, items: ['Imagens de alta qualidade', 'Imagens e vídeos grandes', 'Envio de vídeos', 'Apresentações de slides', 'Ícones do site', 'Compartilhar imagens', 'Arquivos do site'] },
  { id: 'design', label: 'Design', icon: Palette, items: ['Modelos Premium', 'Modelos personalizados', 'Fontes locais', 'Enquadramento', 'Sem limite de elementos'] },
  { id: 'growth', label: 'Crescimento', icon: BarChart3, items: ['Análises', 'Meta Tags', 'Códigos QR', 'Redireciona', 'Sites de download'] },
  { id: 'advanced', label: 'Avançado', icon: SlidersHorizontal, items: ['Formulários avançados', 'Widgets', 'Incorporações', 'Configurações avançadas', 'Proteção por senha', 'Variáveis', 'URL canônica'] },
];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="builder-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export default function HomeBuilder() {
  const { isAuthenticated, loading } = useAuth();
  const [blocks, setBlocks] = useState<Block[]>(defaults);
  const [selectedId, setSelectedId] = useState('hero');
  const [draft, setDraft] = useState<Block | null>(null);
  const [drag, setDrag] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [activePanel, setActivePanel] = useState<'canvas' | 'settings' | 'assets'>('canvas');
  const [activeSettings, setActiveSettings] = useState('publish');
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);

  const content = useQuery<any[]>({ queryKey: ['admin-site-content'], queryFn: () => apiFetch('/api/site-content/admin/all'), enabled: isAuthenticated });
  useEffect(() => {
    const rawBlocks = content.data?.find((item: any) => item.contentKey === 'home_blocks')?.contentValue;
    const rawSettings = content.data?.find((item: any) => item.contentKey === 'site_settings')?.contentValue;
    if (rawBlocks) { try { const parsed = JSON.parse(rawBlocks); if (Array.isArray(parsed) && parsed.length) { setBlocks(parsed); setSelectedId(parsed[0].id); } } catch { /* defaults */ } }
    if (rawSettings) { try { setSettings({ ...defaultSettings, ...JSON.parse(rawSettings) }); } catch { /* defaults */ } }
  }, [content.data]);

  const selected = useMemo(() => blocks.find(block => block.id === selectedId) || blocks[0], [blocks, selectedId]);
  useEffect(() => { if (selected) setDraft({ ...selected }); }, [selectedId, selected?.id]);

  const publishPayload = (nextBlocks: Block[]) => {
    const byType = (type: string) => nextBlocks.find(block => block.type === type);
    const hero = byType('hero'); const radio = byType('radio'); const mission = byType('mission');
    return {
      home_blocks: JSON.stringify(nextBlocks), site_settings: JSON.stringify(settings),
      ...(hero ? { hero_title_line: hero.title, hero_title_accent: '', hero_description: hero.body } : {}),
      ...(radio ? { radio_title: radio.title, radio_description: radio.body } : {}),
      ...(mission ? { mission_title: mission.title, mission_description: mission.body } : {}),
    };
  };

  const save = useMutation({
    mutationFn: (nextBlocks: Block[]) => apiFetch('/api/site-content', { method: 'PUT', body: JSON.stringify(publishPayload(nextBlocks)) }),
    onSuccess: () => { setSaved(true); setNotice('Alterações publicadas. O site está atualizado.'); setError(''); setTimeout(() => setSaved(false), 2500); },
    onError: (err: any) => setError(err.message || 'Não foi possível publicar as alterações.'),
  });
  const upload = useMutation({ mutationFn: (value: any) => apiFetch<{ url: string }>('/api/media/upload', { method: 'POST', body: JSON.stringify(value) }) });

  if (loading) return <main className="container page-main"><div className="loading-state">Verificando acesso...</div></main>;
  if (!isAuthenticated) return <main className="container page-main"><div className="locked-card"><KeyRound size={36} /><h1>Editor privado do proprietário</h1><p>Somente o proprietário do site pode entrar, editar e publicar alterações.</p><Link href="/admin/login" className="primary-button">Acesso do proprietário</Link></div></main>;

  const updateSetting = (key: keyof SiteSettings, value: string | boolean) => setSettings(prev => ({ ...prev, [key]: value }));
  const setDraftField = (key: keyof Block, value: string) => setDraft(prev => prev ? { ...prev, [key]: value } : prev);
  const selectBlock = (block: Block) => { setSelectedId(block.id); setNotice(''); setError(''); setActivePanel('canvas'); };
  const applyDraft = () => { if (!draft) return; setBlocks(prev => prev.map(block => block.id === draft.id ? draft : block)); setNotice(`Alterações aplicadas em “${draft.label}”. Publique para colocar no ar.`); };
  const chooseImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file || !draft) return;
    if (!file.type.startsWith('image/')) { setError('Escolha uma imagem.'); return; }
    if (file.size > 16 * 1024 * 1024) { setError('A imagem deve ter no máximo 16 MB.'); return; }
    try { setError(''); const stored = await upload.mutateAsync({ fileName: file.name, mimeType: file.type, base64: await fileToBase64(file), kind: 'image' }); setDraftField('imageUrl', stored.url); setNotice('Imagem adicionada ao rascunho.'); } catch (err: any) { setError(err.message || 'Não foi possível carregar a imagem.'); }
    event.target.value = '';
  };
  const chooseMedia = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) { setError('Escolha uma imagem ou vídeo.'); return; }
    if (file.size > 64 * 1024 * 1024) { setError('O arquivo deve ter no máximo 64 MB.'); return; }
    try { setError(''); await upload.mutateAsync({ fileName: file.name, mimeType: file.type, base64: await fileToBase64(file), kind: file.type.startsWith('video/') ? 'video' : 'image' }); setNotice(`${file.name} enviado para a biblioteca de mídia.`); } catch (err: any) { setError(err.message || 'Não foi possível enviar o arquivo.'); }
    event.target.value = '';
  };
  const add = () => { const block: Block = { id: `custom-${Date.now()}`, type: 'custom', label: 'Nova seção', title: 'Nova seção', body: 'Escreva o conteúdo desta seção.', visible: true }; setBlocks(prev => [...prev, block]); setSelectedId(block.id); setNotice('Nova seção adicionada ao canvas.'); };
  const move = (target: string) => { if (!drag || drag === target) return; const next = [...blocks]; const from = next.findIndex(block => block.id === drag); const to = next.findIndex(block => block.id === target); const [item] = next.splice(from, 1); next.splice(to, 0, item); setBlocks(next); setDrag(null); setNotice('Ordem alterada no canvas.'); };
  const toggle = (block: Block) => { setBlocks(prev => prev.map(item => item.id === block.id ? { ...item, visible: !item.visible } : item)); setNotice(`Visibilidade de “${block.label}” alterada.`); };
  const remove = (block: Block) => { if (!window.confirm(`Excluir “${block.label}”?`)) return; const next = blocks.filter(item => item.id !== block.id); setBlocks(next); setSelectedId(next[0]?.id || ''); setNotice('Seção removida do rascunho.'); };

  return <main className="builder-page">
    <header className="builder-topbar"><div className="builder-brand"><Sparkles size={18} /><strong>Sinais dos Tempos</strong><span>Editor privado do proprietário</span></div><div className="builder-top-actions"><Link href="/" className="builder-preview"><Eye size={16} /> Pré-visualizar</Link><button type="button" className="builder-publish" onClick={() => save.mutate(blocks)} disabled={save.isPending}><Save size={16} /> {save.isPending ? 'Publicando...' : 'Publicar'}</button><Link href="/admin" className="builder-close" aria-label="Fechar editor"><X size={18} /></Link></div></header>
    <div className="builder-layout">
      <aside className="builder-sidebar builder-left"><div className="builder-tabs"><button className={activePanel === 'canvas' ? 'active' : ''} onClick={() => setActivePanel('canvas')}><LayoutTemplate size={16} /> Canvas</button><button className={activePanel === 'assets' ? 'active' : ''} onClick={() => setActivePanel('assets')}><FolderOpen size={16} /> Assets</button><button className={activePanel === 'settings' ? 'active' : ''} onClick={() => setActivePanel('settings')}><Settings2 size={16} /> Configurações</button></div>
        {activePanel === 'canvas' && <><div className="builder-sidebar-heading"><div><strong>Estrutura</strong><small>Arraste para reorganizar</small></div><button type="button" onClick={add} title="Adicionar seção"><Plus size={17} /></button></div><div className="builder-block-list">{blocks.map((block, index) => <div key={block.id} draggable onDragStart={() => setDrag(block.id)} onDragOver={event => event.preventDefault()} onDrop={() => move(block.id)} onClick={() => selectBlock(block)} className={`builder-block-item ${selected?.id === block.id ? 'selected' : ''} ${!block.visible ? 'hidden-block' : ''}`}><GripVertical size={15} /><span><strong>{index + 1}. {block.label}</strong><small>{block.type} · {block.visible ? 'visível' : 'oculto'}</small></span><button type="button" onClick={event => { event.stopPropagation(); toggle(block); }} title={block.visible ? 'Ocultar' : 'Mostrar'}>{block.visible ? <Eye size={14} /> : <EyeOff size={14} />}</button></div>)}</div><button type="button" className="builder-add-section" onClick={add}><Plus size={16} /> Adicionar elemento</button></>}
        {activePanel === 'assets' && <div className="builder-panel-content"><div className="builder-sidebar-heading"><div><strong>Biblioteca</strong><small>Imagens, vídeos e arquivos</small></div></div><input ref={mediaRef} type="file" accept="image/*,video/*" hidden onChange={chooseMedia} /><button type="button" className="builder-upload-card" onClick={() => mediaRef.current?.click()}><Upload size={22} /><strong>Enviar arquivos</strong><small>Imagens até 16 MB · vídeos até 64 MB</small></button><div className="builder-feature-note"><Video size={16} /><span>Vídeos grandes, slides e arquivos do site ficam organizados nesta biblioteca.</span></div></div>}
        {activePanel === 'settings' && <div className="builder-settings-nav">{settingGroups.map(group => { const Icon = group.icon; return <button key={group.id} className={activeSettings === group.id ? 'active' : ''} onClick={() => setActiveSettings(group.id)}><Icon size={16} /><span>{group.label}</span><ChevronRight size={15} /></button>; })}</div>}
      </aside>
      <section className="builder-canvas-wrap"><div className="builder-canvas-toolbar"><span><MonitorPlay size={15} /> Desktop</span><span className="canvas-zoom">100%</span><button type="button" title="Mover canvas"><Move size={15} /></button></div><div className="builder-canvas"><div className="builder-site-preview"><div className="preview-nav"><strong>SINAIS DOS TEMPOS</strong><span>Início</span><span>Blog</span><span>Louvores</span><span>Ouvir ao vivo</span></div>{blocks.filter(block => block.visible).map(block => <article key={block.id} className={`preview-block preview-${block.type} ${selected?.id === block.id ? 'focused' : ''}`} onClick={() => selectBlock(block)}><span className="preview-block-label">{block.label}</span><h2>{block.title}</h2><p>{block.body}</p>{block.imageUrl && <img src={block.imageUrl} alt="" />}{block.buttonText && <button type="button">{block.buttonText}</button>}</article>)}</div></div></section>
      <aside className="builder-sidebar builder-right">{activePanel === 'settings' ? <SettingsPanel activeSettings={activeSettings} settings={settings} updateSetting={updateSetting} /> : <>{draft && selected ? <><div className="builder-inspector-head"><div><span>Elemento selecionado</span><strong>{selected.label}</strong></div><span className="builder-live-dot">● Live</span></div><div className="builder-inspector-scroll"><div className="inspector-section"><div className="inspector-section-title"><Type size={15} /> Conteúdo</div><Field label="Nome da seção"><input value={draft.label} onChange={event => setDraftField('label', event.target.value)} /></Field><Field label="Título"><input value={draft.title} onChange={event => setDraftField('title', event.target.value)} /></Field><Field label="Descrição"><textarea rows={6} value={draft.body} onChange={event => setDraftField('body', event.target.value)} /></Field></div><div className="inspector-section"><div className="inspector-section-title"><ImagePlus size={15} /> Imagem</div><input ref={fileRef} type="file" accept="image/*" hidden onChange={chooseImage} /><button type="button" className="builder-secondary-button" onClick={() => fileRef.current?.click()}><ImagePlus size={16} /> Adicionar imagem</button>{draft.imageUrl && <button type="button" className="builder-text-button" onClick={() => setDraftField('imageUrl', '')}>Remover imagem</button>}</div><div className="inspector-section"><div className="inspector-section-title"><Link2 size={15} /> Ação</div><Field label="Texto do botão"><input value={draft.buttonText || ''} onChange={event => setDraftField('buttonText', event.target.value)} placeholder="Ex.: Ouça ao vivo" /></Field><Field label="Link"><input value={draft.buttonUrl || ''} onChange={event => setDraftField('buttonUrl', event.target.value)} placeholder="/blog ou https://..." /></Field></div></div><div className="builder-inspector-actions"><button type="button" className="builder-secondary-button" onClick={() => setDraft({ ...selected })}><X size={15} /> Descartar</button><button type="button" className="builder-primary-button" onClick={applyDraft}><Check size={15} /> Aplicar</button>{selected.type === 'custom' && <button type="button" className="builder-icon-danger" onClick={() => remove(selected)}><Trash2 size={15} /></button>}</div></> : <div className="builder-empty"><LayoutTemplate size={25} /><p>Selecione um elemento no canvas.</p></div>}</>}
      </aside>
    </div>
    {(notice || error) && <div className={`builder-toast ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}>{error || notice}</div>}
  </main>;
}

function SettingsPanel({ activeSettings, settings, updateSetting }: { activeSettings: string; settings: SiteSettings; updateSetting: (key: keyof SiteSettings, value: string | boolean) => void }) {
  const group = settingGroups.find(item => item.id === activeSettings) || settingGroups[0];
  return <div className="builder-settings-panel"><div className="builder-inspector-head"><div><span>Configurações do site</span><strong>{group.label}</strong></div><SlidersHorizontal size={18} /></div><div className="builder-inspector-scroll"><p className="builder-settings-intro">Controle recursos avançados de publicação, crescimento e personalização sem sair do editor.</p>{group.id === 'publish' && <><Field label="Domínio personalizado" hint="Conecte seu domínio quando o DNS estiver apontado."><input value={settings.customDomain} onChange={e => updateSetting('customDomain', e.target.value)} placeholder="www.seusite.com" /></Field><Field label="Frequência de atualização"><select value={settings.updateFrequency} onChange={e => updateSetting('updateFrequency', e.target.value)}><option value="instant">Instantânea</option><option value="hourly">A cada hora</option><option value="daily">Diária</option></select></Field><Toggle label="Remover marca do construtor" checked={settings.showBranding === false} onChange={v => updateSetting('showBranding', !v)} /><Toggle label="Permitir transferências e compartilhamento" checked={true} onChange={() => {}} /></>}{group.id === 'media' && <><Field label="Ícone do site (URL)"><input value={settings.faviconUrl} onChange={e => updateSetting('faviconUrl', e.target.value)} placeholder="/api/media/..." /></Field><Field label="Imagem de compartilhamento (OG)"><input value={settings.shareImage} onChange={e => updateSetting('shareImage', e.target.value)} placeholder="URL da imagem" /></Field><div className="builder-pro-card"><ImagePlus size={17} /><strong>Imagens e vídeos grandes</strong><p>A biblioteca do site aceita imagens de alta qualidade, vídeos e arquivos para download.</p></div></>}{group.id === 'design' && <><Field label="Fontes locais" hint="Uma URL por linha."><textarea rows={4} value={settings.localFonts} onChange={e => updateSetting('localFonts', e.target.value)} placeholder="https://.../fonte.woff2" /></Field><Field label="Modelo base"><select><option>Rádio noturna editorial</option><option>Minimalista claro</option><option>Premium magazine</option></select></Field><Toggle label="Elementos ilimitados" checked={true} onChange={() => {}} /></>}{group.id === 'growth' && <><Field label="ID de analytics"><input value={settings.analyticsId} onChange={e => updateSetting('analyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" /></Field><Field label="Código QR"><select value={settings.qrEnabled ? 'on' : 'off'} onChange={e => updateSetting('qrEnabled', e.target.value === 'on')}><option value="off">Desativado</option><option value="on">Ativar QR da página</option></select></Field><Toggle label="Site de download" checked={settings.downloadMode} onChange={v => updateSetting('downloadMode', v)} /><Field label="Redirecionamento"><input value={settings.redirectUrl} onChange={e => updateSetting('redirectUrl', e.target.value)} placeholder="https://..." /></Field></>}{group.id === 'advanced' && <><Field label="Título SEO"><input value={settings.seoTitle} onChange={e => updateSetting('seoTitle', e.target.value)} /></Field><Field label="Meta description"><textarea rows={3} value={settings.seoDescription} onChange={e => updateSetting('seoDescription', e.target.value)} /></Field><Field label="URL canônica"><input value={settings.canonicalUrl} onChange={e => updateSetting('canonicalUrl', e.target.value)} placeholder="https://..." /></Field><Field label="Proteção por senha"><input value={settings.passwordHint} onChange={e => updateSetting('passwordHint', e.target.value)} placeholder="Mensagem exibida no acesso" /></Field><Toggle label="Ativar proteção por senha" checked={settings.passwordEnabled} onChange={v => updateSetting('passwordEnabled', v)} /><Toggle label="Bloquear enquadramento externo" checked={settings.frameProtection} onChange={v => updateSetting('frameProtection', v)} /><Field label="CSS personalizado"><textarea rows={5} value={settings.customCss} onChange={e => updateSetting('customCss', e.target.value)} placeholder=".minha-classe { ... }" /></Field><Field label="Código incorporado / widgets"><textarea rows={5} value={settings.customCode} onChange={e => updateSetting('customCode', e.target.value)} placeholder="Cole um widget ou embed autorizado" /></Field><div className="builder-pro-card"><ShieldCheck size={17} /><strong>Configurações avançadas</strong><p>Meta tags, variáveis, widgets, incorporações, formulários avançados e proteção ficam salvos por site.</p></div></>}</div></div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="builder-toggle"><span>{label}</span><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /><i /></label>;
}
