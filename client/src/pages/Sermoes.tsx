import { ArrowRight, BookOpen, Headphones } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect } from 'react';

const pageTitle = 'Sermões - Preparando os Escolhidos para a Grande Vinda';
const pageDescription = 'Sermões da Sinais dos Tempos Web Rádio: mensagens adventistas que preparam os remanescentes para a grande vinda do nosso Senhor Jesus Cristo. Ouça e fortaleça sua fé.';

function setMeta(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setProperty(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default function Sermoes() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = pageTitle;
    setMeta('description', pageDescription);
    setProperty('og:title', pageTitle);
    setProperty('og:description', pageDescription);
    return () => { document.title = previousTitle; };
  }, []);

  return <main className="page-main sermons-page"><div className="container"><div className="page-intro"><span className="section-kicker">MENSAGENS PARA A CAMINHADA</span><h1>Preparando os escolhidos para a Grande Vinda</h1><p>{pageDescription}</p></div><section className="sermons-content"><div className="sermons-icon"><BookOpen size={28} /></div><div><h2>Sermões adventistas</h2><p>Mensagens de fé, esperança e preparação espiritual fundamentadas na Palavra de Deus e nas orientações do Espírito de Profecia.</p><div className="sermons-actions"><Link href="/blog?categoria=Sermões" className="primary-button">Ouvir e ler mensagens <ArrowRight size={17} /></Link><Link href="/" className="ghost-button"><Headphones size={17} /> Ouvir a rádio</Link></div></div></section></div></main>;
}

export { pageTitle, pageDescription };

/* eslint-disable no-unused-vars */
void setMeta;
void setProperty;
/* eslint-enable no-unused-vars */
