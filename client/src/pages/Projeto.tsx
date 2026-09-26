import { ArrowLeft, Heart, Radio, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Projeto() {
  return (
    <main className="container page-main">
      <article className="project-page">
        <Link href="/" className="back-link"><ArrowLeft size={15} /> Voltar para o início</Link>
        <div className="page-intro">
          <span className="section-kicker">SINAIS DOS TEMPOS WEB RÁDIO</span>
          <h1>Conheça Nosso Projeto</h1>
          <p>Uma voz de esperança, fé e preparação para a breve volta de Cristo.</p>
        </div>
        <div className="project-content">
          <div className="project-highlight"><Radio size={28} /><strong>Uma missão de fé, oração e esperança</strong></div>
          <p>A Sinais dos Tempos Web Rádio nasceu com o propósito de ser uma voz de esperança em meio às incertezas do mundo. Somos uma organização sem fins lucrativos, dedicada exclusivamente à missão de compartilhar a mensagem do evangelho eterno, fortalecer a fé e preparar corações para a breve volta de Cristo.</p>
          <p>Nosso compromisso é transmitir sermões, cultos e reflexões que edificam a vida espiritual, sempre fundamentados na Palavra de Deus e nas orientações do Espírito de Profecia. A rádio não busca interesses comerciais, mas sim cumprir um chamado: levar luz, verdade e consolo a cada lar, em qualquer lugar do mundo.</p>
          <p>Acreditamos que cada transmissão é uma oportunidade de tocar vidas, despertar consciências e inspirar perseverança. Por isso, trabalhamos com dedicação e amor, confiando que Deus é quem dirige este projeto.</p>
          <section className="project-final-message">
            <div className="project-final-icon"><Heart size={22} /></div>
            <div><span className="section-kicker">MENSAGEM FINAL</span><p>A Sinais dos Tempos Web Rádio é mais do que uma emissora: é um ministério. Um espaço onde fé, oração e esperança se encontram para fortalecer o povo de Deus e anunciar ao mundo que Jesus em breve voltará.</p></div>
          </section>
          <div className="project-signature"><Sparkles size={16} /> Feito para edificar e anunciar esperança</div>
        </div>
      </article>
    </main>
  );
}
