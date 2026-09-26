// Banco de perguntas — combina perguntas geradas por código (estrutura
// bíblica: testamento, ordem e gênero dos 66 livros — fatos objetivos e de
// baixo risco de erro) com perguntas escritas à mão sobre Ellen G. White e
// os Pioneiros Adventistas.
//
// IMPORTANTE: as perguntas geradas (área "biblia") seguem dados estruturais
// verificáveis. As perguntas escritas à mão (áreas "ellen" e "pioneiros")
// foram elaboradas com base em fatos amplamente documentados, mas
// recomenda-se revisão teológica/histórica antes de publicação ampla,
// especialmente para o nível difícil.

const BIBLE_BOOKS = [
  { name: "Gênesis", testament: "AT", genre: "Pentateuco (Lei)" },
  { name: "Êxodo", testament: "AT", genre: "Pentateuco (Lei)" },
  { name: "Levítico", testament: "AT", genre: "Pentateuco (Lei)" },
  { name: "Números", testament: "AT", genre: "Pentateuco (Lei)" },
  { name: "Deuteronômio", testament: "AT", genre: "Pentateuco (Lei)" },
  { name: "Josué", testament: "AT", genre: "Histórico" },
  { name: "Juízes", testament: "AT", genre: "Histórico" },
  { name: "Rute", testament: "AT", genre: "Histórico" },
  { name: "1 Samuel", testament: "AT", genre: "Histórico" },
  { name: "2 Samuel", testament: "AT", genre: "Histórico" },
  { name: "1 Reis", testament: "AT", genre: "Histórico" },
  { name: "2 Reis", testament: "AT", genre: "Histórico" },
  { name: "1 Crônicas", testament: "AT", genre: "Histórico" },
  { name: "2 Crônicas", testament: "AT", genre: "Histórico" },
  { name: "Esdras", testament: "AT", genre: "Histórico" },
  { name: "Neemias", testament: "AT", genre: "Histórico" },
  { name: "Ester", testament: "AT", genre: "Histórico" },
  { name: "Jó", testament: "AT", genre: "Poético/Sapiencial" },
  { name: "Salmos", testament: "AT", genre: "Poético/Sapiencial" },
  { name: "Provérbios", testament: "AT", genre: "Poético/Sapiencial" },
  { name: "Eclesiastes", testament: "AT", genre: "Poético/Sapiencial" },
  { name: "Cantares de Salomão", testament: "AT", genre: "Poético/Sapiencial" },
  { name: "Isaías", testament: "AT", genre: "Profeta Maior" },
  { name: "Jeremias", testament: "AT", genre: "Profeta Maior" },
  { name: "Lamentações", testament: "AT", genre: "Profeta Maior" },
  { name: "Ezequiel", testament: "AT", genre: "Profeta Maior" },
  { name: "Daniel", testament: "AT", genre: "Profeta Maior" },
  { name: "Oséias", testament: "AT", genre: "Profeta Menor" },
  { name: "Joel", testament: "AT", genre: "Profeta Menor" },
  { name: "Amós", testament: "AT", genre: "Profeta Menor" },
  { name: "Obadias", testament: "AT", genre: "Profeta Menor" },
  { name: "Jonas", testament: "AT", genre: "Profeta Menor" },
  { name: "Miquéias", testament: "AT", genre: "Profeta Menor" },
  { name: "Naum", testament: "AT", genre: "Profeta Menor" },
  { name: "Habacuque", testament: "AT", genre: "Profeta Menor" },
  { name: "Sofonias", testament: "AT", genre: "Profeta Menor" },
  { name: "Ageu", testament: "AT", genre: "Profeta Menor" },
  { name: "Zacarias", testament: "AT", genre: "Profeta Menor" },
  { name: "Malaquias", testament: "AT", genre: "Profeta Menor" },
  { name: "Mateus", testament: "NT", genre: "Evangelho" },
  { name: "Marcos", testament: "NT", genre: "Evangelho" },
  { name: "Lucas", testament: "NT", genre: "Evangelho" },
  { name: "João", testament: "NT", genre: "Evangelho" },
  { name: "Atos", testament: "NT", genre: "Histórico" },
  { name: "Romanos", testament: "NT", genre: "Carta Paulina" },
  { name: "1 Coríntios", testament: "NT", genre: "Carta Paulina" },
  { name: "2 Coríntios", testament: "NT", genre: "Carta Paulina" },
  { name: "Gálatas", testament: "NT", genre: "Carta Paulina" },
  { name: "Efésios", testament: "NT", genre: "Carta Paulina" },
  { name: "Filipenses", testament: "NT", genre: "Carta Paulina" },
  { name: "Colossenses", testament: "NT", genre: "Carta Paulina" },
  { name: "1 Tessalonicenses", testament: "NT", genre: "Carta Paulina" },
  { name: "2 Tessalonicenses", testament: "NT", genre: "Carta Paulina" },
  { name: "1 Timóteo", testament: "NT", genre: "Carta Paulina" },
  { name: "2 Timóteo", testament: "NT", genre: "Carta Paulina" },
  { name: "Tito", testament: "NT", genre: "Carta Paulina" },
  { name: "Filemom", testament: "NT", genre: "Carta Paulina" },
  { name: "Hebreus", testament: "NT", genre: "Carta Geral" },
  { name: "Tiago", testament: "NT", genre: "Carta Geral" },
  { name: "1 Pedro", testament: "NT", genre: "Carta Geral" },
  { name: "2 Pedro", testament: "NT", genre: "Carta Geral" },
  { name: "1 João", testament: "NT", genre: "Carta Geral" },
  { name: "2 João", testament: "NT", genre: "Carta Geral" },
  { name: "3 João", testament: "NT", genre: "Carta Geral" },
  { name: "Judas", testament: "NT", genre: "Carta Geral" },
  { name: "Apocalipse", testament: "NT", genre: "Profético/Apocalíptico" },
];

function shuffleArr(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildOptions(correct, pool) {
  const distractors = shuffleArr(pool.filter((x) => x !== correct)).slice(0, 3);
  const options = shuffleArr([correct, ...distractors]);
  return { alternativas: options, correta: options.indexOf(correct) };
}

function generateBibleStructureQuestions() {
  const allBookNames = BIBLE_BOOKS.map((b) => b.name);
  const allGenres = [...new Set(BIBLE_BOOKS.map((b) => b.genre))];
  const allPositions = Array.from({ length: BIBLE_BOOKS.length }, (_, i) => String(i + 1));
  const out = [];

  BIBLE_BOOKS.forEach((book, idx) => {
    // Testamento (fácil)
    {
      const correct = book.testament === "AT" ? "Antigo Testamento" : "Novo Testamento";
      const pool = ["Antigo Testamento", "Novo Testamento", "Apócrifos", "Não faz parte do cânon bíblico"];
      const { alternativas, correta } = buildOptions(correct, pool);
      out.push({ pergunta: `Em que parte da Bíblia está o livro de ${book.name}?`, alternativas, correta, area: "biblia", difficulty: "facil" });
    }
    // Qual livro está na posição N (fácil)
    {
      const position = idx + 1;
      const { alternativas, correta } = buildOptions(book.name, allBookNames);
      out.push({ pergunta: `Qual é o ${position}º livro da Bíblia, na ordem tradicional?`, alternativas, correta, area: "biblia", difficulty: "facil" });
    }
    // Gênero literário (médio)
    {
      const { alternativas, correta } = buildOptions(book.genre, allGenres);
      out.push({ pergunta: `A qual categoria literária pertence o livro de ${book.name}?`, alternativas, correta, area: "biblia", difficulty: "medio" });
    }
    // Próximo livro (médio)
    if (idx < BIBLE_BOOKS.length - 1) {
      const { alternativas, correta } = buildOptions(BIBLE_BOOKS[idx + 1].name, allBookNames);
      out.push({ pergunta: `Qual livro vem logo depois de ${book.name} na Bíblia?`, alternativas, correta, area: "biblia", difficulty: "medio" });
    }
    // Livro anterior (difícil)
    if (idx > 0) {
      const { alternativas, correta } = buildOptions(BIBLE_BOOKS[idx - 1].name, allBookNames);
      out.push({ pergunta: `Qual livro vem logo antes de ${book.name} na Bíblia?`, alternativas, correta, area: "biblia", difficulty: "dificil" });
    }
    // Posição numérica exata (difícil)
    {
      const position = String(idx + 1);
      const { alternativas, correta } = buildOptions(position, allPositions);
      out.push({ pergunta: `Em que posição o livro de ${book.name} aparece na ordem tradicional da Bíblia (1 a 66)?`, alternativas, correta, area: "biblia", difficulty: "dificil" });
    }
    // Outro livro do mesmo gênero literário (difícil) — só quando há mais de
    // um livro no mesmo gênero, para garantir uma resposta correta válida.
    {
      const sameGenre = BIBLE_BOOKS.filter((b) => b.genre === book.genre && b.name !== book.name).map((b) => b.name);
      if (sameGenre.length > 0) {
        const correct = shuffleArr(sameGenre)[0];
        const otherGenreBooks = BIBLE_BOOKS.filter((b) => b.genre !== book.genre).map((b) => b.name);
        const { alternativas, correta: correta2 } = buildOptions(correct, otherGenreBooks);
        out.push({ pergunta: `Qual destes livros pertence ao mesmo gênero literário de ${book.name}?`, alternativas, correta: correta2, area: "biblia", difficulty: "dificil" });
      }
    }
  });

  return out;
}

// Perguntas escritas à mão — Ellen G. White e Pioneiros Adventistas,
// mais um pequeno reforço de conteúdo bíblico temático (fora da estrutura).
const CURATED = [
  // ---------- FÁCIL ----------
  { pergunta: "Em que dia da semana os adventistas guardam o sábado bíblico?", alternativas: ["Domingo", "Sábado", "Sexta-feira", "Quinta-feira"], correta: 1, area: "biblia", difficulty: "facil" },
  { pergunta: "Quem construiu a arca antes do dilúvio?", alternativas: ["Abraão", "Moisés", "Noé", "Davi"], correta: 2, area: "biblia", difficulty: "facil" },
  { pergunta: "Qual mandamento fala sobre guardar o sábado?", alternativas: ["O primeiro", "O quarto", "O sétimo", "O décimo"], correta: 1, area: "biblia", difficulty: "facil" },
  { pergunta: "Quem foi jogado na cova dos leões?", alternativas: ["Daniel", "Davi", "José", "Jonas"], correta: 0, area: "biblia", difficulty: "facil" },
  { pergunta: "Ellen G. White é considerada pelos adventistas como uma:", alternativas: ["Rainha", "Profetisa", "Sacerdotisa", "Apóstola"], correta: 1, area: "ellen", difficulty: "facil" },
  { pergunta: "Qual é um dos livros mais conhecidos de Ellen G. White?", alternativas: ["O Grande Conflito", "A Fortaleza", "O Reino Perdido", "As Sete Trombetas"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Ellen G. White nasceu em qual país?", alternativas: ["Inglaterra", "Estados Unidos", "Alemanha", "Suíça"], correta: 1, area: "ellen", difficulty: "facil" },
  { pergunta: "Ellen White escreveu sobre saúde, educação e:", alternativas: ["Culinária internacional", "Vida cristã e profecia", "Astronomia", "Política"], correta: 1, area: "ellen", difficulty: "facil" },
  { pergunta: "Em qual estado americano Ellen White nasceu?", alternativas: ["Maine", "Michigan", "Texas", "Flórida"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Quem foi o esposo de Ellen G. White?", alternativas: ["James White", "John Andrews", "Joseph Bates", "Uriah Smith"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Em que ano Ellen White nasceu?", alternativas: ["1815", "1827", "1836", "1844"], correta: 1, area: "ellen", difficulty: "facil" },
  { pergunta: "Ellen White é reconhecida por defender um estilo de vida saudável, incluindo qual tipo de alimentação?", alternativas: ["Dieta vegetariana", "Dieta rica em carnes", "Jejum permanente", "Dieta sem restrições"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Quem foi o pregador que anunciou a volta de Cristo em 1844?", alternativas: ["William Miller", "James White", "Joseph Bates", "John Andrews"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Em que ano foi oficialmente organizada a Igreja Adventista do Sétimo Dia?", alternativas: ["1844", "1863", "1901", "1919"], correta: 1, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Como ficou conhecido o evento de 22 de outubro de 1844?", alternativas: ["Grande Despertar", "Grande Desapontamento", "Grande Reforma", "Grande Cisma"], correta: 1, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Quem foi esposo de Ellen G. White e também pioneiro adventista?", alternativas: ["James White", "John Andrews", "Joseph Bates", "Hiram Edson"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Joseph Bates é conhecido por defender qual doutrina entre os pioneiros?", alternativas: ["O batismo infantil", "A guarda do sábado", "O celibato", "O jejum obrigatório"], correta: 1, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Antes de se converter, Joseph Bates trabalhava como:", alternativas: ["Professor", "Capitão de navio", "Médico", "Advogado"], correta: 1, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Em que estado americano fica a cidade de Battle Creek, importante centro adventista no século 19?", alternativas: ["Michigan", "Ohio", "Nova York", "Indiana"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "O movimento que antecedeu a Igreja Adventista, liderado por William Miller, ficou conhecido como:", alternativas: ["Movimento Millerita", "Movimento Batista", "Movimento Metodista", "Movimento Puritano"], correta: 0, area: "pioneiros", difficulty: "facil" },

  // ---------- MÉDIO ----------
  { pergunta: "Qual profeta do Antigo Testamento interpretou o sonho da estátua de Nabucodonosor?", alternativas: ["Isaías", "Jeremias", "Daniel", "Ezequiel"], correta: 2, area: "biblia", difficulty: "medio" },
  { pergunta: "Segundo a Escola Sabatina, o santuário celestial é abordado principalmente em qual livro bíblico?", alternativas: ["Apocalipse", "Hebreus", "Levítico", "Romanos"], correta: 1, area: "biblia", difficulty: "medio" },
  { pergunta: "Na parábola do bom samaritano, quem foi ferido e deixado à beira do caminho?", alternativas: ["Um sacerdote", "Um levita", "Um viajante não identificado", "Um samaritano"], correta: 2, area: "biblia", difficulty: "medio" },
  { pergunta: "Qual é o tema central do livro 'O Desejado de Todas as Nações' de Ellen White?", alternativas: ["A vida de Paulo", "A vida de Cristo", "A história da igreja primitiva", "As profecias de Daniel"], correta: 1, area: "ellen", difficulty: "medio" },
  { pergunta: "Em que estado americano Ellen White teve sua primeira visão pública?", alternativas: ["Maine", "Michigan", "Massachusetts", "Nova York"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual livro de Ellen White trata principalmente de conselhos sobre alimentação e saúde?", alternativas: ["Educação", "Conselhos sobre o Regime Alimentar", "Caminho a Cristo", "Parábolas de Jesus"], correta: 1, area: "ellen", difficulty: "medio" },
  { pergunta: "Ellen White ajudou a fundar qual instituição de saúde adventista pioneira, nos Estados Unidos?", alternativas: ["Loma Linda University", "Sanatório de Battle Creek", "Hospital Adventista de Londres", "Clínica de Basileia"], correta: 1, area: "ellen", difficulty: "medio" },
  { pergunta: "Em que ano faleceu Ellen G. White?", alternativas: ["1905", "1915", "1922", "1930"], correta: 1, area: "ellen", difficulty: "medio" },
  { pergunta: "Ellen White teve papel importante na fundação de qual instituição educacional adventista na Austrália?", alternativas: ["Avondale College", "Sydney University", "Melbourne Adventist School", "Newcastle College"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual livro de Ellen White aborda especificamente o tema da vida familiar e do lar cristão?", alternativas: ["O Lar Adventista", "Profetas e Reis", "Atos dos Apóstolos", "Primeiros Escritos"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Hiram Edson teve um insight teológico importante em 1844 relacionado a que tema?", alternativas: ["O batismo por imersão", "O santuário celestial", "O dízimo", "A trindade"], correta: 1, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Qual pioneiro é associado à introdução da doutrina do santuário entre os adventistas?", alternativas: ["Joseph Bates", "Hiram Edson", "James White", "John Loughborough"], correta: 1, area: "pioneiros", difficulty: "medio" },
  { pergunta: "O movimento millerita recebeu esse nome por causa de quem?", alternativas: ["James White", "William Miller", "Ellen Harmon", "Joseph Bates"], correta: 1, area: "pioneiros", difficulty: "medio" },
  { pergunta: "John Nevins Andrews é reconhecido por ser o primeiro adventista enviado como:", alternativas: ["Editor de revista", "Missionário oficial ao exterior", "Presidente da denominação", "Médico missionário"], correta: 1, area: "pioneiros", difficulty: "medio" },
  { pergunta: "A revista 'Review and Herald' foi fundada por qual pioneiro?", alternativas: ["James White", "Joseph Bates", "Hiram Edson", "John Andrews"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Qual doutrina NÃO fazia parte das crenças centrais do movimento millerita original?", alternativas: ["A volta iminente de Cristo", "A interpretação profética de Daniel", "A guarda do sábado do sétimo dia", "O estudo das 2300 tardes e manhãs"], correta: 2, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Uriah Smith, pioneiro e editor adventista, é conhecido por seus comentários sobre quais livros proféticos?", alternativas: ["Salmos e Provérbios", "Daniel e Apocalipse", "Gênesis e Êxodo", "Isaías e Jeremias"], correta: 1, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Qual cidade de Michigan se tornou o primeiro grande centro administrativo e editorial da igreja adventista?", alternativas: ["Detroit", "Battle Creek", "Lansing", "Grand Rapids"], correta: 1, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Loma Linda, importante centro médico e educacional adventista, está localizado em qual estado americano?", alternativas: ["Califórnia", "Texas", "Flórida", "Oregon"], correta: 0, area: "pioneiros", difficulty: "medio" },

  // ---------- DIFÍCIL ----------
  { pergunta: "Em Daniel 8:14, qual é o período profético mencionado que os milleritas associaram a 1844?", alternativas: ["70 semanas", "1260 dias", "2300 tardes e manhãs", "42 meses"], correta: 2, area: "biblia", difficulty: "dificil" },
  { pergunta: "No livro de Hebreus, o santuário terrestre é descrito como figura de que realidade?", alternativas: ["O templo de Salomão", "O santuário celestial", "A Nova Jerusalém", "O tabernáculo de Davi"], correta: 1, area: "biblia", difficulty: "dificil" },
  { pergunta: "Qual é a ordem tradicional adventista das mensagens dos três anjos mencionados em Apocalipse 14?", alternativas: ["Juízo, queda de Babilônia, marca da besta", "Marca da besta, juízo, queda de Babilônia", "Queda de Babilônia, marca da besta, juízo", "Juízo, marca da besta, queda de Babilônia"], correta: 0, area: "biblia", difficulty: "dificil" },
  { pergunta: "Qual foi o nome de solteira de Ellen G. White?", alternativas: ["Ellen Harmon", "Ellen Bates", "Ellen Andrews", "Ellen Loughborough"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "Em qual obra Ellen White desenvolve o tema do 'grande conflito' entre Cristo e Satanás ao longo da história?", alternativas: ["Educação", "A série O Conflito dos Séculos", "Mensagens Escolhidas", "Testemunhos para a Igreja"], correta: 1, area: "ellen", difficulty: "dificil" },
  { pergunta: "Em que cidade fica o Elmshaven, última residência de Ellen White?", alternativas: ["Battle Creek, Michigan", "St. Helena, Califórnia", "Washington, D.C.", "Melbourne, Austrália"], correta: 1, area: "ellen", difficulty: "dificil" },
  { pergunta: "Ellen White viveu e trabalhou por vários anos em qual país durante uma missão internacional?", alternativas: ["Inglaterra", "Austrália", "Alemanha", "África do Sul"], correta: 1, area: "ellen", difficulty: "dificil" },
  { pergunta: "Qual pioneiro é apontado como o primeiro a aceitar tanto a doutrina do santuário quanto a guarda do sábado, unificando os dois temas centrais?", alternativas: ["Joseph Bates", "Hiram Edson", "James White", "Um esforço coletivo dos três"], correta: 3, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "Em que ano foi adotado oficialmente o nome 'Adventista do Sétimo Dia' pela denominação?", alternativas: ["1844", "1860", "1863", "1888"], correta: 1, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "A Conferência de Minneapolis em 1888 ficou marcada por debates teológicos sobre qual tema principal?", alternativas: ["O dízimo", "A justificação pela fé", "O batismo infantil", "A organização eclesiástica"], correta: 1, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "Qual pioneiro publicou o panfleto 'The Seventh-day Sabbath' (O Sábado do Sétimo Dia), influente na aceitação da doutrina?", alternativas: ["Joseph Bates", "James White", "John Andrews", "Uriah Smith"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "John Nevins Andrews foi enviado como missionário para qual país europeu em 1874?", alternativas: ["Alemanha", "Suíça", "França", "Itália"], correta: 1, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "Qual foi o primeiro periódico adventista publicado, precursor da Review and Herald?", alternativas: ["Present Truth", "The Great Controversy", "Signs of the Times", "The Youth's Instructor"], correta: 0, area: "pioneiros", difficulty: "dificil" },
];

// Bloco adicional de perguntas escritas à mão sobre Ellen G. White e
// Pioneiros Adventistas, criado para elevar o total de perguntas por nível
// a pelo menos 200 e melhorar o equilíbrio entre as três áreas do quiz
// (antes, "biblia" dominava por causa da geração estrutural automática).
// Mesma recomendação do topo do arquivo se aplica: revisão teológica/
// histórica antes de publicação ampla, especialmente no nível difícil.
const CURATED_EXTRA = [
  // ================= FÁCIL =================
  { pergunta: "Ellen G. White tinha uma irmã gêmea. Qual era o nome dela?", alternativas: ["Elizabeth", "Sarah", "Mary", "Caroline"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Com que idade Ellen White teve sua primeira visão?", alternativas: ["12 anos", "17 anos", "25 anos", "30 anos"], correta: 1, area: "ellen", difficulty: "facil" },
  { pergunta: "Qual livro de Ellen White é mais focado na conversão e na vida cristã pessoal?", alternativas: ["Caminho a Cristo", "Educação", "Profetas e Reis", "Atos dos Apóstolos"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Quantos filhos Ellen e James White tiveram?", alternativas: ["Dois", "Três", "Quatro", "Seis"], correta: 2, area: "ellen", difficulty: "facil" },
  { pergunta: "Ellen White é reconhecida pelos adventistas por ter recebido qual dom espiritual?", alternativas: ["O dom de línguas", "O dom de profecia", "O dom de cura", "O dom de milagres"], correta: 1, area: "ellen", difficulty: "facil" },
  { pergunta: "Ellen White escreveu bastante sobre qual tema, além de saúde e vida cristã?", alternativas: ["Educação", "Culinária internacional", "Astronomia", "Direito civil"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Qual é o nome do pai de Ellen White?", alternativas: ["Robert Harmon", "James Harmon", "John Harmon", "Samuel Harmon"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Em que periódico voltado a jovens Ellen White publicou muitos artigos?", alternativas: ["The Youth's Instructor", "Signs of the Times", "Review and Herald", "Present Truth"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Ellen White defendia um estilo de vida que evitava o uso de:", alternativas: ["Água", "Tabaco e álcool", "Roupas de algodão", "Livros seculares"], correta: 1, area: "ellen", difficulty: "facil" },
  { pergunta: "Qual destes NÃO é um livro escrito por Ellen G. White?", alternativas: ["O Grande Conflito", "Caminho a Cristo", "Daniel e Apocalipse", "Educação"], correta: 2, area: "ellen", difficulty: "facil" },
  { pergunta: "Ellen White é considerada, pelos adventistas, portadora de um dom profético em harmonia com qual livro?", alternativas: ["A Bíblia", "Um livro à parte da Bíblia", "Nenhum outro livro", "Livros seculares de história"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Em qual cidade dos EUA Ellen White faleceu?", alternativas: ["St. Helena, Califórnia", "Battle Creek, Michigan", "Washington, D.C.", "Boston, Massachusetts"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Ellen White é lembrada como uma das fundadoras de qual tipo de instituição adventista, além das de saúde?", alternativas: ["Escolas e faculdades", "Bancos", "Empresas de tecnologia", "Partidos políticos"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Quantos anos Ellen White viveu, aproximadamente?", alternativas: ["67 anos", "77 anos", "87 anos", "97 anos"], correta: 2, area: "ellen", difficulty: "facil" },
  { pergunta: "O sobrenome de Ellen White antes de se casar era:", alternativas: ["Harmon", "White", "Bates", "Andrews"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Quem foi o pregador batista que popularizou o estudo sobre a volta de Cristo por volta de 1843-1844?", alternativas: ["William Miller", "Joseph Bates", "James White", "Uriah Smith"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "William Miller trabalhava, antes de se tornar pregador, principalmente como:", alternativas: ["Fazendeiro", "Médico", "Advogado", "Marinheiro"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Quem foi o primeiro presidente da Associação Geral da Igreja Adventista do Sétimo Dia?", alternativas: ["James White", "John Byington", "Uriah Smith", "Joseph Bates"], correta: 1, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Qual pioneiro é conhecido por ter tido um insight sobre o santuário celestial num campo de milho?", alternativas: ["Hiram Edson", "Joseph Bates", "John Andrews", "James White"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Qual pioneiro escreveu um comentário muito conhecido sobre os livros de Daniel e Apocalipse?", alternativas: ["Uriah Smith", "Hiram Edson", "Joseph Bates", "John Byington"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Quem foi enviado como o primeiro missionário oficial da igreja para o exterior?", alternativas: ["John Nevins Andrews", "James White", "Joseph Bates", "Uriah Smith"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "John Harvey Kellogg ficou conhecido por dirigir qual tipo de instituição adventista?", alternativas: ["Um sanatório de saúde", "Uma editora", "Uma escola de teologia", "Um jornal secular"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "O nome 'Adventista do Sétimo Dia' faz referência direta à guarda de qual dia?", alternativas: ["Domingo", "Sábado", "Sexta-feira", "Segunda-feira"], correta: 1, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Qual foi o primeiro jornal/periódico publicado pelos pioneiros adventistas?", alternativas: ["The Present Truth", "Review and Herald", "Signs of the Times", "The Youth's Instructor"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "O movimento liderado por William Miller esperava a volta de Cristo em qual década?", alternativas: ["1820", "1830", "1840", "1850"], correta: 2, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Qual destes NÃO é considerado um pioneiro adventista do século 19?", alternativas: ["Joseph Bates", "James White", "Martin Luther", "Hiram Edson"], correta: 2, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Battle Creek, importante centro adventista do século 19, era conhecida por reunir qual tipo de instituições?", alternativas: ["Editora, sanatório e escola", "Apenas fazendas", "Apenas igrejas", "Apenas fábricas"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "O que os adventistas do sétimo dia esperavam com grande expectativa em 22 de outubro de 1844?", alternativas: ["A volta de Cristo", "O fim do mundo por guerra", "Um grande terremoto", "A eleição de um novo líder"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Joseph Bates, antes de se tornar pregador adventista, viajou o mundo trabalhando como:", alternativas: ["Capitão de navio", "Professor universitário", "Diplomata", "Fazendeiro"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Quem foi o esposo de Ellen White e também um importante organizador da igreja nascente?", alternativas: ["James White", "Uriah Smith", "Hiram Edson", "John Andrews"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "O período entre 1831 e 1844, quando William Miller pregava sobre a volta de Cristo, ficou conhecido como movimento:", alternativas: ["Millerita", "Adventista", "Sabatista", "Reformista"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Qual destes pioneiros é associado à defesa da doutrina da guarda do sábado entre os adventistas?", alternativas: ["Joseph Bates", "William Miller", "Charles Fitch", "Josiah Litch"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "A denominação Adventista do Sétimo Dia surgiu, historicamente, a partir de qual movimento religioso maior do século 19?", alternativas: ["O Movimento Millerita", "A Reforma Protestante", "O Grande Despertar de 1740", "O Movimento Puritano"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Qual pioneiro é lembrado por ajudar a fundar o periódico Review and Herald?", alternativas: ["James White", "Hiram Edson", "Uriah Smith", "John Byington"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Depois do Grande Desapontamento de 1844, os pioneiros passaram a estudar com mais profundidade qual tema profético?", alternativas: ["O santuário celestial", "O batismo infantil", "A trindade", "A organização política"], correta: 0, area: "pioneiros", difficulty: "facil" },

  { pergunta: "Qual foi o primeiro nome usado pelos seguidores de William Miller antes da denominação Adventista do Sétimo Dia existir?", alternativas: ["Milleritas", "Sabatistas", "Reformadores", "Puritanos"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "James White atuou como editor de qual periódico pioneiro da igreja?", alternativas: ["Review and Herald", "The New York Times", "Signs of the Times apenas", "Nenhum periódico"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Qual era a principal atividade profissional de Joseph Bates antes de se converter ao adventismo?", alternativas: ["Capitão de navio mercante", "Professor de teologia", "Fazendeiro de algodão", "Médico rural"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Hiram Edson é lembrado principalmente por sua contribuição para qual doutrina adventista?", alternativas: ["O santuário celestial", "O batismo por aspersão", "O celibato pastoral", "A guarda do domingo"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Uriah Smith dedicou grande parte de sua vida ao trabalho de:", alternativas: ["Edição e escrita de comentários bíblicos", "Medicina e cirurgia", "Diplomacia internacional", "Agricultura comercial"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Qual foi o destino missionário do primeiro missionário oficial da igreja, John Nevins Andrews?", alternativas: ["Suíça", "Brasil", "Japão", "Rússia"], correta: 0, area: "pioneiros", difficulty: "facil" },
  { pergunta: "Ellen G. White nasceu em qual estado dos Estados Unidos?", alternativas: ["Maine", "Michigan", "Texas", "Ohio"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Ellen White é lembrada como uma escritora extremamente produtiva, tendo publicado dezenas de:", alternativas: ["Livros", "Filmes", "Peças de teatro", "Álbuns musicais"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "O marido de Ellen White, James White, também era um importante:", alternativas: ["Pioneiro e organizador da igreja", "Rei", "General do exército", "Cientista nuclear"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Um dos temas centrais dos escritos de Ellen White é a segunda vinda de:", alternativas: ["Cristo", "Elias", "Moisés", "João Batista"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Ellen White incentivava fortemente a prática de qual hábito relacionado à saúde física?", alternativas: ["Exercício físico e ar livre", "Jejum permanente e isolamento", "Sedentarismo", "Uso moderado de tabaco"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Qual destas obras faz parte da série de livros de Ellen White sobre a história da salvação?", alternativas: ["O Grande Conflito", "Manual da Igreja", "Comentário Bíblico Adventista", "Enciclopédia Adventista"], correta: 0, area: "ellen", difficulty: "facil" },
  { pergunta: "Além de escritora, Ellen White é lembrada por sua atuação como:", alternativas: ["Palestrante e conselheira da igreja", "Cantora de ópera", "Cientista política", "Juíza"], correta: 0, area: "ellen", difficulty: "facil" },

  // ================= MÉDIO =================
  { pergunta: "Por quantos anos, aproximadamente, Ellen White morou na Austrália em missão internacional?", alternativas: ["3 anos", "5 anos", "9 anos", "15 anos"], correta: 2, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual é o nome da série de cinco livros de Ellen White que narra o grande conflito entre o bem e o mal ao longo da história?", alternativas: ["Série O Conflito dos Séculos", "Série Testemunhos", "Série Mensagens Escolhidas", "Série Fundamentos da Fé"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual livro de Ellen White trata principalmente do tema da educação cristã?", alternativas: ["Educação", "O Lar Adventista", "Primeiros Escritos", "Mensagens aos Jovens"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual instituição de ensino superior adventista Ellen White ajudou a estabelecer na Austrália?", alternativas: ["Avondale College", "Newbold College", "Pacific Union College", "Andrews University"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Ellen White incentivou fortemente a criação de qual instituição médica adventista no sul da Califórnia?", alternativas: ["Loma Linda", "Battle Creek Sanitarium", "St. Helena Hospital", "Florida Hospital"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual publicação de Ellen White reúne, em nove volumes, orientações e conselhos enviados à igreja ao longo de décadas?", alternativas: ["Testemunhos para a Igreja", "O Grande Conflito", "Patriarcas e Profetas", "Atos dos Apóstolos"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual livro de Ellen White aborda especificamente as parábolas contadas por Jesus?", alternativas: ["Parábolas de Jesus", "O Desejado de Todas as Nações", "Profetas e Reis", "Educação"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Em que região dos Estados Unidos Ellen White passou a maior parte da infância e juventude?", alternativas: ["Nova Inglaterra (nordeste)", "Sul profundo", "Meio-oeste", "Costa oeste"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual foi o nome do filho de Ellen White que se tornou um de seus principais colaboradores editoriais na vida adulta dela?", alternativas: ["William C. White", "Henry White", "John Herbert White", "Edson White"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Ellen White frequentemente descrevia seus próprios escritos como uma 'luz menor' que aponta para qual 'luz maior'?", alternativas: ["A Bíblia", "A tradição da igreja", "A ciência", "A razão humana"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual instituto de saúde, fundado com envolvimento de Ellen e James White em 1866, deu origem depois ao Battle Creek Sanitarium?", alternativas: ["Western Health Reform Institute", "Loma Linda Institute", "Adventist Health Center", "National Health Reform Society"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Em qual continente Ellen White realizou uma longa missão internacional entre o fim do século 19 e o início do 20?", alternativas: ["Oceania (Austrália)", "África", "Ásia", "América do Sul"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual acidente na infância teve grande impacto na saúde e na trajetória pessoal de Ellen White?", alternativas: ["Foi atingida por uma pedra no rosto", "Sofreu um afogamento", "Teve uma queda de cavalo", "Contraiu uma febre grave"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual pioneiro é considerado o primeiro presidente eleito da Associação Geral, em 1863?", alternativas: ["John Byington", "James White", "Uriah Smith", "Joseph Bates"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Em que país europeu John Nevins Andrews atuou como missionário a partir de 1874?", alternativas: ["Suíça", "Alemanha", "Itália", "Holanda"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Qual pregador millerita ficou conhecido por defender a mensagem de 'sair de Babilônia' e por seus mapas proféticos?", alternativas: ["Charles Fitch", "Samuel Snow", "Josiah Litch", "John Byington"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Qual pregador millerita é associado à proposta da data específica de 22 de outubro de 1844?", alternativas: ["Samuel Snow", "Charles Fitch", "Josiah Litch", "Hiram Edson"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "John Harvey Kellogg é lembrado, fora do contexto religioso, por ter ajudado a criar qual produto alimentício famoso?", alternativas: ["Flocos de milho (corn flakes)", "Pão integral", "Suco de uva", "Manteiga de amendoim"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Qual instituição educacional foi a primeira faculdade adventista, fundada em 1874, em Battle Creek?", alternativas: ["Battle Creek College", "Loma Linda University", "Andrews University", "Avondale College"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Depois de um incêndio destruir instalações importantes em Battle Creek em 1902, a sede administrativa da igreja foi transferida para qual cidade?", alternativas: ["Washington, D.C.", "Nova York", "Chicago", "Boston"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Quais dois pregadores ficaram conhecidos por defender a doutrina da justificação pela fé na Conferência de Minneapolis, em 1888?", alternativas: ["A. T. Jones e E. J. Waggoner", "James White e Joseph Bates", "Uriah Smith e Hiram Edson", "John Andrews e John Byington"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Qual pioneiro é lembrado por sua atuação como evangelista e missionário, ajudando a estabelecer a obra adventista na Austrália e depois na África do Sul?", alternativas: ["Stephen N. Haskell", "Uriah Smith", "Hiram Edson", "John Byington"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "O periódico Review and Herald, fundado em 1850, tinha originalmente qual nome mais completo?", alternativas: ["Second Advent Review and Sabbath Herald", "Signs of the Times", "The Present Truth", "Youth's Instructor"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Em que ano a igreja adotou oficialmente o modelo organizacional com Associação Geral, formalizando sua estrutura administrativa?", alternativas: ["1863", "1844", "1874", "1901"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Uriah Smith, além de editor, era conhecido por ter desenvolvido pessoalmente qual dispositivo, após perder parte de uma perna na infância?", alternativas: ["Uma perna mecânica (prótese)", "Uma cadeira de rodas", "Um relógio de precisão", "Uma bicicleta adaptada"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "O periódico voltado a jovens adventistas, fundado em 1852, se chamava:", alternativas: ["The Youth's Instructor", "Signs of the Times", "Liberty Magazine", "Message Magazine"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Qual pregador millerita interpretou eventos ligados ao Império Otomano em 1840 como cumprimento profético, aumentando a credibilidade do movimento?", alternativas: ["Josiah Litch", "Charles Fitch", "Samuel Snow", "William Miller"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Além de pregador, William Miller também serviu como oficial do exército americano em qual conflito?", alternativas: ["Guerra de 1812", "Guerra Civil Americana", "Guerra Hispano-Americana", "Guerra da Independência"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Qual foi o principal motivo teológico por trás da separação entre John Harvey Kellogg e a liderança da igreja no início do século 20?", alternativas: ["Divergências sobre panteísmo", "Discordância sobre o sábado", "Disputa sobre o dízimo", "Diferença sobre o batismo"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Hiram Edson teve seu insight sobre o santuário celestial no dia seguinte a qual evento?", alternativas: ["O Grande Desapontamento", "A organização da Associação Geral", "A primeira visão de Ellen White", "A fundação do Battle Creek College"], correta: 0, area: "pioneiros", difficulty: "medio" },

  { pergunta: "Qual pioneiro assumiu papel de destaque na criação da estrutura de 'conferências' (associações) regionais da igreja, ainda no século 19?", alternativas: ["James White", "Ellen White", "Uriah Smith", "Hiram Edson"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "A doutrina do santuário celestial, central na identidade adventista, foi desenvolvida principalmente a partir da reflexão de quais pioneiros após 1844?", alternativas: ["Hiram Edson, Joseph Bates e James White", "William Miller e Charles Fitch", "John Harvey Kellogg e A. T. Jones", "Uriah Smith e John Byington apenas"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "O periódico 'Signs of the Times', voltado à evangelização, foi lançado nos Estados Unidos com forte influência de qual pioneiro?", alternativas: ["James White", "Hiram Edson", "John Byington", "Uriah Smith"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "A Conferência Geral de 1888, em Minneapolis, é lembrada até hoje principalmente por causa de debates sobre:", alternativas: ["A justificação pela fé e a lei", "A organização financeira da igreja", "A tradução da Bíblia", "A arquitetura dos templos"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Qual foi o papel de John Byington antes de se tornar o primeiro presidente da Associação Geral?", alternativas: ["Pastor e fazendeiro envolvido no abolicionismo", "Médico cirurgião", "Capitão de navio", "Professor universitário"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Qual pioneiro é associado à publicação de um dos primeiros hinários usados pelos adventistas sabatistas?", alternativas: ["James White", "Hiram Edson", "Uriah Smith", "John Andrews"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "O 'Grande Desapontamento' gerou, entre os antigos milleritas, diferentes reações. Qual grupo deu origem, com o tempo, aos Adventistas do Sétimo Dia?", alternativas: ["Os sabatistas que aceitaram a doutrina do santuário", "Os que abandonaram totalmente a fé cristã", "Os que se tornaram católicos", "Os que fundaram a Igreja Metodista"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Ellen White frequentemente recomendava, em seus escritos sobre saúde, a substituição da carne por qual tipo de alimentação?", alternativas: ["Alimentação à base de vegetais, grãos e frutas", "Alimentação exclusivamente líquida", "Jejum contínuo sem exceções", "Alimentação rica em açúcar refinado"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual foi um dos principais focos da correspondência de Ellen White com a liderança da igreja ao longo da vida?", alternativas: ["Conselhos administrativos e espirituais para a igreja", "Assuntos exclusivamente de política externa", "Investimentos financeiros pessoais", "Crítica literária de romances seculares"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "O livro 'Mensagens aos Jovens', de Ellen White, reúne orientações voltadas principalmente para:", alternativas: ["Adolescentes e jovens adultos", "Pastores aposentados", "Líderes de governo", "Empresários"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Em seus escritos, Ellen White associava a reforma de saúde a qual propósito espiritual maior?", alternativas: ["Preparar corpo e mente para servir a Deus", "Obter longevidade sem nenhum propósito espiritual", "Ganhar competições esportivas", "Impressionar outras denominações"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual foi um dos papéis de Ellen White na fundação de instituições de saúde fora dos Estados Unidos?", alternativas: ["Incentivar a criação de sanatórios em outros países", "Ela nunca se envolveu com instituições fora dos EUA", "Financiar diretamente todos os hospitais do mundo", "Atuar como médica formada em cada instituição"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual foi o principal argumento teológico usado pelos pioneiros para explicar por que a volta de Cristo não ocorreu em outubro de 1844, mesmo com o cálculo profético estando correto?", alternativas: ["O evento profetizado ocorreu no santuário celestial, não na Terra", "Os cálculos estavam totalmente errados desde o início", "A data correta seria 1850", "Não houve nenhuma explicação teológica"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Além de pregador, Joseph Bates também teve papel relevante ao promover, entre os primeiros sabatistas, a prática de:", alternativas: ["Reuniões regulares de estudo bíblico e oração", "Isolamento total das demais igrejas cristãs", "Celibato obrigatório para todos os membros", "Silêncio absoluto durante os cultos"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "O trabalho de tradução e adaptação de literatura adventista para outros idiomas, ainda no século 19, teve forte impulso a partir de qual missão pioneira?", alternativas: ["A missão de John Andrews na Europa", "A missão de Ellen White na América do Sul", "A missão de Uriah Smith na Ásia", "A missão de John Byington na África"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Qual pioneiro é lembrado por ter ajudado a formalizar o sistema de dízimo sistemático (Systematic Benevolence) entre os primeiros adventistas?", alternativas: ["James White", "Hiram Edson", "John Byington", "Uriah Smith"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Depois do Grande Desapontamento, qual foi um dos maiores desafios enfrentados pelos poucos milleritas que continuaram na fé?", alternativas: ["Reorganizar a compreensão teológica sobre a profecia", "Encontrar uma nova data exata sem qualquer estudo", "Abandonar totalmente qualquer crença profética", "Unir-se imediatamente à Igreja Católica"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Ellen White apoiou a expansão da obra publicadora adventista para fora dos Estados Unidos, incluindo a criação de editoras em qual continente, ainda no século 19?", alternativas: ["Europa", "Antártida", "América do Sul", "Nenhum continente além dos EUA"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Um dos objetivos centrais dos escritos pedagógicos de Ellen White era integrar o desenvolvimento intelectual dos estudantes com qual outra dimensão?", alternativas: ["A dimensão física e espiritual", "Apenas a dimensão esportiva", "Apenas a dimensão artística", "Apenas a dimensão tecnológica"], correta: 0, area: "ellen", difficulty: "medio" },
  { pergunta: "Qual pioneiro é lembrado por ter atuado como missionário médico, unindo evangelismo e cuidados de saúde em regiões pouco alcançadas?", alternativas: ["John Harvey Kellogg, em suas primeiras décadas de atuação", "William Miller", "Charles Fitch", "Josiah Litch"], correta: 0, area: "pioneiros", difficulty: "medio" },
  { pergunta: "Qual foi um dos temas recorrentes nos artigos de Ellen White publicados na revista Review and Herald ao longo de décadas?", alternativas: ["Orientação espiritual e conselhos práticos à igreja", "Crítica de filmes e entretenimento moderno", "Análises de mercado financeiro", "Receitas de doces açucarados"], correta: 0, area: "ellen", difficulty: "medio" },

  // ================= DIFÍCIL =================
  { pergunta: "Qual era o nome da mãe de Ellen G. White?", alternativas: ["Eunice Harmon", "Sarah Harmon", "Mary Harmon", "Betsey Harmon"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "Quantos filhos homens Ellen e James White tiveram ao todo, contando os que morreram ainda crianças?", alternativas: ["Quatro", "Dois", "Três", "Cinco"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "Qual filho de Ellen White faleceu ainda bebê?", alternativas: ["John Herbert White", "William C. White", "Henry White", "Edson White"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "Em que cidade da Nova Inglaterra Ellen G. White nasceu?", alternativas: ["Gorham, Maine", "Portland, Maine", "Boston, Massachusetts", "Concord, New Hampshire"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "Qual figura religiosa é comumente citada como quem incentivou a construção da associação entre saúde e fé que resultaria na Escola de Evangelistas Médicos de Loma Linda, fundada em 1909?", alternativas: ["Ellen G. White", "John Byington", "Uriah Smith", "James White"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "O Battle Creek Sanitarium, ligado à obra de Ellen White, foi consumido por um incêndio em que ano, décadas após sua fundação?", alternativas: ["1902", "1888", "1915", "1863"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "Qual é o título completo, em português, do volume da série O Conflito dos Séculos que trata da vida de Cristo?", alternativas: ["O Desejado de Todas as Nações", "Patriarcas e Profetas", "Profetas e Reis", "Atos dos Apóstolos"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "Qual volume da série O Conflito dos Séculos aborda a história do povo de Israel, do Éden até os reis do Antigo Testamento?", alternativas: ["Patriarcas e Profetas e Profetas e Reis", "O Grande Conflito", "O Desejado de Todas as Nações", "Atos dos Apóstolos"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "Aproximadamente quantos artigos Ellen White publicou ao longo da vida em periódicos adventistas, segundo estimativas comuns?", alternativas: ["Cerca de 5 mil", "Cerca de 500", "Cerca de 50 mil", "Cerca de 200"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "Em que cemitério Ellen White foi sepultada, ao lado de James White?", alternativas: ["Oak Hill Cemetery, Battle Creek", "Elmshaven Cemetery, Califórnia", "Arlington National Cemetery", "Mount Auburn Cemetery"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "Qual publicação de Ellen White é composta majoritariamente de suas primeiras experiências e visões, sendo um dos seus primeiros livros?", alternativas: ["Primeiros Escritos", "Mensagens Escolhidas", "Testemunhos para a Igreja", "Educação"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "Ellen White retornou dos Estados Unidos para a Austrália em que década de sua vida, iniciando ali um trabalho missionário duradouro?", alternativas: ["Na década de 1890", "Na década de 1850", "Na década de 1870", "Na década de 1900"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "Qual órgão do corpo foi diretamente afetado no acidente de infância de Ellen White, causado por uma pedra atirada por uma colega?", alternativas: ["O nariz e a face", "A perna", "O braço", "A visão de um olho apenas, sem lesão facial"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "Qual livro de Ellen White é dedicado especificamente a orientações sobre saúde física e cura natural?", alternativas: ["A Ciência do Bom Viver (Ministry of Healing)", "O Lar Adventista", "Educação", "Mensagens aos Jovens"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "Em qual estado dos EUA fica a propriedade rural chamada Elmshaven, onde Ellen White viveu seus últimos anos?", alternativas: ["Califórnia", "Michigan", "Nova York", "Maine"], correta: 0, area: "ellen", difficulty: "dificil" },
  { pergunta: "O panfleto 'The Seventh-day Sabbath, a Perpetual Sign', de 1846, influente na aceitação da doutrina do sábado, foi escrito por qual pioneiro?", alternativas: ["Joseph Bates", "James White", "John Andrews", "Uriah Smith"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "Qual pregador millerita ficou conhecido por interpretar a queda do Império Otomano, em agosto de 1840, como cumprimento de uma profecia?", alternativas: ["Josiah Litch", "Samuel Snow", "Charles Fitch", "John Byington"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "Em que cidade do estado de Nova York Hiram Edson teve o insight sobre o santuário celestial, em outubro de 1844?", alternativas: ["Port Gibson", "Rochester", "Albany", "Syracuse"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "Antes de se tornar Adventista do Sétimo Dia, John Byington atuou como pastor em qual denominação?", alternativas: ["Metodista", "Batista", "Presbiteriana", "Luterana"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "Qual foi o ano de nascimento de James White, esposo de Ellen White e organizador da denominação?", alternativas: ["1821", "1815", "1830", "1841"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "John Nevins Andrews é autor de uma obra de referência histórica sobre qual tema, além de seu trabalho missionário?", alternativas: ["A história do sábado (History of the Sabbath)", "A história da Reforma Protestante", "A história do cristianismo primitivo", "A história do cânon bíblico"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "Em que ano faleceu John Nevins Andrews, ainda em missão na Suíça?", alternativas: ["1883", "1874", "1863", "1901"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "A Escola de Evangelistas Médicos, precursora da Universidade de Loma Linda, foi fundada em que ano?", alternativas: ["1909", "1874", "1863", "1902"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "Qual foi o desfecho da relação entre John Harvey Kellogg e a Igreja Adventista, após a controvérsia teológica do início do século 20?", alternativas: ["Ele foi desligado (excluído) da igreja", "Ele se tornou presidente da Associação Geral", "Ele fundou uma nova denominação adventista oficial", "Nada mudou em sua relação com a igreja"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "A. T. Jones e E. J. Waggoner, associados à mensagem de 1888, atuavam principalmente como:", alternativas: ["Editores e pregadores", "Médicos missionários", "Capitães de navio", "Professores de música"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "Qual era a ocupação de Charles Fitch antes de se tornar um dos principais pregadores milleritas?", alternativas: ["Pastor congregacional/presbiteriano", "Capitão de navio", "Médico", "Fazendeiro"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "Stephen N. Haskell, além da Austrália, ajudou a estabelecer a obra adventista pioneira em qual outro continente?", alternativas: ["África (África do Sul)", "América do Sul", "Ásia Central", "Oceania apenas"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "O 'movimento do sétimo mês', que apontou especificamente para 22 de outubro de 1844, foi impulsionado principalmente por qual pregador?", alternativas: ["Samuel Snow", "Josiah Litch", "Charles Fitch", "Joseph Bates"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "Depois do Grande Desapontamento, qual pequeno grupo de crentes se reuniu para reinterpretar o evento como cumprido no santuário celestial, e não na Terra?", alternativas: ["Os adventistas sabatistas ligados a Edson, Bates e os White", "Os seguidores diretos de William Miller sem mudanças", "Um grupo liderado por John Harvey Kellogg", "Os fundadores da Igreja Metodista"], correta: 0, area: "pioneiros", difficulty: "dificil" },
  { pergunta: "Qual estrutura editorial os pioneiros criaram em 1861 para formalizar a publicação de literatura adventista?", alternativas: ["A Associação Publicadora Adventista (Seventh-day Adventist Publishing Association)", "A Associação Geral", "O Battle Creek College", "O Battle Creek Sanitarium"], correta: 0, area: "pioneiros", difficulty: "dificil" },
];

const GENERATED = generateBibleStructureQuestions();
const ALL_QUESTIONS = [...GENERATED, ...CURATED, ...CURATED_EXTRA];

export const QUESTION_BANK = {
  facil: ALL_QUESTIONS.filter((q) => q.difficulty === "facil"),
  medio: ALL_QUESTIONS.filter((q) => q.difficulty === "medio"),
  dificil: ALL_QUESTIONS.filter((q) => q.difficulty === "dificil"),
};

// Sorteia `count` perguntas de uma dificuldade, sempre buscando um mix
// equilibrado entre as três áreas (bíblia, Ellen White, pioneiros),
// independente de o banco ter mais perguntas de uma área que de outra.
export function pickRandomQuestions(difficulty, count = 10) {
  const pool = QUESTION_BANK[difficulty] || [];
  const areas = ["biblia", "ellen", "pioneiros"];
  const perArea = Math.ceil(count / areas.length);

  let picked = [];
  areas.forEach((area) => {
    const areaPool = shuffleArr(pool.filter((q) => q.area === area));
    picked.push(...areaPool.slice(0, perArea));
  });

  picked = shuffleArr(picked).slice(0, count);

  if (picked.length < count) {
    const pickedSet = new Set(picked);
    const remaining = shuffleArr(pool.filter((q) => !pickedSet.has(q)));
    picked = picked.concat(remaining).slice(0, count);
  }

  return picked;
}
