import { Link, useLocation } from 'wouter';
import { ArrowRight, Calendar, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const categories = ['Reflexão', 'Programação', 'Louvores', 'Testemunhos'];

export default function Blog(){
  const {data}=useQuery({queryKey:['posts'],queryFn:()=>apiFetch('/api/posts')});
  const {data:testimonials=[]}=useQuery<any[]>({queryKey:['testimonials'],queryFn:()=>apiFetch('/api/testimonials')});
  const [location] = useLocation();
  const [search,setSearch]=useState('');
  const [category,setCategory]=useState(()=>{const requested=new URLSearchParams(window.location.search).get('categoria');return requested&&categories.includes(requested)?requested:'Reflexão';});
  useEffect(()=>{const requested=new URLSearchParams(location.split('?')[1]||'').get('categoria');if(requested&&categories.includes(requested))setCategory(requested);},[location]);
  const posts=data||[];
  const shown=useMemo(()=>posts.filter((p:any)=>{
    const matchesCategory=String(p.category||'').toLowerCase()===category.toLowerCase();
    const query=search.trim().toLowerCase();
    return matchesCategory&&(!query||(p.title+' '+p.summary+' '+p.category).toLowerCase().includes(query));
  }),[posts,search,category]);
  const shownTestimonials=useMemo(()=>testimonials.filter((item:any)=>!search.trim()||(item.name+' '+item.location+' '+item.content).toLowerCase().includes(search.trim().toLowerCase())),[testimonials,search]);
  return <main className="container page-main"><div className="page-intro"><span className="section-kicker">REFLEXÕES • NOTÍCIAS • LOUVORES</span><h1>Blog Sinais dos Tempos</h1><p>Conteúdo para fortalecer a fé e iluminar o caminho.</p></div><div className="blog-toolbar"><div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar no blog..." aria-label="Buscar no blog"/></div><div className="category-pills" role="group" aria-label="Filtrar conteúdo">{categories.map(item=><a href={item==='Louvores'?'/louvores':`/blog?categoria=${encodeURIComponent(item)}`} key={item} className={`category-link-button${item===category?' active':''}`}>{item}</a>)}</div></div>{category==='Testemunhos'?<section className="blog-testimonials-list" aria-label="Testemunhos aprovados">{shownTestimonials.map((item:any)=><article className="blog-testimonial" key={item.id}><div className="blog-testimonial-mark">“</div><div><p>{item.content}</p><strong>{item.name}</strong>{item.location&&<small><Calendar size={13}/> {item.location}</small>}</div></article>)}{!shownTestimonials.length&&<div className="empty-state">Ainda não há testemunhos publicados. Envie um testemunho na <Link href="/">página inicial</Link>.</div>}</section>:<div className="blog-list">{shown.map((post:any)=><Link href={`/post/${post.slug}`} className="blog-row" key={post.slug}><div className="blog-thumb" style={post.imageUrl?{backgroundImage:`url(${post.imageUrl})`,backgroundSize:'cover',backgroundPosition:'center'}:undefined}><span>{post.category}</span></div><div><span className="post-category">{post.category}</span><h2>{post.title}</h2><p>{post.summary}</p><span className="text-link">Ler matéria <ArrowRight size={15}/></span></div></Link>)}{!shown.length&&<div className="empty-state">Nenhuma matéria encontrada nessa categoria.</div>}</div>}</main>
}
