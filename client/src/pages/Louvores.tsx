import { Headphones, Music2, Volume2, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

type AudioGraph = { context: AudioContext; gain: GainNode };
type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

const audioGraphs = new WeakMap<HTMLAudioElement, AudioGraph>();
const DEFAULT_BOOST = 2.4;
const MIN_BOOST = 1;
const MAX_BOOST = 3;

function getAudioGraph(audio: HTMLAudioElement): AudioGraph | null {
  const existing = audioGraphs.get(audio);
  if (existing) return existing;

  try {
    const AudioContextConstructor = window.AudioContext || (window as AudioWindow).webkitAudioContext;
    if (!AudioContextConstructor) return null;
    const context = new AudioContextConstructor();
    const source = context.createMediaElementSource(audio);
    const gain = context.createGain();
    source.connect(gain).connect(context.destination);
    const graph = { context, gain };
    audioGraphs.set(audio, graph);
    return graph;
  } catch {
    // Alguns navegadores bloqueiam o Web Audio para determinados arquivos.
    return null;
  }
}

function applyBoost(audio: HTMLAudioElement, enabled: boolean, boost: number) {
  // O volume nativo fica no máximo; o ganho adicional é aplicado apenas aqui.
  audio.volume = 1;
  const graph = getAudioGraph(audio);
  if (!graph) return;
  graph.gain.gain.value = enabled ? boost : 1;
  void graph.context.resume();
}

export default function Louvores() {
  const { data, isLoading } = useQuery({
    queryKey: ["songs"],
    queryFn: () => apiFetch(`/api/songs?updated=${Date.now()}`),
  });
  const songs = data || [];
  const audioListRef = useRef<HTMLDivElement>(null);
  const [boosterEnabled, setBoosterEnabled] = useState(true);
  const [boost, setBoost] = useState(DEFAULT_BOOST);

  useEffect(() => {
    const savedEnabled = window.localStorage.getItem("louvores-volume-booster");
    const savedBoost = Number(window.localStorage.getItem("louvores-volume-level"));
    if (savedEnabled !== null) setBoosterEnabled(savedEnabled === "on");
    if (Number.isFinite(savedBoost)) setBoost(Math.min(MAX_BOOST, Math.max(MIN_BOOST, savedBoost)));
  }, []);

  useEffect(() => {
    const audios = audioListRef.current?.querySelectorAll("audio");
    audios?.forEach((audio) => applyBoost(audio, boosterEnabled, boost));
  }, [boosterEnabled, boost, songs]);

  function updateBooster(enabled: boolean) {
    setBoosterEnabled(enabled);
    window.localStorage.setItem("louvores-volume-booster", enabled ? "on" : "off");
  }

  function updateBoost(value: number) {
    setBoost(value);
    window.localStorage.setItem("louvores-volume-level", String(value));
  }

  return (
    <main className="container page-main">
      <div className="page-intro">
        <span className="section-kicker">MÚSICA PARA A ALMA</span>
        <h1>Os melhores louvores</h1>
        <p>Ouça seus louvores preferidos online e fortaleça sua fé com esta seleção especial.</p>
      </div>

      <section className="louvores-booster" aria-label="Booster de volume dos louvores">
        <div className="louvores-booster-icon"><Zap size={20} /></div>
        <div className="louvores-booster-copy">
          <strong>Booster de volume</strong>
          <span>Aumenta somente o volume dos MP3 desta seção.</span>
        </div>
        <label className="booster-toggle">
          <input type="checkbox" checked={boosterEnabled} onChange={(event) => updateBooster(event.target.checked)} />
          <span>{boosterEnabled ? "Ativado" : "Desativado"}</span>
        </label>
        <label className="booster-level">
          <span><Volume2 size={15} /> Intensidade: <strong>{Math.round(boost * 100)}%</strong></span>
          <input
            type="range"
            min={MIN_BOOST}
            max={MAX_BOOST}
            step="0.1"
            value={boost}
            onChange={(event) => updateBoost(Number(event.target.value))}
            disabled={!boosterEnabled}
            aria-label="Intensidade do booster de volume"
          />
        </label>
      </section>

      {isLoading ? <div className="loading-state">Carregando louvores...</div> : songs.length ? (
        <div className="song-list" ref={audioListRef}>
          {songs.map((song: any) => (
            <article className="song-card" key={song.id}>
              <div className="song-cover">{song.coverUrl ? <img src={song.coverUrl} alt={`Capa de ${song.title}`} /> : <Music2 size={34} />}</div>
              <div className="song-info">
                <span className="post-category">LOUVOR</span>
                <h2>{song.title}</h2>
                <p className="song-artist">{song.artist}</p>
                {song.description && <p>{song.description}</p>}
                <audio
                  controls
                  preload="none"
                  src={song.audioUrl}
                  onLoadedMetadata={(event) => applyBoost(event.currentTarget, boosterEnabled, boost)}
                  onPlay={(event) => applyBoost(event.currentTarget, boosterEnabled, boost)}
                  aria-label={`Ouvir ${song.title}`}
                />
                <div className="song-actions"><span><Headphones size={14} /> Reprodução online</span></div>
              </div>
            </article>
          ))}
        </div>
      ) : <div className="song-empty"><Music2 size={42} /><h2>Em breve, novos louvores</h2><p>A administração ainda está preparando esta seleção musical.</p></div>}
    </main>
  );
}
