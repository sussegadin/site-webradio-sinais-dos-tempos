import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Headphones, Search, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useRadio } from '../contexts/RadioContext';

type Block = { id: string; type: string; title?: string; body?: string; visible?: boolean; imageUrl?: string; buttonText?: string; buttonUrl?: string };
const blogCategories = ['Reflexão', 'Programação', 'Louvores', 'Testemunhos'];

export default function Home() {
  const { data: postsData } = useQuery<any[]>({ queryKey: ['posts'], queryFn: () => apiFetch('/api/posts') });
  const { data: copy } = useQuery<Record<string, string>>({ queryKey: ['site-content'], queryFn: () => apiFetch('/api/site-content') });
  const { data: blocksData } = useQuery<Record<string, string>>({ queryKey: ['site-content-blocks'], queryFn: () => apiFetch('/api/site-content') });
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCategory, setBlogCategory] = useState('Reflexão');
  const { playing, toggleAudio } = useRadio();

  let blocks: Block[] = [];
  try {
    if (blocksData?.home_blocks) blocks = JSON.parse(blocksData.home_blocks);
  } catch {
    blocks = [];
  }

  const byType = (type: string) => blocks.find(block => block.type === type);
  const hero = byType('hero');
  const radio = byType('radio');
  const visible = (type: string) => byType(type)?.visible !== false;
  const text = (key: string, fallback: string) => copy?.[key] || fallback;
  const posts = postsData || [];

  const blogPosts = useMemo(() => {
    const query = blogSearch.trim().toLowerCase();
    return posts
      .filter((post: any) => String(post.category || '').toLowerCase() === blogCategory.toLowerCase())
      .filter((post: any) => !query || `${post.title} ${post.summary} ${post.category}`.toLowerCase().includes(query))
      .slice(0, 3);
  }, [posts, blogCategory, blogSearch]);

  return <main>
    {visible('hero') && <section className="hero-section"><div className="hero-image"><img src="/images/hero-clean.png" alt="Capa principal" /><div className="hero-glow" /></div><div className="container hero-content"><div className="hero-issue">EST. 2014 <span>/</span> TRANSMISSÃO 24H</div><div className="eyebrow"><Sparkles size={15} /> {text('hero_eyebrow', 'UMA VOZ DE ESPERANÇA')}</div><h1>{hero?.title || `${text('hero_title_line', 'Testemunhando a Vinda de Cristo')} ${text('hero_title_accent', '')}`.trim()}</h1><p>{hero?.body || text('hero_description', 'Conectando você com a Profecia e a Esperança Eterna')}</p><div className="hero-actions"><a href="#blog" className="ghost-button">Explorar o blog <ArrowRight size={17} /></a></div></div></section>}
    {visible('radio') && <section id="ouvir" className="radio-card-wrap"><div className="container"><div className="radio-card"><div className="radio-card-icon"><Headphones size={25} /></div><div className="radio-card-copy"><span className="section-kicker">TRANSMISSÃO ONLINE</span><h2>{radio?.title || 'Uma programação para acompanhar você'}</h2><p>{radio?.body || 'Pregações, louvores e mensagens proféticas durante todo o dia.'}</p></div><div className="radio-wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div><button type="button" className="radio-card-player" onClick={toggleAudio}><Headphones size={17} /> {playing ? 'Pausar rádio' : 'Ouvir ao vivo'}</button></div></div></section>}

    {visible('blog') && <section id="blog" className="section container home-blog-section"><div className="section-heading home-blog-heading"><div><span className="section-kicker">REFLEXÕES • NOTÍCIAS • LOUVORES</span><h2>Conteúdo para fortalecer a fé.</h2></div><Link href="/blog" className="text-link">Ver todas <ArrowRight size={15} /></Link></div><div className="blog-toolbar home-blog-toolbar"><div className="search-box"><Search size={17} /><input value={blogSearch} onChange={event => setBlogSearch(event.target.value)} placeholder="Buscar no blog..." aria-label="Buscar no blog" /></div><nav className="category-pills" aria-label="Categorias do blog">{blogCategories.map(category => category === 'Louvores' ? <Link href="/louvores" key={category} className="category-link-button">{category}</Link> : <button type="button" key={category} onClick={() => setBlogCategory(category)} className={`category-link-button${category === blogCategory ? ' active' : ''}`}>{category}</button>)}<Link href="/quiz-adventista" className="category-link-button quiz-category-link">Quiz Adventista</Link></nav></div><div className="post-grid post-grid-featured">{blogPosts.map((post: any, index: number) => <Link href={`/post/${post.slug}`} className="post-card post-card-featured" key={post.slug}><div className="post-art">{post.imageUrl && <img src={post.imageUrl} alt="" />}<div className="post-art-glow" /><span>{String(index + 1).padStart(2, '0')} · {post.category}</span></div><div className="post-card-body"><h3>{post.title}</h3><p>{post.summary}</p><span className="read-more">Ler matéria <ArrowRight size={14} /></span></div></Link>)}{!blogPosts.length && <div className="empty-state">Nenhuma matéria encontrada nessa categoria.</div>}</div></section>}
  </main>;
}
