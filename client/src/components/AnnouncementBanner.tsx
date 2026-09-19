import { ExternalLink, Info, TriangleAlert, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

type Announcement = { id: number; title: string; message: string; variant: 'info' | 'success' | 'warning'; linkUrl?: string | null; linkLabel?: string | null };

const icons = { info: Info, success: CheckCircle2, warning: TriangleAlert };

export default function AnnouncementBanner() {
  const { data } = useQuery<Announcement[]>({ queryKey: ['announcements'], queryFn: () => apiFetch('/api/announcements'), staleTime: 60_000 });
  if (!data?.length) return null;
  return <section className="announcement-stack container" aria-label="Avisos importantes">
    {data.map((item) => {
      const Icon = icons[item.variant] || Info;
      return <div className={`announcement announcement-${item.variant}`} key={item.id}>
        <Icon size={20} aria-hidden="true" />
        <div className="announcement-copy"><strong>{item.title}</strong><span>{item.message}</span></div>
        {item.linkUrl && <a href={item.linkUrl} target="_blank" rel="noreferrer" className="announcement-link">{item.linkLabel || 'Saiba mais'} <ExternalLink size={14} /></a>}
      </div>;
    })}
  </section>;
}
