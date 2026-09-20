import { Link } from 'wouter';
import { ArrowRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const fallback=[{slug:'programacao-especial-de-domingo',title:'Programação Especial de Domingo',summary:'Louvores e mensagens inspiradoras para começar a semana com fé.',category:'Programação'},{slug:'fe-em-tempos-dificeis',title:'Fé em Tempos Difíceis',summary:'Uma reflexão sobre esperança, oração e perseverança.',category:'Reflexão'},{slug:'top-louvores-da-semana',title:'Top Louvores da Semana',summary:'Canções que tocaram corações e renovaram a esperança.',category:'Louvores'}];
const categories = ['Todos', 'Reflexão', 'Programação', 'Louvores'];

export default function Blog(){
  const {data}=useQuery({queryKey:['posts'],queryFn:()=>apiFetch('/api/posts')});
  const [search,setSearch]=useState('');
  const [category,setCategory]=useState('Todos');
  const posts=data&&data.length?data:fallback;
  const shown=useMemo(()=>posts.filter((p:any)=>{
    const matchesCategory=category==='Todos'||String(p.category||'').toLowerCase()===category.toLowerCase();
    const query=search.trim().toLowerCase();
    const matchesSearch=!query||(p.title+' '+p.summary+' '+p.category).toLowerCase().includes(query);
    return matchesCategory&&matchesSearch;
  }),[posts,search,category]);
  return <main className="container page-main"><div className="page-intro"><span className="section-kicker">REFLEXÕES • NOTÍCIAS • LOUVORES</span><h1>Blog Sinais dos Tempos</h1><p>Conteúdo para fortalecer a fé e iluminar o caminho.</p></div><div className="blog-toolbar"><div className="search-box"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar no blog..." aria-label="Buscar no blog"/></div><div className="category-pills" role="group" aria-label="Filtrar por categoria">{categories.map(item=><button type="button" key={item} className={category===item?'active':''} onClick={()=>setCategory(item)} aria-pressed={category===item}>{item}</button>)}</div></div><div className="blog-list">{shown.map((post:any)=><Link href={`/post/${post.slug}`} className="blog-row" key={post.slug}><div className="blog-thumb" style={post.imageUrl?{backgroundImage:`url(${post.imageUrl})`,backgroundSize:'cover',backgroundPosition:'center'}:undefined}><span>{post.category}</span></div><div><span className="post-category">{post.category}</span><h2>{post.title}</h2><p>{post.summary}</p><span className="text-link">Ler matéria <ArrowRight size={15}/></span></div></Link>)}{!shown.length&&<div className="empty-state">Nenhuma matéria encontrada.</div>}</div></main>
}
