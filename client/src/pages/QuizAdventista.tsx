// @ts-nocheck
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Lightbulb, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { pickRandomQuestions } from '../data/adventQuestions.js';

const LEVELS = [
  { id: 'facil', label: 'Fácil', description: 'Conhecimentos bíblicos fundamentais', tone: 'easy' },
  { id: 'medio', label: 'Médio', description: 'Bíblia, Ellen White e pioneiros', tone: 'medium' },
  { id: 'dificil', label: 'Difícil', description: 'Para quem gosta de um desafio', tone: 'hard' },
];

function QuizHome({ onStart }) {
  const [level, setLevel] = useState('facil');
  return <section className="quiz-adventista-shell">
    <div className="quiz-adventista-hero"><span className="section-kicker">ESTUDO • BÍBLIA • HISTÓRIA</span><h1>Quiz Adventista</h1><p>Teste seus conhecimentos sobre a Bíblia, Ellen G. White e os pioneiros adventistas.</p></div>
    <div className="quiz-adventista-panel"><div className="quiz-panel-heading"><Trophy size={20}/><div><strong>Escolha o nível</strong><small>Serão apresentadas 10 perguntas</small></div></div><div className="quiz-level-grid">{LEVELS.map(item => <button type="button" key={item.id} className={`quiz-level ${item.tone} ${level === item.id ? 'selected' : ''}`} onClick={() => setLevel(item.id)}><span>{item.label}</span><small>{item.description}</small></button>)}</div><button type="button" className="quiz-primary-button" onClick={() => onStart(level)}>Começar quiz</button></div>
  </section>;
}

function QuizPlay({ questions, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const question = questions[current];
  const progress = ((current + (selected !== null ? 1 : 0)) / questions.length) * 100;
  const answer = (index) => { if (selected !== null) return; setSelected(index); if (index === question.correta) setScore(value => value + 1); };
  const next = () => { if (current + 1 >= questions.length) onFinish(score + (selected === question.correta ? 1 : 0)); else { setCurrent(value => value + 1); setSelected(null); } };
  return <section className="quiz-adventista-shell quiz-play-shell"><div className="quiz-progress-meta"><span>Pergunta {current + 1} de {questions.length}</span><strong>{score} acertos</strong></div><div className="quiz-progress"><span style={{ width: `${progress}%` }}/></div><article className="quiz-question-card"><span className="quiz-question-tag"><Lightbulb size={14}/> Quiz Adventista</span><h2>{question.pergunta}</h2></article><div className="quiz-options">{question.alternativas.map((option, index) => { const isCorrect = selected !== null && index === question.correta; const isWrong = selected === index && index !== question.correta; return <button type="button" key={`${current}-${option}`} className={`quiz-option ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`} disabled={selected !== null} onClick={() => answer(index)}><span>{String.fromCharCode(65 + index)}</span>{option}{isCorrect && <CheckCircle2 size={18}/>} {isWrong && <XCircle size={18}/>}</button>; })}</div>{selected !== null && <button type="button" className="quiz-primary-button" onClick={next}>{current + 1 === questions.length ? 'Ver resultado' : 'Próxima pergunta'}</button>}</section>;
}

function QuizResult({ score, onAgain }) {
  const total = 10;
  const percentage = Math.round((score / total) * 100);
  const message = percentage === 100 ? 'Excelente! Seu conhecimento está afiado.' : percentage >= 70 ? 'Muito bem! Continue estudando e crescendo.' : percentage >= 40 ? 'Bom começo. A próxima rodada pode ser ainda melhor.' : 'Continue estudando. Cada pergunta é uma oportunidade de aprender.';
  return <section className="quiz-adventista-shell quiz-result-shell"><div className="quiz-result-circle"><strong>{score}</strong><span>de {total}</span></div><h1>{percentage === 100 ? 'Parabéns!' : 'Quiz concluído'}</h1><p>{message}</p><button type="button" className="quiz-primary-button" onClick={onAgain}><RotateCcw size={17}/> Jogar novamente</button></section>;
}

export default function QuizAdventista() {
  const [screen, setScreen] = useState('home');
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const start = (level) => { setQuestions(pickRandomQuestions(level, 10)); setScreen('play'); };
  const finish = (value) => { setScore(value); setScreen('result'); };
  const again = () => { setQuestions([]); setScore(0); setScreen('home'); };
  return <main className="quiz-adventista-page">{screen === 'home' && <QuizHome onStart={start}/>} {screen === 'play' && questions.length > 0 && <QuizPlay questions={questions} onFinish={finish}/>} {screen === 'result' && <QuizResult score={score} onAgain={again}/>} {screen !== 'home' && <button type="button" className="quiz-back-button" onClick={again}><ArrowLeft size={15}/> Voltar ao início</button>}</main>;
}
