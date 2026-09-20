import { Link, useRoute } from 'wouter';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

function sanitizeArticleHtml(html: string) {
  if (!/<[a-z][\s\S]*>/i.test(html)) return `<p>${html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,meta,link,iframe,object,embed,form').forEach(node => node.remove());
  doc.querySelectorAll('*').forEach(node => {
    Array.from(node.attributes).forEach(attribute => {
      const name = attribute.name.toLowerCase();
      if (name.startsWith('on')) node.removeAttribute(attribute.name);
      if (name === 'style') {
        const safe = attribute.value.split(';').filter((rule: string) => /^(font-family|font-size|font-weight|font-style|text-align|color)\s*:/i.test(rule.trim())).join(';');
        if (safe) node.setAttribute('style', safe); else node.removeAttribute('style');
      }
      if (name === 'src' && !/^https?:\/\//i.test(attribute.value) && !attribute.value.startsWith('/')) node.removeAttribute(attribute.name);
      if (name === 'href' && !/^https?:\/\//i.test(attribute.value) && !attribute.value.startsWith('/')) node.removeAttribute(attribute.name);
    });
  });
  return doc.body.innerHTML;
}

export default function Post(){
  const [,params]=useRoute('/post/:slug');
  const slug=params?.slug||'';
  const {data,isLoading}=useQuery({queryKey:['post',slug],queryFn:()=>apiFetch(`/api/posts/${slug}`),enabled:Boolean(slug),retry:false});
  if(isLoading)return <main className="container page-main"><div className="loading-state">Carregando matéria...</div></main>;
  const post=data||{title:'Fé em Tempos Difíceis',summary:'Uma palavra de esperança para sua vida.',content:'A oração e a fé são forças que nos sustentam em qualquer situação. Mesmo nos dias mais difíceis, existe esperança para quem escolhe confiar.',category:'Reflexão',imageUrl:undefined as string|undefined};
  return <main className="container article-page"><Link href="/blog" className="back-link"><ArrowLeft size={16}/> Voltar ao blog</Link><article><div className="article-meta"><span>{post.category}</span><small><Calendar size={14}/> Sinais dos Tempos</small></div><h1>{post.title}</h1><p className="article-lead">{post.summary}</p><div className="article-art" style={post.imageUrl?{backgroundImage:`url(${post.imageUrl})`,backgroundSize:'cover',backgroundPosition:'center'}:undefined}><div className="article-art-light"/></div><div className="article-content" dangerouslySetInnerHTML={{__html:sanitizeArticleHtml(post.content)}}/><blockquote>“Quando estas coisas começarem a acontecer, olhai para cima, e levantai as vossas cabeças, porque a vossa redenção está próxima.”<cite>Lucas 21:28</cite></blockquote><button className="share-button" onClick={()=>navigator.share?.({title:post.title,text:post.summary,url:window.location.href})}><Share2 size={16}/> Compartilhar matéria</button></article></main>
}
