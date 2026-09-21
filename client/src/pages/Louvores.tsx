import { Headphones, Music2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

type AudioGraph = { context: AudioContext; gain: GainNode };
const audioGraphs = new WeakMap<HTMLAudioElement, AudioGraph>();

function boostAudio(audio: HTMLAudioElement) {
  audio.volume = 0.85;
  try {
    let graph = audioGraphs.get(audio);
    if (!graph) {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audio);
      const gain = context.createGain();
      gain.gain.value = 1.8;
      source.connect(gain).connect(context.destination);
      graph = { context, gain };
      audioGraphs.set(audio, graph);
    }
    void graph.context.resume();
  } catch {
    // Se o navegador bloquear a amplificação, mantém o volume padrão em 85%.
  }
}

export default function Louvores(){
  const {data,isLoading}=useQuery({queryKey:['songs'],queryFn:()=>apiFetch(`/api/songs?updated=${Date.now()}`)});
  const songs=data||[];
  return <main className="container page-main"><div className="page-intro"><span className="section-kicker">MÚSICA PARA A ALMA</span><h1>Os melhores louvores</h1><p>Ouça seus louvores preferidos online e fortaleça sua fé com esta seleção especial.</p></div>{isLoading?<div className="loading-state">Carregando louvores...</div>:songs.length?<div className="song-list">{songs.map((song:any)=><article className="song-card" key={song.id}><div className="song-cover">{song.coverUrl?<img src={song.coverUrl} alt={`Capa de ${song.title}`}/>:<Music2 size={34}/>}</div><div className="song-info"><span className="post-category">LOUVOR</span><h2>{song.title}</h2><p className="song-artist">{song.artist}</p>{song.description&&<p>{song.description}</p>}<audio controls preload="none" src={song.audioUrl} onLoadedMetadata={e=>{e.currentTarget.volume=0.85}} onPlay={e=>boostAudio(e.currentTarget)} aria-label={`Ouvir ${song.title}`}/><div className="song-actions"><span><Headphones size={14}/> Reprodução online</span></div></div></article>)}</div>:<div className="song-empty"><Music2 size={42}/><h2>Em breve, novos louvores</h2><p>A administração ainda está preparando esta seleção musical.</p></div>}</main>
}
