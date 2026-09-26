import { useMemo, useState } from 'react';
import { ArrowRight, Calendar, Search, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

type Category = 'Reflexão' | 'Programação' | 'Testemunhos';

const categories: Category[] = ['Reflexão', 'Programação', 'Testemunhos'];

export default function Home() {
  const { data: postsData = [] } = useQuery<any[]>({ queryKey: ['posts'], queryFn: () => apiFetch('/api/posts') });
  const { data: testimonialsData = [] } = useQuery<any[]>({ queryKey: ['testimonials'], queryFn: () => apiFetch('/api/testimonials') });
  const [category, setCategory] = useState<Category>('Reflexão');
  const [search, setSearch] = useState('');
  const posts = postsData || [];
  const testimonials = testimonialsData || [];
  const query = search.trim().toLowerCase();
  const visiblePosts = useMemo(() => posts.filter((post: any) => String(post.category || '').toLowerCase() === category.toLowerCase() && (!query || `${post.title} ${post.summary} ${post.category}`.toLowerCase().includes(query))).slice(0, 3), [posts, category, query]);
  const visibleTestimonials = useMemo(() => testimonials.filter((item: any) => !query || `${item.name} ${item.location || ''} ${item.content}`.toLowerCase().includes(query)).slice(0, 2), [testimonials, query]);

  return <main className="compact-home">
    <section className="compact-home-grid container">
      <aside className="compact-identity">
        <div className="compact-identity-image"><img src="/images/hero-clean.png" alt="Anjos anunciando a esperança da volta de Cristo" /></div>
        <div className="compact-identity-content">
          <span className="section-kicker"><Sparkles size={13} /> UMA VOZ DE ESPERANÇA</span>
          <h1>Testemunhando<br />a Vinda de Cristo</h1>
          <p>Conectando você com a Profecia e a Esperança Eterna.</p>
          <div className="compact-actions"><Link href="/projeto" className="compact-link">Conheça a rádio <ArrowRight size={14} /></Link><Link href="/quiz-adventista" className="compact-link compact-link-gold">Quiz Adventista <ArrowRight size={14} /></Link></div>
        </div>
      </aside>

      <section className="compact-blog" aria-label="Blog Sinais dos Tempos">
        <div className="compact-blog-heading"><div><span className="section-kicker">REFLEXÕES • NOTÍCIAS • LOUVORES</span><h2>Blog Sinais dos Tempos</h2><p>Conteúdo para fortalecer a fé e iluminar o caminho.</p></div><span className="compact-live-label">CONTEÚDO DA RÁDIO</span></div>
        <div className="compact-toolbar"><div className="search-box"><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar no blog..." aria-label="Buscar no blog" /></div><nav className="compact-categories" aria-label="Categorias"><button type="button" className={category === 'Reflexão' ? 'active' : ''} onClick={() => setCategory('Reflexão')}>Reflexão</button><button type="button" className={category === 'Programação' ? 'active' : ''} onClick={() => setCategory('Programação')}>Programação</button><Link href="/louvores">Louvores</Link><button type="button" className={category === 'Testemunhos' ? 'active' : ''} onClick={() => setCategory('Testemunhos')}>Testemunhos</button></nav></div>
        {category === 'Testemunhos' ? <div className="compact-testimonials">{visibleTestimonials.map((item: any) => <article className="compact-testimonial" key={item.id}><span>“</span><div><p>{item.content}</p><strong>{item.name}</strong>{item.location && <small><Calendar size={12} /> {item.location}</small>}</div></article>)}{!visibleTestimonials.length && <div className="compact-empty">Nenhum testemunho encontrado.</div>}</div> : <div className="compact-post-list">{visiblePosts.map((post: any, index: number) => <Link href={`/post/${post.slug}`} className={index === 0 ? 'compact-post compact-post-featured' : 'compact-post'} key={post.slug}><div className="compact-post-image" style={post.imageUrl ? { backgroundImage: `url(${post.imageUrl})` } : undefined}><span>{post.category}</span></div><div className="compact-post-copy"><span className="post-category">{post.category}</span><h3>{post.title}</h3><p>{post.summary}</p><span className="text-link">Ler matéria <ArrowRight size={14} /></span></div></Link>)}{!visiblePosts.length && <div className="compact-empty">Nenhuma matéria encontrada nessa categoria.</div>}</div>}
      </section>
    </section>
    <nav className="compact-quick-links container" aria-label="Acessos rápidos"><Link href="/blog">Ver todos os conteúdos <ArrowRight size={14} /></Link><Link href="/louvores">Ouvir louvores <ArrowRight size={14} /></Link><Link href="/quiz-adventista">Jogar o quiz <ArrowRight size={14} /></Link><Link href="/projeto">Nossa missão <ArrowRight size={14} /></Link></nav>
  </main>;
}
