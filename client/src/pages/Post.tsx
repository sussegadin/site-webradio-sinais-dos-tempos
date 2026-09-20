import { Link, useRoute } from 'wouter';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

function plainTextToArticleHtml(text: string) {
  const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const heading = /^(A Esperança que Renova|O Poder da Oração|Perseverança que Constrói|Conclusão)$/i;
  const normalized = text.replace(/\r\n?/g, '\n').replace(/\s+(A Esperança que Renova|O Poder da Oração|Perseverança que Constrói|Conclusão)\s+/gi, '\n\n$1\n\n');
  return normalized.split(/\n\s*\n/).map(block => {
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
    if (!lines.length) return '';
    if (lines.length === 1 && heading.test(lines[0])) return `<h2>${escape(lines[0])}</h2>`;
    return `<p>${lines.map(line => escape(line)).join('<br>')}</p>`;
  }).join('');
}

function sanitizeArticleHtml(html: string) {
  if (!/<[a-z][\s\S]*>/i.test(html)) return plainTextToArticleHtml(html);
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
  const onlyBlock = doc.body.children.length === 1 ? doc.body.firstElementChild : null;
  if (onlyBlock && /^(P|DIV)$/i.test(onlyBlock.tagName) && onlyBlock.querySelector('br')) {
    const blocks = onlyBlock.innerHTML.split(/(?:<br\s*\/?>\s*){2,}/i).map(block => block.trim()).filter(Boolean);
    if (blocks.length > 1) {
      onlyBlock.replaceWith(...blocks.map(block => {
        const paragraph = doc.createElement('p');
        paragraph.innerHTML = block;
        return paragraph;
      }));
    }
  }
  return doc.body.innerHTML;
}

export default function Post(){
  const [,params]=useRoute('/post/:slug');
  const slug=params?.slug||'';
  const {data,isLoading}=useQuery({queryKey:['post',slug],queryFn:()=>apiFetch(`/api/posts/${slug}`),enabled:Boolean(slug),retry:false});
  if(isLoading)return <main className="container page-main"><div className="loading-state">Carregando matéria...</div></main>;
  if(!data)return <main className="container page-main"><div className="empty-state"><h1>Matéria não encontrada</h1><p>Esta matéria ainda não foi publicada ou não está disponível.</p><Link href="/blog" className="primary-button">Voltar ao blog</Link></div></main>;
  const post=data;
  return <main className="container article-page"><Link href="/blog" className="back-link"><ArrowLeft size={16}/> Voltar ao blog</Link><article><div className="article-meta"><span>{post.category}</span><small><Calendar size={14}/> Sinais dos Tempos</small></div><h1>{post.title}</h1><p className="article-lead">{post.summary}</p>{post.imageUrl&&<div className="article-art"><img src={post.imageUrl} alt={`Imagem da matéria: ${post.title}`} /><div className="article-art-light"/></div>}<div className="article-content" dangerouslySetInnerHTML={{__html:sanitizeArticleHtml(post.content)}}/><blockquote>“Quando estas coisas começarem a acontecer, olhai para cima, e levantai as vossas cabeças, porque a vossa redenção está próxima.”<cite>Lucas 21:28</cite></blockquote><button className="share-button" onClick={()=>navigator.share?.({title:post.title,text:post.summary,url:window.location.href})}><Share2 size={16}/> Compartilhar matéria</button></article></main>
}
