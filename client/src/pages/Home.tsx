import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Block = { id: string; type: string; title?: string; body?: string; visible?: boolean; imageUrl?: string; buttonText?: string; buttonUrl?: string };
const blogCategories = ['Reflexão', 'Programação', 'Louvores', 'Testemunhos'];

export default function Home() {
  const { data: copy } = useQuery<Record<string, string>>({ queryKey: ['site-content'], queryFn: () => apiFetch('/api/site-content') });
  const { data: blocksData } = useQuery<Record<string, string>>({ queryKey: ['site-content-blocks'], queryFn: () => apiFetch('/api/site-content') });

  let blocks: Block[] = [];
  try {
    if (blocksData?.home_blocks) blocks = JSON.parse(blocksData.home_blocks);
  } catch {
    blocks = [];
  }

  const byType = (type: string) => blocks.find(block => block.type === type);
  const hero = byType('hero');
  const visible = (type: string) => byType(type)?.visible !== false;
  const text = (key: string, fallback: string) => copy?.[key] || fallback;
  return <main className="home-page">
    <div className="home-scroll-group home-scroll-primary">
      {visible('hero') && <section className="hero-section"><div className="hero-image"><img src="/images/hero-clean.png" alt="Céu iluminado sobre a cidade" /><div className="hero-glow" /></div><div className="container hero-content"><div className="hero-issue">EST. 2014 <span>/</span> TRANSMISSÃO 24H</div><div className="eyebrow"><Sparkles size={15} /> {text('hero_eyebrow', 'UMA VOZ DE ESPERANÇA')}</div><h1>{hero?.title || `${text('hero_title_line', 'Testemunhando a Vinda de Cristo')} ${text('hero_title_accent', '')}`.trim()}</h1><p>{hero?.body || text('hero_description', 'Conectando você com a Profecia e a Esperança Eterna')}</p></div></section>}
    </div>
    <div className="home-scroll-group home-scroll-content">
      {visible('blog') && <section id="blog" className="section container home-blog-section"><div className="section-heading home-blog-heading"><div><span className="section-kicker">REFLEXÕES • NOTÍCIAS • LOUVORES</span><h2>Conteúdo para fortalecer a fé.</h2></div><Link href="/blog" className="text-link">Ver todas <ArrowRight size={15} /></Link></div><div className="blog-toolbar home-blog-toolbar"><form className="search-box" action="/blog" method="get"><Search size={17} /><input name="busca" placeholder="Buscar no blog..." aria-label="Buscar no blog" /></form><nav className="category-pills" aria-label="Categorias do blog">{blogCategories.map(category => category === 'Louvores' ? <Link href="/louvores" key={category} className="category-link-button">{category}</Link> : <Link href={`/blog?categoria=${encodeURIComponent(category)}`} key={category} className="category-link-button">{category}</Link>)}<Link href="/quiz-adventista" className="category-link-button quiz-category-link">Quiz Adventista</Link></nav></div></section>}
    </div>
  </main>;
}
