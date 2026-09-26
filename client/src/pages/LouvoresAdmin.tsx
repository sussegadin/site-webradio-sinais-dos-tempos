import { useRef, useState } from "react";
import { AudioLines, Music2, Pencil, ShieldCheck, Trash2, Upload, X } from "lucide-react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, fileToBase64 } from "@/lib/api";
import { useAuth } from "@/_core/hooks/useAuth";

type Song = {
  id: number;
  title: string;
  artist: string;
  description?: string | null;
  audioUrl: string;
  coverUrl?: string | null;
  active: number;
};

type SongForm = {
  title: string;
  artist: string;
  description: string;
  audioUrl: string;
  coverUrl: string;
};

const empty: SongForm = { title: "", artist: "", description: "", audioUrl: "", coverUrl: "" };

export default function LouvoresAdmin() {
  const { isAuthenticated, loading } = useAuth();
  const client = useQueryClient();
  const [form, setForm] = useState<SongForm>(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draggingAudio, setDraggingAudio] = useState(false);
  const audioRef = useRef<HTMLInputElement>(null);
  const audioAllRef = useRef<HTMLInputElement>(null);

  const songs = useQuery<Song[]>({
    queryKey: ["admin-songs"],
    queryFn: () => apiFetch("/api/songs/admin/all"),
    enabled: isAuthenticated,
  });

  const save = useMutation({
    mutationFn: (payload: SongForm) => {
      const isEditing = editing !== null;
      return apiFetch(isEditing ? `/api/songs/${editing}` : "/api/songs", {
        method: isEditing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      setForm(empty);
      setEditing(null);
      setError("");
      setNotice("Louvor salvo com sucesso. A lista foi atualizada.");
      await client.refetchQueries({ queryKey: ["admin-songs"] });
      await client.invalidateQueries({ queryKey: ["songs"] });
    },
    onError: (err: Error) => {
      setNotice("");
      setError(err.message || "Não foi possível salvar o louvor.");
    },
  });

  const uploadAudio = useMutation({
    mutationFn: (value: { fileName: string; mimeType: string; base64: string; kind: string }) =>
      apiFetch<{ url: string }>("/api/media/upload", { method: "POST", body: JSON.stringify(value) }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/songs/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void client.refetchQueries({ queryKey: ["admin-songs"] });
      void client.invalidateQueries({ queryKey: ["songs"] });
      setNotice("Louvor excluído com sucesso.");
    },
    onError: (err: Error) => setError(err.message || "Não foi possível excluir o louvor."),
  });

  if (loading) return <main className="container page-main"><div className="loading-state">Verificando acesso...</div></main>;
  if (!isAuthenticated) return <main className="container page-main"><div className="locked-card"><ShieldCheck size={36} /><h1>Área reservada</h1><p>Somente a administração pode cadastrar louvores.</p><Link href="/admin/login" className="primary-button">Entrar</Link></div></main>;

  const set = (key: keyof SongForm, value: string) => {
    setNotice("");
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const edit = (song: Song) => {
    setNotice("");
    setError("");
    setEditing(song.id);
    setForm({ title: song.title, artist: song.artist, description: song.description || "", audioUrl: song.audioUrl, coverUrl: song.coverUrl || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancel = () => {
    setForm(empty);
    setEditing(null);
    setError("");
    setNotice("");
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    void save.mutateAsync({ ...form }).catch(() => undefined);
  };

  const processAudio = async (file?: File) => {
    if (!file) return;
    const isMp3 = /\.mp3$/i.test(file.name);
    const isAudio = file.type.toLowerCase().startsWith("audio/");
    let hasMp3Signature = false;
    if (!isMp3 && !isAudio) {
      const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
      hasMp3Signature = (header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33) || (header[0] === 0xff && (header[1] & 0xe0) === 0xe0);
    }
    if (!isMp3 && !isAudio && !hasMp3Signature) {
      setError("Escolha um arquivo de áudio MP3.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("O MP3 deve ter no máximo 25 MB.");
      return;
    }
    try {
      setError("");
      const stored = await uploadAudio.mutateAsync({ fileName: file.name.endsWith(".mp3") ? file.name : `${file.name}.mp3`, mimeType: "audio/mpeg", base64: await fileToBase64(file), kind: "audio" });
      set("audioUrl", stored.url);
      setNotice(`MP3 carregado: ${file.name}`);
    } catch (err: any) {
      setError(err.message || "Não foi possível enviar o MP3.");
    }
  };

  const chooseAudio = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await processAudio(event.target.files?.[0]);
    event.target.value = "";
  };

  const dropAudio = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggingAudio(false);
    await processAudio(event.dataTransfer.files?.[0]);
  };

  return <main className="container admin-main">
    <div className="admin-header"><div><span className="section-kicker">PAINEL ADMINISTRATIVO</span><h1>Louvores e MP3</h1><p>{editing !== null ? "Edite um louvor existente." : "Cadastre músicas para reprodução online."}</p></div><Link href="/admin" className="text-link">Voltar ao painel</Link></div>
    <div className="testimonials-admin-layout">
      <form className="editor-card testimonial-form" onSubmit={submit}>
        <div className="ai-title"><Music2 size={22} /><strong>{editing !== null ? "Editar louvor" : "Novo louvor"}</strong></div>
        <label>Título<input value={form.title} onChange={(event) => set("title", event.target.value)} required /></label>
        <label>Artista<input value={form.artist} onChange={(event) => set("artist", event.target.value)} required /></label>
        <label>Descrição<textarea value={form.description} onChange={(event) => set("description", event.target.value)} /></label>
        <label>Arquivo MP3<input ref={audioRef} type="file" accept=".mp3,audio/mpeg,audio/mp3,audio/*" hidden onChange={chooseAudio} /><input ref={audioAllRef} type="file" accept="*/*" hidden onChange={chooseAudio} /><div className={draggingAudio ? "audio-dropzone is-dragging" : "audio-dropzone"} onDragEnter={(event) => { event.preventDefault(); setDraggingAudio(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (event.currentTarget === event.target) setDraggingAudio(false); }} onDrop={dropAudio}><Upload size={20} /><strong>{draggingAudio ? "Solte o MP3 aqui" : "Arraste e solte o MP3 aqui"}</strong><small>ou use uma das opções abaixo</small></div><div className="upload-choice-row"><button type="button" className="builder-secondary-button" onClick={() => audioRef.current?.click()} disabled={uploadAudio.isPending}><Upload size={16} />{uploadAudio.isPending ? "Enviando MP3..." : "Escolher MP3"}</button><button type="button" className="ghost-button" onClick={() => audioAllRef.current?.click()} disabled={uploadAudio.isPending}>Procurar em todos os arquivos</button></div>{form.audioUrl && <small className="image-name">Arquivo pronto para publicação: {form.audioUrl.split("/").pop()}</small>}</label>
        <label>URL do MP3<input type="text" value={form.audioUrl} onChange={(event) => set("audioUrl", event.target.value)} placeholder="Escolha um arquivo ou informe uma URL" required /></label>
        <label>URL da capa<input type="url" value={form.coverUrl} onChange={(event) => set("coverUrl", event.target.value)} placeholder="https://..." /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-success" role="status">{notice}</p>}
        <div className="editor-actions"><button type="button" className="ghost-button" onClick={cancel}><X size={16} /> Cancelar</button><button type="submit" className="primary-button" disabled={save.isPending || uploadAudio.isPending}><Upload size={16} />{save.isPending ? "Salvando..." : editing !== null ? "Salvar alterações" : "Publicar louvor"}</button></div>
      </form>
      <aside className="ai-card"><div className="ai-title"><AudioLines size={22} /><div><strong>Louvores cadastrados</strong><small>Edite ou exclua músicas</small></div></div>{songs.data?.length ? songs.data.map((song) => <div className="testimonial-admin-item" key={song.id}><div><strong>{song.title}</strong><small>{song.artist} · {song.active ? "Ativo" : "Inativo"}</small></div><div className="announcement-admin-actions"><button type="button" title="Editar" onClick={() => edit(song)}><Pencil size={16} /></button><button type="button" title="Excluir" onClick={() => { if (confirm("Excluir este louvor?")) void remove.mutateAsync(song.id); }}><Trash2 size={16} /></button></div></div>) : !songs.isLoading && <p>Nenhum louvor cadastrado.</p>}</aside>
    </div>
  </main>;
}
