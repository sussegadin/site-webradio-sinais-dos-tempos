import { useRef, useState } from 'react';
import { Link } from 'wouter';
import { ImagePlus, Save, Send, ShieldCheck, Trash2, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, fileToBase64 } from '@/lib/api';
import { useAuth } from '@/_core/hooks/useAuth';

export default function Editor(){
  const {isAuthenticated,loading}=useAuth();
  const queryClient=useQueryClient();
  const fileRef=useRef<HTMLInputElement>(null);
  const [title,setTitle]=useState('');
  const [summary,setSummary]=useState('');
  const [content,setContent]=useState('');
  const [category,setCategory]=useState('Reflexão');
  const [imageUrl,setImageUrl]=useState('');
  const [imageName,setImageName]=useState('');

  const upload=useMutation({mutationFn:(vars:{fileName:string;mimeType:string;base64:string})=>apiFetch<{url:string}>('/api/media/upload',{method:'POST',body:JSON.stringify({...vars,kind:'image'})})});
  const create=useMutation({mutationFn:(vars:any)=>apiFetch('/api/posts',{method:'POST',body:JSON.stringify(vars)}),onSuccess:()=>{queryClient.invalidateQueries({queryKey:['posts']});queryClient.invalidateQueries({queryKey:['admin-posts']})}});
  const remove=useMutation({mutationFn:(id:number)=>apiFetch(`/api/posts/${id}`,{method:'DELETE'}),onSuccess:()=>{queryClient.invalidateQueries({queryKey:['posts']});queryClient.invalidateQueries({queryKey:['admin-posts']})}});
  const adminPosts=useQuery({queryKey:['admin-posts'],queryFn:()=>apiFetch('/api/posts/admin/all'),enabled:isAuthenticated});

  if(loading)return <main className="container page-main"><div className="loading-state">Verificando acesso...</div></main>;
  if(!isAuthenticated)return <main className="container page-main"><div className="locked-card"><ShieldCheck size={36}/><h1>Área reservada</h1><p>O painel de edição é exclusivo para a administração da Web Rádio.</p><Link href="/admin/login" className="primary-button">Entrar</Link></div></main>;

  const onImage=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file)return;
    if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)){alert('Escolha JPG, PNG, WEBP ou GIF.');return}
    if(file.size>8*1024*1024){alert('A imagem deve ter no máximo 8 MB.');return}
    const stored=await upload.mutateAsync({fileName:file.name,mimeType:file.type,base64:await fileToBase64(file)});
    setImageUrl(stored.url);setImageName(file.name);
  };
  const publish=async(status:'draft'|'published')=>{
    await create.mutateAsync({title,summary:summary||'Mensagem da Web Rádio Sinais dos Tempos.',content,category,imageUrl,status});
    setTitle('');setSummary('');setContent('');setImageUrl('');setImageName('');
    alert(status==='published'?'Matéria publicada!':'Rascunho salvo!');
  };

  return <main className="container admin-main">
    <div className="admin-header"><div><span className="section-kicker">PAINEL ADMINISTRATIVO</span><h1>Editor de matérias</h1><p>Escreva a matéria, adicione uma imagem e publique.</p></div><Link href="/" className="text-link">Ver site público</Link></div>
    <div className="editor-layout">
      <section className="editor-card">
        <input className="editor-title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título da matéria"/>
        <input className="editor-summary" value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Resumo curto para o blog"/>
        <input className="editor-summary" value={category} onChange={e=>setCategory(e.target.value)} placeholder="Categoria (ex.: Reflexão, Programação, Louvores)"/>
        <div className="image-upload">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onImage} hidden/>
          <button type="button" className="image-upload-button" onClick={()=>fileRef.current?.click()} disabled={upload.isPending}><ImagePlus size={18}/>{upload.isPending?'Enviando imagem...':'Adicionar imagem da matéria'}</button>
          {imageName&&<span className="image-name">{imageName}<button type="button" onClick={()=>{setImageUrl('');setImageName('')}} aria-label="Remover imagem"><X size={14}/></button></span>}
          {imageUrl&&<img className="image-preview" src={imageUrl} alt="Prévia da imagem da matéria"/>}
        </div>
        <textarea className="editor-textarea" value={content} onChange={e=>setContent(e.target.value)} placeholder="Escreva sua mensagem aqui..."/>
        <div className="editor-actions">
          <button className="ghost-button" onClick={()=>publish('draft')} disabled={create.isPending||!title||!content}><Save size={16}/> Salvar rascunho</button>
          <button className="primary-button" onClick={()=>publish('published')} disabled={create.isPending||!title||!content}><Send size={16}/> Publicar matéria</button>
        </div>
      </section>
      <aside className="ai-card">
        <div className="ai-title"><div><strong>Matérias cadastradas</strong><small>Rascunhos e publicadas</small></div></div>
        {adminPosts.isLoading&&<p>Carregando...</p>}
        {adminPosts.data?.length?<div style={{display:'flex',flexDirection:'column',gap:10}}>{adminPosts.data.map((p:any)=><div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,borderBottom:'1px solid rgba(255,255,255,0.1)',paddingBottom:8}}><div><strong style={{display:'block'}}>{p.title}</strong><small>{p.status==='published'?'Publicada':'Rascunho'} • {p.category}</small></div><button type="button" onClick={()=>{if(confirm('Excluir esta matéria?'))remove.mutate(p.id)}} aria-label="Excluir" title="Excluir"><Trash2 size={16}/></button></div>)}</div>:<p>Nenhuma matéria cadastrada ainda.</p>}
      </aside>
    </div>
  </main>;
}
