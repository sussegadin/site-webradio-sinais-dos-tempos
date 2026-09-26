// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Lightbulb, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { pickRandomQuestions } from '../data/adventQuestions.js';
import { apiFetch } from '@/lib/api';


function GoogleLogin({ player, onLogin }) {
  const ref = useRef(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let cancelled = false;
    const setup = async () => {
      const config = await apiFetch('/api/quiz/config');
      if (!config.googleClientId) { setMessage('O login Google ainda não foi configurado.'); return; }
      const render = () => {
        if (cancelled || !ref.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({ client_id: config.googleClientId, callback: async (response) => {
          try { const result = await apiFetch('/api/quiz/auth/google', { method: 'POST', body: JSON.stringify({ credential: response.credential }) }); onLogin(result.player); setMessage('Login realizado.'); }
          catch (error) { setMessage(error.message || 'Não foi possível entrar com Google.'); }
          } });
        window.google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular', width: 280 });
      };
      if (window.google?.accounts?.id) render();
      else { const script = document.createElement('script'); script.src = 'https://accounts.google.com/gsi/client'; script.async = true; script.onload = render; document.head.appendChild(script); }
    };
    setup().catch(() => setMessage('Não foi possível carregar o login Google.'));
    return () => { cancelled = true; };
  }, [onLogin]);
  return <div className="quiz-login-box">{player ? <span className="quiz-logged-user">Olá, <strong>{player.displayName}</strong></span> : <div ref={ref} />}{message && !player && <small>{message} O login é opcional e serve apenas para participar do ranking.</small>}</div>;
}

function Leaderboard({ entries = [] }) {
  return <div className="quiz-leaderboard"><div className="quiz-leaderboard-heading"><Trophy size={18} /><strong>Ranking recreativo • competição saudável</strong></div>{entries.length ? entries.slice(0, 10).map((item, index) => <div className="quiz-rank-row" key={`${item.displayName}-${item.difficulty}-${index}`}><b>{index + 1}</b><span>{item.displayName}</span><small>Todos</small><strong>{item.score}/{item.total}</strong></div>) : <p>Nenhuma pontuação registrada ainda.</p>}</div>;
}

function QuizHome({ onStart, player, onLogin, leaderboard }) {
  return <section className="quiz-adventista-shell">
    <div className="quiz-adventista-hero"><span className="section-kicker">ESTUDO • BÍBLIA • HISTÓRIA</span><h1>Quiz Adventista</h1><p>Divirta-se testando seus conhecimentos sobre a Bíblia, Ellen G. White e os pioneiros adventistas.</p></div>
      <div className="quiz-adventista-panel"><div className="quiz-panel-heading"><Trophy size={20}/><div><strong>Competição saudável</strong><small>Todas as perguntas ficam misturadas. Jogue quantas quiser e pare quando desejar para registrar seus acertos.</small></div></div><GoogleLogin player={player} onLogin={onLogin}/><button type="button" className="quiz-primary-button" onClick={onStart}>Começar quiz</button></div><Leaderboard entries={leaderboard}/>
  </section>;
}

function QuizPlay({ onFinish }) {
  const [questions, setQuestions] = useState(() => pickRandomQuestions('todos', 1));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const question = questions[current];
  const answer = (index) => { if (selected !== null) return; setSelected(index); if (index === question.correta) setScore(value => value + 1); };
  const next = () => { const nextQuestion = pickRandomQuestions('todos', 5).find(item => item.pergunta !== question.pergunta) || pickRandomQuestions('todos', 1)[0]; setQuestions(value => [...value, nextQuestion]); setCurrent(value => value + 1); setSelected(null); };
  const stop = () => onFinish(score + (selected === question.correta ? 1 : 0), current + (selected !== null ? 1 : 0));
  return <section className="quiz-adventista-shell quiz-play-shell"><div className="quiz-progress-meta"><span>Pergunta {current + 1}</span><strong>{score} acertos</strong></div><article className="quiz-question-card"><span className="quiz-question-tag"><Lightbulb size={14}/> Quiz Adventista</span><h2>{question.pergunta}</h2></article><div className="quiz-options">{question.alternativas.map((option, index) => { const isCorrect = selected !== null && index === question.correta; const isWrong = selected === index && index !== question.correta; return <button type="button" key={`${current}-${option}`} className={`quiz-option ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`} disabled={selected !== null} onClick={() => answer(index)}><span>{String.fromCharCode(65 + index)}</span>{option}{isCorrect && <CheckCircle2 size={18}/>} {isWrong && <XCircle size={18}/>}</button>; })}</div><div className="quiz-play-actions"><button type="button" className="quiz-primary-button" onClick={next} disabled={selected === null}>Próxima pergunta</button><button type="button" className="quiz-stop-button" onClick={stop}>Parar quiz e ver pontuação</button></div></section>;
}

function QuizResult({ score, total, onAgain, leaderboard }) {
  const percentage = Math.round((score / total) * 100);
  const message = percentage === 100 ? 'Excelente! Seu conhecimento está afiado.' : percentage >= 70 ? 'Muito bem! Continue estudando e crescendo.' : percentage >= 40 ? 'Bom começo. A próxima rodada pode ser ainda melhor.' : 'Continue estudando. Cada pergunta é uma oportunidade de aprender.';
  return <section className="quiz-adventista-shell quiz-result-shell"><div className="quiz-result-circle"><strong>{score}</strong><span>de {total}</span></div><h1>{total ? 'Quiz encerrado' : 'Quiz não pontuado'}</h1><p>{message}</p><button type="button" className="quiz-primary-button" onClick={onAgain}><RotateCcw size={17}/> Jogar novamente</button><Leaderboard entries={leaderboard}/></section>;
}

export default function QuizAdventista() {
  const [screen, setScreen] = useState('home'); const [score, setScore] = useState(0); const [total, setTotal] = useState(0); const [player, setPlayer] = useState(null); const [leaderboard, setLeaderboard] = useState([]);
  const refreshLeaderboard = () => apiFetch('/api/quiz/leaderboard').then(result => setLeaderboard(result.leaderboard || [])).catch(() => undefined);
  useEffect(() => { apiFetch('/api/quiz/me').then(result => { if (result.authenticated) setPlayer(result.player); }).catch(() => undefined); refreshLeaderboard(); }, []);
  const start = () => { setScreen('play'); };
  const finish = (value, answered) => { setScore(value); setTotal(answered); setScreen('result'); if (player && answered > 0) apiFetch('/api/quiz/scores', { method: 'POST', body: JSON.stringify({ score: value, total: answered, difficulty: 'todos' }) }).then(refreshLeaderboard).catch(() => undefined); };
  const again = () => { setScore(0); setTotal(0); setScreen('home'); };
  return <main className="quiz-adventista-page">{screen === 'home' && <QuizHome onStart={start} player={player} onLogin={setPlayer} leaderboard={leaderboard}/>} {screen === 'play' && <QuizPlay onFinish={finish}/>} {screen === 'result' && <QuizResult score={score} total={total} onAgain={again} leaderboard={leaderboard}/>} {screen !== 'home' && <button type="button" className="quiz-back-button" onClick={again}><ArrowLeft size={15}/> Voltar ao início</button>}</main>;
}
