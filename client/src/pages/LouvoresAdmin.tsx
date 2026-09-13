import { useRef, useState } from 'react';
import { Link } from 'wouter';
import { AudioLines, ImagePlus, Music2, ShieldCheck, Upload } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, fileToBase64 } from '@/lib/api';
import { useAuth } from '@/_core/hooks/useAuth';

export default function LouvoresAdmin(){
  const {isAuthenticated,loading}=useAuth();
  const queryClient=useQueryClient();
  const audioRef=useRef<HTMLInputElement>(null);
  const coverRef=useRef<HTMLInputElement>(null);
  const [title,setTitle]=useState('');
  const [artist,setArtist]=useState('');
  const [description,setDescription]=useState('');
  const [audioUrl,setAudioUrl]=useState('');
  const [coverUrl,setCoverUrl]=useState('');
  const [audioName,setAudioName]=useState('');
  const [coverName,setCoverName]=useState('');

  const uploadAudio=useMutation({mutationFn:(vars:{fileName:string;base64:string})=>apiFetch<{url:string}>('/api/media/upload',{method:'POST',body:JSON.stringify({...vars,mimeType:'audio/mpeg',kind:'audio'})})});
  const uploadImage=useMutation({mutationFn:(vars:{fileName:string;mimeType:string;base64:string})=>apiFetch<{url:string}>('/api/media/upload',{method:'POST',body:JSON.stringify({...vars,kind:'image'})})});
  const create=useMutation({mutationFn:(vars:any)=>apiFetch('/api/songs',{method:'POST',body:JSON.stringify(vars)}),onSuccess:()=>queryClient.invalidateQueries({queryKey:['songs']})});

  if(loading)return <main className="container page-main"><div className="loading-state">Verificando acesso...</div></main>;
  if(!isAuthenticated)return <main className="container page-main"><div className="locked-card"><ShieldCheck size={36}/><h1>Área reservada</h1><p>Somente a administração pode cadastrar louvores.</p><Link href="/admin/login" className="primary-button">Entrar</Link></div></main>;

  const onAudio=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file)return;
    if(!/\.mp3$/i.test(file.name)){alert('Escolha um arquivo MP3.');return}
    if(file.size>25*1024*1024){alert('O MP3 deve ter no máximo 25 MB.');return}
    const stored=await uploadAudio.mutateAsync({fileName:file.name,base64:await fileToBase64(file)});
    setAudioUrl(stored.url);setAudioName(file.name);
  };
  const onCover=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file)return;
    if(!file.type.startsWith('image/')){alert('Escolha uma imagem para a capa.');return}
    const stored=await uploadImage.mutateAsync({fileName:file.name,mimeType:file.type,base64:await fileToBase64(file)});
    setCoverUrl(stored.url);setCoverName(file.name);
  };
  const save=async()=>{
    if(!audioUrl){alert('Envie o MP3 antes de salvar.');return}
    await create.mutateAsync({title,artist,description,audioUrl,coverUrl});
    setTitle('');setArtist('');setDescription('');setAudioUrl('');setCoverUrl('');setAudioName('');setCoverName('');
    alert('Louvor publicado para reprodução online!');
  };

  return <main className="container admin-main">
    <div className="admin-header"><div><span className="section-kicker">PAINEL ADMINISTRATIVO</span><h1>Cadastrar louvor</h1><p>Publique músicas para os ouvintes escutarem online.</p></div><Link href="/louvores" className="text-link">Ver seção pública</Link></div>
    <section className="song-admin-card">
      <div className="song-form">
        <label>Título do louvor<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Mais Perto Quero Estar"/></label>
        <label>Artista ou intérprete<input value={artist} onChange={e=>setArtist(e.target.value)} placeholder="Nome do artista"/></label>
        <label>Descrição breve<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Uma frase sobre este louvor..."/></label>
        <div className="file-drop"><input ref={audioRef} type="file" accept="audio/mpeg,.mp3" onChange={onAudio} hidden/><button type="button" onClick={()=>audioRef.current?.click()}><AudioLines size={20}/><strong>{uploadAudio.isPending?'Enviando MP3...':'Selecionar arquivo MP3'}</strong><small>{audioName||'Máximo de 25 MB'}</small></button></div>
        <div className="file-drop"><input ref={coverRef} type="file" accept="image/*" onChange={onCover} hidden/><button type="button" onClick={()=>coverRef.current?.click()}><ImagePlus size={20}/><strong>{uploadImage.isPending?'Enviando capa...':'Adicionar capa (opcional)'}</strong><small>{coverName||'JPG, PNG ou WEBP'}</small></button></div>
        <button className="primary-button" onClick={save} disabled={create.isPending||!title||!artist||!audioUrl}><Upload size={16}/>{create.isPending?'Publicando...':'Publicar louvor'}</button>
      </div>
      <aside className="song-admin-help"><Music2 size={28}/><h2>Como funciona</h2><p>O MP3 fica armazenado com segurança e os ouvintes poderão reproduzir o louvor diretamente no site.</p><div className="download-note">Formato permitido: MP3<br/>Tamanho máximo: 25 MB<br/>Disponível apenas para ouvir online</div></aside>
    </section>
  </main>;
}
