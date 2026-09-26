import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Moon, Sun, Radio, Heart, Menu, X, MessageCircle, Facebook, Instagram, Youtube, Pause, Play, Volume2 } from 'lucide-react';
import { useRadio } from '../contexts/RadioContext';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import AnnouncementBanner from './AnnouncementBanner';

const logo = '/images/logo.jpeg';

function SocialLinks({ links }: { links: Record<string, string> }) {
  const item = (key: string) => links[key] || '';
  return <div className="social-links" aria-label="Redes sociais">
    <a className="social-whatsapp" href={item('social_whatsapp') || '#'} target={item('social_whatsapp') ? '_blank' : undefined} rel={item('social_whatsapp') ? 'noreferrer' : undefined} aria-label="WhatsApp" title={item('social_whatsapp') ? 'Conversar no WhatsApp' : 'WhatsApp ainda não configurado'} onClick={e => { if (!item('social_whatsapp')) e.preventDefault(); }}><MessageCircle size={17} /></a>
    <a className={!item('social_facebook') ? 'social-disabled' : ''} href={item('social_facebook') || '#'} target={item('social_facebook') ? '_blank' : undefined} rel={item('social_facebook') ? 'noreferrer' : undefined} aria-label="Facebook" title={item('social_facebook') ? 'Facebook' : 'Facebook ainda não configurado'} onClick={e => { if (!item('social_facebook')) e.preventDefault(); }}><Facebook size={17} /></a>
    <a className={!item('social_instagram') ? 'social-disabled' : ''} href={item('social_instagram') || '#'} target={item('social_instagram') ? '_blank' : undefined} rel={item('social_instagram') ? 'noreferrer' : undefined} aria-label="Instagram" title={item('social_instagram') ? 'Instagram' : 'Instagram ainda não configurado'} onClick={e => { if (!item('social_instagram')) e.preventDefault(); }}><Instagram size={17} /></a>
    <a className={!item('social_youtube') ? 'social-disabled' : ''} href={item('social_youtube') || '#'} target={item('social_youtube') ? '_blank' : undefined} rel={item('social_youtube') ? 'noreferrer' : undefined} aria-label="YouTube" title={item('social_youtube') ? 'YouTube' : 'YouTube ainda não configurado'} onClick={e => { if (!item('social_youtube')) e.preventDefault(); }}><Youtube size={17} /></a>
  </div>;
}

export default function SiteShell({ children }: { children: ReactNode }) {
  const [light, setLight] = useState(false);
  const [menu, setMenu] = useState(false);
  const { playing, toggleAudio } = useRadio();
  const { data: siteContent = {} } = useQuery<Record<string, string>>({ queryKey: ['site-content'], queryFn: () => apiFetch('/api/site-content') });
  const { data: visitCounter } = useQuery<{ count: number; today: number; month: number; year: number }>({ queryKey: ['visit-counter'], queryFn: () => apiFetch('/api/visits'), staleTime: Infinity, refetchOnWindowFocus: false, refetchOnReconnect: false, retry: false });
  useEffect(() => { if (localStorage.getItem('sinais-theme') === 'light') setLight(true); }, []);
  useEffect(() => { document.documentElement.classList.toggle('light', light); localStorage.setItem('sinais-theme', light ? 'light' : 'dark'); }, [light]);
  return <div className="site-shell">
    <header className="topbar"><div className="container nav-inner"><Link href="/" className="brand"><img src={logo} alt="Sinais dos Tempos" /><span><strong>SINAIS DOS TEMPOS</strong><small>WEB RÁDIO</small><small className="brand-tagline">A Rádio dos Remanescentes</small></span></Link><nav className={menu ? 'nav-links open' : 'nav-links'}><Link href="/">Início</Link><Link href="/blog">Blog</Link><Link href="/louvores">Louvores</Link><Link href="/quiz">Quiz Adventista</Link><Link href="/sponsors">Patrocinadores</Link></nav><div className="nav-actions"><button className="icon-button" onClick={() => setLight(v => !v)} aria-label="Alternar tema">{light ? <Moon size={18} /> : <Sun size={18} />}</button><button className="icon-button menu-button" onClick={() => setMenu(v => !v)} aria-label="Abrir menu">{menu ? <X size={20} /> : <Menu size={20} />}</button></div></div></header>
    <div className="live-strip"><div className="container live-player"><div className="live-player-brand"><div className={playing ? 'live-player-icon playing' : 'live-player-icon'}><Radio size={24} /></div><div className="live-copy"><span className="live-kicker">WEB RÁDIO AO VIVO</span><span className="live-status"><span className={playing ? 'live-dot active' : 'live-dot'}></span>{playing ? 'NO AR AGORA' : 'RÁDIO ONLINE'}</span><small>Sinais dos Tempos Web Rádio <b>•</b> Foz do Iguaçu / PR - Brasil</small></div></div><div className={playing ? 'live-equalizer active' : 'live-equalizer'} aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div><div className="live-player-action"><Volume2 size={18} className="live-volume-icon" /><button className={playing ? 'live-button playing' : 'live-button'} onClick={toggleAudio} aria-label={playing ? 'Pausar rádio ao vivo' : 'Ouvir rádio ao vivo'}>{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}{playing ? 'Pausar rádio' : 'Ouvir ao vivo'}</button></div></div></div>
    <AnnouncementBanner />{children}
    <footer className="footer"><div className="container footer-grid"><div><div className="brand footer-brand"><img src={logo} alt="" /><span><strong>SINAIS DOS TEMPOS</strong><small>WEB RÁDIO</small></span></div><p>A Rádio dos Remanescentes.</p><SocialLinks links={siteContent} /></div><div><h4>Navegação</h4><Link href="/blog">Blog</Link><Link href="/louvores">Os melhores louvores</Link><Link href="/sponsors">Patrocinadores</Link></div><div><h4>Converse conosco</h4><p>Fale com a Sinais dos Tempos Web Rádio — A Rádio dos Remanescentes — pelo WhatsApp.</p><span className="social-hint">WhatsApp, Facebook, Instagram e YouTube</span></div></div><div className="container footer-bottom">© {new Date().getFullYear()} Sinais dos Tempos — Web Rádio <span className="visit-counter">Total: {(visitCounter?.count || 10000).toLocaleString('pt-BR')} · Hoje: {visitCounter?.today || 0} · Mês: {visitCounter?.month || 0} · Ano: {visitCounter?.year || 0}</span><span><Heart size={13} /> Feito para edificar</span></div></footer>
  </div>;
}
