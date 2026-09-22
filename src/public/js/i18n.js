/**
 * SatorX i18n — Português (Brasil) e English.
 * Persistência: localStorage["satorx_lang"]
 */
(function (global) {
  var LS_KEY = "satorx_lang";
  var DEFAULT_LANG = "pt-BR";
  var SUPPORTED = { "pt-BR": true, en: true };

  var FLAG_EN =
    '<svg viewBox="0 0 28 20" aria-hidden="true"><rect width="28" height="20" fill="#bf0a30"/>' +
    '<rect y="1.54" width="28" height="1.54" fill="#fff"/><rect y="4.62" width="28" height="1.54" fill="#fff"/>' +
    '<rect y="7.69" width="28" height="1.54" fill="#fff"/><rect y="10.77" width="28" height="1.54" fill="#fff"/>' +
    '<rect y="13.85" width="28" height="1.54" fill="#fff"/><rect y="16.92" width="28" height="1.54" fill="#fff"/>' +
    '<rect width="11.2" height="10.77" fill="#002868"/>' +
    '<g fill="#fff"><circle cx="1.4" cy="1.2" r=".45"/><circle cx="3.6" cy="1.2" r=".45"/><circle cx="5.8" cy="1.2" r=".45"/>' +
    '<circle cx="8" cy="1.2" r=".45"/><circle cx="10" cy="1.2" r=".45"/><circle cx="2.5" cy="2.6" r=".45"/>' +
    '<circle cx="4.7" cy="2.6" r=".45"/><circle cx="6.9" cy="2.6" r=".45"/><circle cx="9.1" cy="2.6" r=".45"/>' +
    '<circle cx="1.4" cy="4" r=".45"/><circle cx="3.6" cy="4" r=".45"/><circle cx="5.8" cy="4" r=".45"/>' +
    '<circle cx="8" cy="4" r=".45"/><circle cx="10" cy="4" r=".45"/><circle cx="2.5" cy="5.4" r=".45"/>' +
    '<circle cx="4.7" cy="5.4" r=".45"/><circle cx="6.9" cy="5.4" r=".45"/><circle cx="9.1" cy="5.4" r=".45"/>' +
    '<circle cx="1.4" cy="6.8" r=".45"/><circle cx="3.6" cy="6.8" r=".45"/><circle cx="5.8" cy="6.8" r=".45"/>' +
    '<circle cx="8" cy="6.8" r=".45"/><circle cx="10" cy="6.8" r=".45"/><circle cx="2.5" cy="8.2" r=".45"/>' +
    '<circle cx="4.7" cy="8.2" r=".45"/><circle cx="6.9" cy="8.2" r=".45"/><circle cx="9.1" cy="8.2" r=".45"/>' +
    '<circle cx="1.4" cy="9.6" r=".45"/><circle cx="3.6" cy="9.6" r=".45"/><circle cx="5.8" cy="9.6" r=".45"/>' +
    '<circle cx="8" cy="9.6" r=".45"/><circle cx="10" cy="9.6" r=".45"/></g></svg>';

  var FLAG_BR =
    '<svg viewBox="0 0 28 20" aria-hidden="true"><rect width="28" height="20" rx="1" fill="#009b3a"/>' +
    '<polygon points="14,2.2 25.4,10 14,17.8 2.6,10" fill="#fedf00"/>' +
    '<circle cx="14" cy="10" r="4.15" fill="#002776"/>' +
    '<path d="M10.2 10.7c1.4-1.1 3.3-1.5 5.5-.9" fill="none" stroke="#fff" stroke-width=".7"/></svg>';

  var D = {
    "pt-BR": {
      "lang.en": "English",
      "lang.pt": "Português (Brasil)",
      "lang.group": "Idioma",

      "meta.home.title": "SatorX Chess Engine — Xadrez Inteligente e Avaliação ExagonX-AI",
      "meta.home.desc": "Motor de xadrez 8x8 Sator: heurísticas híbridas, rede de valor e vista 3D Three.js.",
      "meta.home.twitter": "Motor de IA Avançada de Xadrez: heurísticas híbridas, rede de valor e vista 3D Three.js.",
      "meta.2d.title": "Sator Engine — Tabuleiro 2D e aprendizado profundo",
      "meta.2d.desc": "Tabuleiro 2D Sator com motor de xadrez e análise por API.",
      "meta.3d.title": "Sator Engine — Vista 3D",
      "meta.3d.desc": "Partida de xadrez 3D com motor Sator Engine e IA híbrida.",
      "meta.ranking.title": "Ranking — salas online | SatorX",
      "meta.matches.title": "Registro de partidas | SatorX",
      "meta.offline.title": "Offline — Sator Engine",

      "menu.aria": "Menu principal",
      "menu.start": "▶  Iniciar Partida",
      "menu.online": "Jogar Online (Lobby)",
      "menu.ranking": "Ranking — salas online",
      "menu.matches": "Ranking",
      "menu.rules": "Regras do Xadrez",
      "menu.options": "Configurações",
      "menu.ia": "IA & Rede Neural",
      "menu.footer": "Sator Ngx v5  ·  Motor híbrido",
      "alt.piece": "Quadrado Sator",
      "alt.logo": "Sator Ngx v5",

      "common.close": "Fechar",
      "common.menu": "← Menu",
      "common.menuHome": "← Menu inicial",
      "common.refresh": "Atualizar",
      "common.loading": "Carregando…",
      "common.you": "Você",
      "common.opponent": "Oponente",
      "common.white": "Brancas",
      "common.black": "Pretas",
      "common.draw": "Empate",
      "common.nd": "N/D",
      "common.cancel": "Cancelar",
      "common.engine": "Motor Sator",
      "common.na": "—",

      "rules.title": "Regras do Xadrez",
      "rules.introBefore": "O xadrez é jogado em um tabuleiro 8×8 por dois jogadores. O objetivo é dar ",
      "rules.checkmate": "xeque-mate",
      "rules.introAfter": " ao rei adversário.",
      "rules.king": "Rei",
      "rules.kingDesc": ": move-se uma casa em qualquer direção.",
      "rules.queen": "Dama",
      "rules.queenDesc": ": move-se qualquer número de casas em linha reta ou diagonal.",
      "rules.rook": "Torre",
      "rules.rookDesc": ": move-se em linha reta (horizontal ou vertical).",
      "rules.bishop": "Bispo",
      "rules.bishopDesc": ": move-se na diagonal.",
      "rules.knight": "Cavalo",
      "rules.knightDesc": ": move-se em “L” (2+1 casas), único que salta peças.",
      "rules.pawn": "Peão",
      "rules.pawnDesc": ": avança uma casa (ou duas no primeiro lance), captura na diagonal.",
      "rules.specialBefore": "Lances especiais: ",
      "rules.castling": "roque",
      "rules.specialMid1": ", ",
      "rules.enpassant": "en passant",
      "rules.specialMid2": " (captura em passagem) e ",
      "rules.promotion": "promoção",
      "rules.specialAfter": " (peão na última fileira).",
      "rules.hover": "Passe o mouse ou toque/clique num termo",
      "rules.demo.king": "Rei — até 8 casas vizinhas",
      "rules.demo.queen": "Dama — linhas e diagonais",
      "rules.demo.rook": "Torre — fileiras e colunas",
      "rules.demo.bishop": "Bispo — só diagonais",
      "rules.demo.knight": "Cavalo — salto em L",
      "rules.demo.pawn": "Peão — avanço e captura",
      "rules.demo.castling": "Roque — rei e torre juntos",
      "rules.demo.enpassant": "En passant — captura lateral",
      "rules.demo.promotion": "Promoção — peão vira dama",
      "rules.demo.checkmate": "Xeque-mate — rei sem escape",

      "options.title": "Configurações",
      "options.p1": "As configurações de profundidade de busca, tempo por lance, modo de jogo e visão de câmera estão disponíveis diretamente no painel lateral da <strong>Vista 3D</strong>.",
      "options.p2": "Acesse <a href=\"/chess3d.html\">Vista 3D</a> ou <a href=\"/board2d.html\">Tabuleiro 2D</a> para ajustar as opções em tempo real durante a partida.",

      "ia.title": "IA & Rede Neural",
      "ia.statusTitle": "Estado Atual da IA",
      "ia.connecting": "A ligar ao Sator Engine...",
      "ia.updates": "Updates de Treino:",
      "ia.tdError": "Último Erro (TD-λ):",
      "ia.elo": "Média de Ranking (Elo):",
      "ia.eloRef": "(Referência inicial)",
      "ia.eloEst": "(estimado pela rede)",
      "ia.calcTitle": "Como são feitos os cálculos",
      "ia.calc1": "O <strong>Sator Engine</strong> combina busca clássica (minimax + alpha-beta) com uma rede de valor treinada por <em>aprendizado por diferença temporal</em> (TD-λ).",
      "ia.calc2": "A avaliação utiliza uma <strong>curva logística (Sigmoid)</strong> que converte a saída linear da rede neural (V) numa probabilidade de vitória e Elo estimado. Além disso, usa heurísticas híbridas e <strong>Geometria Sagrada</strong> (Quadrado SATOR) para analisar simetria e conectividade.",
      "ia.tdOnline": "TD online",
      "ia.tdOnlineDesc": ": a rede aprende em tempo real durante as partidas.",
      "ia.replay": "Buffer de replay",
      "ia.replayDesc": ": partidas salvas para treino supervisionado.",
      "ia.mastersTitle": "Modelos Base (Mestres)",
      "ia.mastersIntro": "Durante o aprendizado contínuo, a IA simula partidas baseadas no estilo destes mestres, absorvendo os seus padrões táticos e posicionais:",
      "ia.kas.meta": "(Rússia, 63 anos, Elo FIDE 2812 inativo — pico 2851, n.º 1 mundial)",
      "ia.kas.bio": "Garry Kimovich Kasparov nasceu em Baku a 13 de abril de 1963. Campeão Mundial de 1985 a 2000, foi o n.º 1 do ranking durante 255 meses e retirou-se da competição regular em 2005 ainda no topo. O seu Elo de pico (2851, em 1999) foi recorde mundial até 2013.",
      "ia.kas1": "Ataque dinâmico e luta pela iniciativa em todas as fases",
      "ia.kas2": "Preparação profunda de aberturas e variantes agressivas",
      "ia.kas3": "Cálculo tático, sacrifícios posicionais e pressão psicológica",
      "ia.kas4": "Repertório: Ruy López, Siciliana Najdorf, Escocesa, Gambito da Dama, Inglesa, Índia do Rei (Sämisch) e Grünfeld",
      "ia.car.meta": "(Noruega, 35 anos, Elo FIDE 2823 — 1.º do mundo, pico 2882)",
      "ia.car.bio": "Sven Magnus Øen Carlsen nasceu em Tønsberg a 30 de novembro de 1990. Cinco vezes campeão mundial clássico (2013–2023), lidera o ranking FIDE desde 2011 e detém o recorde de Elo da história (2882). Também acumula títulos mundiais de rápido, blitz e Freestyle.",
      "ia.car1": "Estilo universal e pragmático: posições jogáveis, pouco teóricas",
      "ia.car2": "Técnica de finais e conversão paciente de vantagens mínimas",
      "ia.car3": "Versatilidade de aberturas para evitar preparação estreita",
      "ia.car4": "Repertório: Ruy López (Berlim), Catalã, Siciliana Dragão, Inglesa simétrica, Sistema London, Italiana e Caro-Kann",
      "ia.pol.meta": "(Hungria, 50 anos, Elo FIDE 2675 inativo — pico 2735, 8.ª do mundo)",
      "ia.pol.bio": "Judit Polgár nasceu em Budapeste a 23 de julho de 1976. É a única mulher a entrar no top 10 mundial e a ultrapassar 2700 Elo. Tornou-se Grande Mestre aos 15 anos, recusou o circuito feminino e enfrentou a elite masculina até se retirar da competição em 2014.",
      "ia.pol1": "Xadrez de ataque e tática: complicações e posições desequilibradas",
      "ia.pol2": "1.e4 agressivo com brancas; defesas dinâmicas com pretas",
      "ia.pol3": "Luta constante — evita simplificações que cedem a iniciativa",
      "ia.pol4": "Repertório: Siciliana, Italiana, Índia do Rei, Francesa, Gambito do Rei, Ruy López e Ataque Austríaco (Pirc)",
      "ia.bel.meta": "(França, 32 anos, Elo FIDE 2237 — pico 2364)",
      "ia.bel.bio": "Dina Vadimovna Belenkaya nasceu em São Petersburgo a 22 de dezembro de 1993. Quatro vezes campeã feminina de São Petersburgo e participante da Copa do Mundo Feminina de 2021. Representou a Rússia até 2022, Israel entre 2022 e 2026, e a França desde 2026. Também é comentarista e criadora de conteúdo de xadrez.",
      "ia.bel1": "Ataque prático: complicar a posição e forçar erros sob pressão",
      "ia.bel2": "1.e4 agressivo — Italiana, Escocesa e gambitos de iniciativa",
      "ia.bel3": "Defesas dinâmicas com pretas e ritmo de blitz no relógio",
      "ia.bel4": "Repertório: Italiana, Escocesa, Gambito Evans, Siciliana Dragão, Francesa Winawer, Índia do Rei e Escandinava",
      "ia.loadError": "Erro ao carregar os dados da IA.",

      "chooser.title": "Nova partida",
      "chooser.body": "Escolha a vista. A partida fica sincronizada: pode continuar no 2D ou no 3D no ponto exacto, com o mesmo histórico e relógio.",
      "chooser.2d": "Tabuleiro 2D",
      "chooser.3d": "Tabuleiro 3D",

      "board2d.badge": "Aprendizado profundo",
      "board2d.continue3d": "Continuar em 3D",
      "board2d.lead": "Vista 2D com setas de lance, histórico na lateral e relógio. Auto-clique troca o tempo ao jogar; desligue para mover e só depois pausar / passar o relógio.",
      "board2d.autoClick": "Auto-clique",
      "board2d.pause": "Pausar",
      "board2d.resume": "Continuar",
      "board2d.pressClock": "Passar relógio",
      "board2d.clockHint": "O relógio começa no primeiro lance. Auto-clique troca o lado automaticamente.",
      "board2d.history": "Histórico de jogadas",
      "board2d.engineNoMoves": "O motor ainda não jogou nesta partida.",
      "board2d.thoughtTitle": "Pensamento do motor",
      "board2d.thoughtAria": "Log de pensamento do motor",
      "board2d.masterBanner": "Motor usando estratégia do Mestre",
      "thought.master": "Mestre:",
      "thought.why": "Porquê:",
      "thought.phase": "Fase:",
      "thought.squares": "Casas:",
      "thought.piece": "Peça:",
      "thought.type": "Tipo:",
      "thought.oppMove": "Lance do adversário:",
      "thought.noPrev": "início / sem lance anterior",
      "board2d.noMoves": "Nenhum lance ainda.",
      "board2d.legendAria": "Legenda das setas",
      "board2d.lastMove": "Último lance",
      "board2d.quiet": "Lance simples",
      "board2d.capture": "Captura",
      "board2d.castle": "Roque",
      "board2d.ep": "En passant",
      "board2d.double": "Avanço duplo",
      "board2d.promo": "Promoção",
      "board2d.selected": "Selecionada",
      "board2d.new": "Novo jogo",
      "board2d.undo": "Desfazer",
      "board2d.analyze": "Analisar",
      "board2d.save": "Salvar replay",
      "board2d.list": "Listar replays",
      "board2d.mode": "Modo",
      "board2d.modeEngine": "Contra o motor (minimax)",
      "board2d.modeHuman": "Humano vs humano",
      "board2d.modeMp": "Multiplayer Online",
      "board2d.yourColor": "Sua cor (vs motor)",
      "board2d.whiteStart": "Brancas (começam)",
      "board2d.blackEngine": "Pretas (motor abre)",
      "board2d.lobbyTitle": "Lobby — mesma API que a vista 3D (senha, WebSocket, espectadores)",
      "board2d.yourName": "Seu nome",
      "board2d.oppName": "Oponente esperado (opcional)",
      "board2d.roomPass": "Senha da sala (criar, opcional)",
      "board2d.maxSpec": "Máx. espectadores",
      "board2d.create": "Criar Sala",
      "board2d.join": "Entrar (jogador)",
      "board2d.spectate": "Assistir (cima)",
      "board2d.claimW": "Ocupar brancas",
      "board2d.claimB": "Ocupar pretas",
      "board2d.connIdle": "Canal: — · Vista plana de cima como espectador",
      "board2d.trainTd": "Aprendizado TD a cada lance (rede de valor)",
      "board2d.engineTune": "Profundidade e tempo do motor",
      "board2d.engineHelp": "<strong>Profundidade</strong>: quantas meia-jogadas (plies) o motor analisa à frente. <strong>Tempo (ms)</strong>: limite máximo de reflexão por lance.",
      "board2d.depth": "Profundidade",
      "board2d.timeMs": "Tempo motor (ms)",
      "board2d.state": "Estado da partida",
      "board2d.lastEngine": "Último lance do motor",
      "board2d.report": "Relatório (Tabula + métricas)",
      "board2d.book": "Livro e busca (SatorX + Lichess)",
      "board2d.bookLine": "Livro da posição: —",
      "board2d.searchPh": "Buscar partidas (e4, kasparov, draw…)",
      "board2d.search": "Buscar",
      "board2d.replays": "Replays",
      "board2d.fen": "FEN",
      "board2d.dlTitle": "Do tabuleiro ao aprendizado profundo",
      "board2d.dl1": "Em motores como o AlphaZero, a <strong>rede neural</strong> não “vê” madeira: recebe tensores derivados da posição (vários planos 8×8: peças, repetições etc.). Aqui você vê o mesmo estado em notação e uma grade pedagógica.",
      "board2d.dlS": "Estado s",
      "board2d.dlSdesc": ": posição legal (FEN ou \"planos\" abaixo) — entrada da rede.",
      "board2d.dlP": "Política π(a|s)",
      "board2d.dlPdesc": ": probabilidades sobre lances legais — “para onde jogar”.",
      "board2d.dlV": "Valor V(s)",
      "board2d.dlVdesc": ": expectativa de resultado a partir de s — “quão boa é a posição”.",
      "board2d.dlB": "Buffer de replay",
      "board2d.dlBdesc": ": pares (estado, ação, resultado) das suas partidas — conjunto para treino.",
      "board2d.dlTrain": "Cada lance (com a opção acima) atualiza a rede TD; ao fim da partida o replay e as posições do buffer são gravados na base SQLite e o servidor agenda treino dos pesos heurísticos em segundo plano.",
      "board2d.dlCli": "<code class=\"cli\">npm run build-buffer</code> reconstrói o buffer na BD e exporta <code class=\"cli\">data/replay_buffer.jsonl</code>. <code class=\"cli\">npm run train-buffer</code> treina a partir da BD; use <code class=\"cli\">npm run train-buffer-file</code> só com o jsonl.",
      "board2d.gridSummary": "Grade 8×8 (codificação simples para estudo)",
      "board2d.gridHelp": "Letras = tipo de peça (maiúscula = branca). Em redes reais usam-se múltiplos canais binários por tipo e cor.",
      "ph.name": "Ex.: Ana",
      "ph.oppUntil": "Até o oponente entrar",
      "ph.lobbyId": "ID da Sala",
      "ph.password": "Senha",

      "chess3d.loadingAria": "Carregando o tabuleiro 3D",
      "chess3d.loadingHint": "Preparando biblioteca, tabuleiro e peças…",
      "chess3d.loadingGesture": "No celular: um dedo para jogar · dois dedos para girar e dar zoom",
      "chess3d.game": "Partida",
      "chess3d.hide": "Ocultar",
      "chess3d.show": "Mostrar",
      "chess3d.hideTitle": "Ocultar painel",
      "chess3d.hint": "Lance: clique na peça, depois na casa de destino (sem arrastar). <kbd>Esc</kbd> cancela a seleção. Toca-mover: após escolher a peça, não pode trocar por outra sua.",
      "chess3d.historyAria": "Histórico de jogadas",
      "chess3d.bookLine": "Livro da posição: —",
      "chess3d.new": "Novo jogo",
      "chess3d.undo": "Desfazer",
      "chess3d.continue2d": "Continuar em 2D",
      "chess3d.mode": "Modo",
      "chess3d.modeEngine": "Vs motor",
      "chess3d.modeHuman": "Humano vs humano",
      "chess3d.modeMp": "Multiplayer Online",
      "chess3d.yourColor": "Sua cor",
      "chess3d.lobby": "Lobby Multiplayer",
      "chess3d.yourName": "Seu nome",
      "chess3d.oppName": "Nome do adversário",
      "chess3d.roomPass": "Senha da sala (opcional)",
      "chess3d.players": "Jogadores na partida",
      "chess3d.players2": "2 (xadrez)",
      "chess3d.playersTitle": "Xadrez: dois jogadores no tabuleiro",
      "chess3d.maxSpec": "Máx. espectadores",
      "chess3d.maxSpecTitle": "Quem assiste sem jogar; pode ocupar lugar se um jogador cair",
      "chess3d.create": "Criar Sala",
      "chess3d.join": "Entrar",
      "chess3d.spectate": "Assistir",
      "chess3d.spectateTitle": "Vista de cima; entre como jogador se um lugar ficar livre",
      "chess3d.claimW": "Ocupar brancas",
      "chess3d.claimB": "Ocupar pretas",
      "chess3d.connIdle": "Canal: — · Ping: —",
      "chess3d.chatAria": "Mensagens do lobby",
      "chess3d.chatPh": "Mensagem ao oponente…",
      "chess3d.send": "Enviar",
      "chess3d.camera": "Câmera",
      "chess3d.camTitle": "Visão do tabuleiro 3D",
      "chess3d.camPlayer": "Jogador (padrão)",
      "chess3d.camTop": "De cima",
      "chess3d.camQuarter": "3/4 (clássica)",
      "chess3d.camFixed": "Brancas sempre embaixo",
      "chess3d.engineTune": "Profundidade e tempo do motor",
      "chess3d.engineHelp": "<strong>Prof.</strong> é a profundidade da busca: quantas <em>meia-jogadas</em> (plies) o motor tenta olhar à frente. <strong>ms</strong> é o teto de tempo por lance em milissegundos.",
      "chess3d.depth": "Prof.",
      "chess3d.ms": "ms",
      "chess3d.trainTd": "Treino TD online",
      "chess3d.net": "Rede: —",
      "chess3d.metricsHint": "O rating preditivo é uma estimativa a partir da rede de valor (não é Elo oficial).",
      "chess3d.legend": "Mapa de lances",
      "chess3d.legendAria": "Legenda das cores de lance",
      "chess3d.sel": "Peça selecionada",
      "chess3d.quiet": "Lance simples",
      "chess3d.capture": "Captura",
      "chess3d.castle": "Roque",
      "chess3d.ep": "En passant",
      "chess3d.double": "Avanço duplo",
      "chess3d.promo": "Promoção",
      "chess3d.capPromo": "Captura+promoção",
      "chess3d.check": "Rei em xeque",
      "chess3d.mate": "Xeque-mate",
      "chess3d.board2d": "Tabuleiro 2D",
      "chess3d.promoTitle": "Promoção de peão",
      "chess3d.goNew": "Nova partida",
      "ph.oppOptional": "Opcional (exibido até o oponente entrar)",
      "ph.guestPass": "O convidado precisará desta senha",
      "ph.joinPass": "Senha (se houver)",

      "go.gameOver": "Fim de partida",
      "go.win": "Vitória",
      "go.loss": "Derrota",
      "go.ended": "A partida terminou.",
      "go.checkmate": "Xeque-mate",
      "go.blackWon": "As pretas venceram a partida.",
      "go.whiteWon": "As brancas venceram a partida.",
      "go.stalemate": "Afogamento",
      "go.stalemateDetail": "Empate: não há lances legais e o rei não está em xeque.",
      "go.draw": "Empate",
      "go.insufficient": "Material insuficiente para forçar xeque-mate.",
      "go.repetition": "Tripla repetição da mesma posição.",
      "go.fifty": "Regra dos 50 lances sem captura ou peão.",
      "go.drawEnded": "A partida terminou em empate.",

      "status.waitOpp": "A aguardar oponente — o jogo só começa quando o convidado entrar na sala.",
      "status.mateBlack": "Xeque-mate — vitória das pretas.",
      "status.mateWhite": "Xeque-mate — vitória das brancas.",
      "status.stalemate": "Empate por afogamento.",
      "status.insufficient": "Empate — material insuficiente.",
      "status.repetition": "Empate — tripla repetição.",
      "status.fifty": "Empate — regra dos 50 lances.",
      "status.draw": "Empate.",
      "status.turnWhite": "Vez das brancas.",
      "status.turnBlack": "Vez das pretas.",
      "status.check": "Xeque! ",
      "status.yourTurn": " — sua vez.",
      "status.thinking": " — motor a pensar…",
      "status.gameOverClock": "Partida encerrada — relógio parado.",
      "status.clockPaused": "Relógio pausado. Continue ou faça o lance e use Pausar / Passar relógio.",
      "status.clockAwait": "Lance feito — aperte Pausar ou Passar relógio para entregar o tempo ao oponente.",
      "status.autoOn": "Auto-clique ligado: o relógio troca de lado sozinho após cada lance.",
      "status.autoOff": "Auto-clique desligado: jogue e depois passe o relógio (ou pause).",

      "clock.white": "BRANCAS",
      "clock.black": "PRETAS",
      "clock.you": "VOCÊ",
      "clock.engine": "MOTOR SATOR",

      "book.unavailable": "Livro da posição: indisponível.",
      "book.sator": "Livro SatorX: {list}{remote}",
      "book.empty": "Livro da posição: sem amostras locais{remote}",
      "book.lichess": " · Lichess: {san}",

      "mp.channelIdle": "Canal: — · Ping: —",
      "mp.channelLine": "Canal: {ch} · Ping: {ping}",
      "mp.ws": "tempo real (WS)",
      "mp.http": "HTTP (reserva)",
      "mp.conn2dIdle": "Canal: — · Vista plana de cima como espectador",
      "mp.conn2dLine": "Canal: {ch} · Ping: {ping}{spec}",
      "mp.specTag": " · Espectador (visão de cima)",
      "mp.white": "Brancas",
      "mp.black": "Pretas",
      "mp.spectator": "Espectador",
      "mp.specChat": "{name} (espect.)",
      "mp.roomVs": "Sala {id} — {w} vs {b}",
      "mp.roomWaitLink": "Sala {id} — {w} vs {b} (a aguardar ligação)",
      "mp.roomWait": "Sala {id} — {w} (a aguardar oponente)",
      "mp.roomWaitShort": "Sala {id} — {w} vs {b} (a aguardar)",
      "mp.specRoom": "Espectador — sala {id} (vista de cima)",
      "mp.hostWait": "Anfitrião — aguarde oponente (link com ?join= ou ?lobby=).",
      "mp.hostWait2d": "Anfitrião — aguarde o oponente (link com ?join=…).",
      "mp.unavailableHost": "Lobby online indisponível neste alojamento. Para multijogador, use um servidor Node dedicado (ex.: Railway, Fly.io) com `npm run server`.",
      "mp.share": "Copiar Link de Convite",
      "mp.copied": "Copiado!",
      "mp.unsupported": "O lobby online não está disponível: no Vercel configure PostgreSQL (DATABASE_URL ou POSTGRES_URL nas variáveis de ambiente de produção + migrações aplicadas no deploy).",
      "mp.hostSkipJoin": "É o anfitrião desta sala — já está nas brancas à espera. Envie o link de convite ao oponente; não use «Entrar na sala».",
      "mp.hostSkipSpec": "É o anfitrião desta sala — não pode assistir à própria partida. Aguarde o oponente ou partilhe o link.",
      "mp.alreadyIn": "Já está ligado a esta sala.",
      "mp.urlHint": "ID da sala preenchido. Oponente: «Entrar na sala». Se já houver dois jogadores, use «Assistir» ou «Reclamar lugar» (após desconexão).",
      "mp.alreadyCreated": "Já criou a sala «{id}». Partilhe o código ou aguarde o oponente.",
      "mp.alreadyPlaying": "Já está a jogar nesta sala — não use «Assistir».",
      "mp.alreadyWatching": "Já está a assistir a esta sala.",
      "mp.needId": "Indique o ID da sala.",
      "mp.connecting": "A ligar ao servidor…",
      "mp.connectingRoom": "A ligar à sala…",
      "mp.enteringSpec": "A entrar como espectador…",
      "mp.claiming": "A ocupar lugar…",
      "mp.restarting": "A reiniciar a partida na sala…",
      "mp.created": "Ligação estabelecida. Sala criada — partilhe o código ou o link.",
      "mp.joined": "Ligado à sala com sucesso.",
      "mp.watching": "A assistir em tempo real.",
      "mp.claimed": "Lugar ocupado — ligue o tempo real.",
      "mp.oppJoined": "Oponente ligado à sala — pode jogar.",
      "mp.handshake": "Handshake com o oponente: canal em tempo real ativo.",
      "mp.seatTaken": "{name} ocupou as {seat}.",
      "mp.seatW": "brancas",
      "mp.seatB": "pretas",
      "mp.player": "Jogador",
      "mp.rematchOk": "Nova partida na mesma sala.",
      "mp.needRealtimeChat": "Abra o canal em tempo real (reconecte à sala) para usar o chat.",
      "mp.net": "Erro de rede.",
      "mp.netCreate": "Erro de rede ao criar a sala. Tente de novo.",
      "mp.netJoin": "Erro de rede ao entrar na sala.",
      "mp.netChat": "Erro de rede ao enviar mensagem.",
      "mp.errCreate": "Não foi possível criar a sala.",
      "mp.errJoin": "Não foi possível entrar na sala.",
      "mp.errSpectate": "Não foi possível assistir.",
      "mp.errClaim": "Não foi possível ocupar o lugar.",
      "mp.errRematch": "Não foi possível iniciar nova partida.",
      "mp.errChat": "Não foi possível enviar a mensagem.",
      "mp.errCreateAlert": "Erro ao criar sala",
      "mp.errJoinAlert": "Erro ao entrar na sala",
      "mp.ended": "Partida terminada.",
      "mp.rating": "Rating (Clássico) preditivo ~{rating} (face ao motor ~{elo})",

      "ranking.title": "Ranking — salas online",
      "ranking.sub": "Histórico das partidas multijogador: ID da sala, jogadores, vencedor, pontuação (1 / 0 / 0,5), duração e motivo. Vitória por ausência: após <strong>2 minutos</strong> sem ligação em tempo real (WebSocket), a vitória é atribuída a quem permaneceu ligado.",
      "ranking.when": "Data / hora",
      "ranking.room": "ID sala",
      "ranking.white": "Brancas",
      "ranking.black": "Pretas",
      "ranking.winner": "Vencedor",
      "ranking.score": "Pontos (B / P)",
      "ranking.time": "Tempo",
      "ranking.reason": "Motivo",
      "ranking.empty": "Nenhuma partida registada ainda. Jogue online na vista 3D e os resultados aparecem aqui.",
      "ranking.loading": "A carregar…",
      "ranking.records": "{n} registo",
      "ranking.recordsPlural": "{n} registos",
      "ranking.err": "Não foi possível carregar o ranking. Confirme que o servidor está a correr (ex.: npm run server). {msg}",
      "ranking.bad": "Resposta inválida",

      "matches.title": "Ranking",
      "matches.sub": "Todas as partidas — multiplayer online, contra o motor ou contra outro humano — com início, fim, placar, oponente e localização.",
      "matches.start": "Início",
      "matches.end": "Fim",
      "matches.score": "Placar",
      "matches.versus": "Contra quem",
      "matches.type": "Tipo",
      "matches.typeMultiplayer": "Multiplayer",
      "matches.typeEngine": "Contra o motor",
      "matches.typeHuman": "Contra humano",
      "matches.location": "Localização",
      "matches.empty": "Nenhuma partida registada ainda. Jogue no 2D, no 3D ou online e o histórico aparece aqui.",
      "matches.loading": "A carregar…",
      "matches.records": "{n} registo",
      "matches.recordsPlural": "{n} registos",
      "matches.err": "Não foi possível carregar o registro. Confirme que o servidor está a correr (ex.: npm run server). {msg}",
      "matches.bad": "Resposta inválida",
      "matches.you": "Você",
      "matches.engine": "Sator Engine",
      "matches.localOpp": "Jogador local",

      "reason.checkmate.w": "Xeque-mate — vitória das brancas.",
      "reason.checkmate.b": "Xeque-mate — vitória das pretas.",
      "reason.stalemate": "Afogamento — empate.",
      "reason.insufficient": "Material insuficiente — empate.",
      "reason.repetition": "Tripla repetição — empate.",
      "reason.fifty": "Regra dos 50 lances — empate.",
      "reason.draw": "Empate.",
      "reason.disconnect_timeout.w": "Vitória das brancas — oponente ausente (tempo real) por 2+ minutos.",
      "reason.disconnect_timeout.b": "Vitória das pretas — oponente ausente (tempo real) por 2+ minutos.",
      "reason.disconnect_timeout": "Vitória por ausência (2+ minutos sem ligação em tempo real).",
      "reason.dual_offline": "Empate — ambos ausentes (tempo real) por 2+ minutos.",

      "offline.title": "Sem conexão",
      "offline.body": "O Sator Engine precisa de rede para o motor e APIs. Verifique sua conexão e tente de novo.",
      "offline.back": "Voltar ao início",

      "api.fenInvalid": "FEN inválido",
      "api.sendPgnOrMoves": "Envie pgn ou moves",
      "api.replaySaveFail": "Falha ao gravar replay na base de dados",
      "api.replayListFail": "Falha ao listar replays",
      "api.replayMissing": "Replay não encontrado",
      "api.replayReadFail": "Falha ao ler replay",
      "api.needMoveLearn": "Envie fenBefore, fenAfter e san",
      "api.fenBeforeInvalid": "fenBefore inválido",
      "api.illegalMove": "Lance ilegal para fenBefore",
      "api.fenAfterMismatch": "fenAfter não corresponde ao lance",
      "api.fenAfterInvalid": "fenAfter inválido",
      "api.needId": "id obrigatório",
      "api.liveSaveFail": "Falha ao gravar sessão ao vivo",
      "api.sessionMissing": "Sessão não encontrada",
      "api.sendFen": "Envie fen",
      "api.badCred": "Credencial inválida.",
      "api.gameEnded": "Partida terminada.",
      "api.badPass": "Senha incorreta",
      "api.roomFull": "Sala cheia — o lugar das pretas já está ligado.",
      "api.roomMissing": "Sala não existe",
      "api.notFinished": "A partida ainda não terminou.",
      "api.createFail": "Erro ao criar sala.",
      "api.createRetry": "Não foi possível criar uma sala. Tente novamente.",
      "api.needRoomId": "Indique o ID da sala.",
      "api.joinFail": "Erro ao entrar na sala.",
      "api.rematchFail": "Erro ao reiniciar a partida.",
      "api.roomInvalid": "Sala inválida",
      "api.waitTwo": "Aguarde dois jogadores na sala para assistir.",
      "api.specLimit": "Limite de espectadores atingido.",
      "api.specFail": "Erro ao assistir.",
      "api.needSeat": "Indique seat: \"w\" ou \"b\".",
      "api.notStarted": "Partida ainda não começou.",
      "api.seatTaken": "Esse lugar já está ocupado no tempo real.",
      "api.noSeat": "Não há lugar livre para ocupar (ou passaram 2 minutos — vitória por ausência).",
      "api.claimFail": "Erro ao ocupar lugar.",
      "api.lobbyMissing": "Lobby não encontrado",
      "api.readRoomFail": "Erro ao ler sala.",
      "api.badData": "Dados inválidos.",
      "api.chatFail": "Erro ao enviar mensagem.",
      "api.rankingFail": "Falha ao ler ranking (corra: npx prisma migrate deploy)",
      "api.roomOrEnded": "Sala inválida ou partida já terminada",
      "api.notOver": "A partida ainda não terminou"
    },
    en: {
      "lang.en": "English",
      "lang.pt": "Portuguese (Brazil)",
      "lang.group": "Language",

      "meta.home.title": "SatorX Chess Engine — Intelligent Chess and ExagonX-AI Evaluation",
      "meta.home.desc": "Sator 8×8 chess engine: hybrid heuristics, a value network, and a Three.js 3D view.",
      "meta.home.twitter": "Advanced chess AI engine: hybrid heuristics, a value network, and a Three.js 3D view.",
      "meta.2d.title": "Sator Engine — 2D board and deep learning",
      "meta.2d.desc": "Sator 2D board with the chess engine and API analysis.",
      "meta.3d.title": "Sator Engine — 3D view",
      "meta.3d.desc": "3D chess with the Sator Engine and hybrid AI.",
      "meta.ranking.title": "Ranking — online rooms | SatorX",
      "meta.matches.title": "Match log | SatorX",
      "meta.offline.title": "Offline — Sator Engine",

      "menu.aria": "Main menu",
      "menu.start": "▶  Start Game",
      "menu.online": "Play Online (Lobby)",
      "menu.ranking": "Ranking — online rooms",
      "menu.matches": "Ranking",
      "menu.rules": "Chess Rules",
      "menu.options": "Settings",
      "menu.ia": "AI & Neural Network",
      "menu.footer": "Sator Ngx v5  ·  Hybrid engine",
      "alt.piece": "Sator square",
      "alt.logo": "Sator Ngx v5",

      "common.close": "Close",
      "common.menu": "← Menu",
      "common.menuHome": "← Home menu",
      "common.refresh": "Refresh",
      "common.loading": "Loading…",
      "common.you": "You",
      "common.opponent": "Opponent",
      "common.white": "White",
      "common.black": "Black",
      "common.draw": "Draw",
      "common.nd": "N/A",
      "common.cancel": "Cancel",
      "common.engine": "Sator Engine",
      "common.na": "—",

      "rules.title": "Chess Rules",
      "rules.introBefore": "Chess is played on an 8×8 board by two players. The goal is to ",
      "rules.checkmate": "checkmate",
      "rules.introAfter": " the opponent’s king.",
      "rules.king": "King",
      "rules.kingDesc": ": moves one square in any direction.",
      "rules.queen": "Queen",
      "rules.queenDesc": ": moves any number of squares in a straight line or diagonally.",
      "rules.rook": "Rook",
      "rules.rookDesc": ": moves in a straight line (horizontally or vertically).",
      "rules.bishop": "Bishop",
      "rules.bishopDesc": ": moves diagonally.",
      "rules.knight": "Knight",
      "rules.knightDesc": ": moves in an “L” (2+1 squares); the only piece that jumps.",
      "rules.pawn": "Pawn",
      "rules.pawnDesc": ": advances one square (or two on its first move) and captures diagonally.",
      "rules.specialBefore": "Special moves: ",
      "rules.castling": "castling",
      "rules.specialMid1": ", ",
      "rules.enpassant": "en passant",
      "rules.specialMid2": " (capturing in passing) and ",
      "rules.promotion": "promotion",
      "rules.specialAfter": " (pawn reaching the last rank).",
      "rules.hover": "Hover or tap/click a term",
      "rules.demo.king": "King — up to 8 neighboring squares",
      "rules.demo.queen": "Queen — ranks, files, and diagonals",
      "rules.demo.rook": "Rook — ranks and files",
      "rules.demo.bishop": "Bishop — diagonals only",
      "rules.demo.knight": "Knight — L-shaped jump",
      "rules.demo.pawn": "Pawn — advance and capture",
      "rules.demo.castling": "Castling — king and rook together",
      "rules.demo.enpassant": "En passant — side capture",
      "rules.demo.promotion": "Promotion — pawn becomes a queen",
      "rules.demo.checkmate": "Checkmate — the king has no escape",

      "options.title": "Settings",
      "options.p1": "Search depth, time per move, game mode, and camera view are available directly in the side panel of the <strong>3D View</strong>.",
      "options.p2": "Open the <a href=\"/chess3d.html\">3D View</a> or the <a href=\"/board2d.html\">2D Board</a> to adjust options in real time during a game.",

      "ia.title": "AI & Neural Network",
      "ia.statusTitle": "Current AI status",
      "ia.connecting": "Connecting to the Sator Engine...",
      "ia.updates": "Training updates:",
      "ia.tdError": "Last error (TD-λ):",
      "ia.elo": "Average ranking (Elo):",
      "ia.eloRef": "(Initial reference)",
      "ia.eloEst": "(estimated by network)",
      "ia.calcTitle": "How the calculations work",
      "ia.calc1": "The <strong>Sator Engine</strong> combines classical search (minimax + alpha-beta) with a value network trained by <em>temporal-difference learning</em> (TD-λ).",
      "ia.calc2": "Evaluation uses a <strong>logistic curve (sigmoid)</strong> that converts the network’s linear output (V) into a win probability and estimated Elo. It also uses hybrid heuristics and <strong>Sacred Geometry</strong> (the SATOR square) to analyze symmetry and connectivity.",
      "ia.tdOnline": "Online TD",
      "ia.tdOnlineDesc": ": the network learns in real time during games.",
      "ia.replay": "Replay buffer",
      "ia.replayDesc": ": saved games for supervised training.",
      "ia.mastersTitle": "Base models (masters)",
      "ia.mastersIntro": "During continuous learning, the AI simulates games in these masters’ styles, absorbing their tactical and positional patterns:",
      "ia.kas.meta": "(Russia, 63, FIDE Elo 2812 inactive — peak 2851, world no. 1)",
      "ia.kas.bio": "Garry Kimovich Kasparov was born in Baku on 13 April 1963. World Champion from 1985 to 2000, he was ranked no. 1 for 255 months and retired from regular competition in 2005 still at the top. His peak Elo (2851, in 1999) was a world record until 2013.",
      "ia.kas1": "Dynamic attack and fighting for the initiative in every phase",
      "ia.kas2": "Deep opening preparation and aggressive variations",
      "ia.kas3": "Tactical calculation, positional sacrifices, and psychological pressure",
      "ia.kas4": "Repertoire: Ruy Lopez, Najdorf Sicilian, Scotch, Queen’s Gambit, English, King’s Indian (Sämisch), and Grünfeld",
      "ia.car.meta": "(Norway, 35, FIDE Elo 2823 — world no. 1, peak 2882)",
      "ia.car.bio": "Sven Magnus Øen Carlsen was born in Tønsberg on 30 November 1990. Five-time classical World Champion (2013–2023), he has led the FIDE ranking since 2011 and holds the all-time Elo record (2882). He also holds world titles in rapid, blitz, and Freestyle.",
      "ia.car1": "Universal, pragmatic style: playable, less theoretical positions",
      "ia.car2": "Endgame technique and patient conversion of tiny advantages",
      "ia.car3": "Opening versatility to avoid narrow preparation",
      "ia.car4": "Repertoire: Ruy Lopez (Berlin), Catalan, Dragon Sicilian, symmetrical English, London System, Italian, and Caro-Kann",
      "ia.pol.meta": "(Hungary, 50, FIDE Elo 2675 inactive — peak 2735, world no. 8)",
      "ia.pol.bio": "Judit Polgár was born in Budapest on 23 July 1976. She is the only woman to enter the world top 10 and to surpass 2700 Elo. She became a Grandmaster at 15, declined the women’s circuit, and faced the men’s elite until retiring from competition in 2014.",
      "ia.pol1": "Attacking, tactical chess: complications and unbalanced positions",
      "ia.pol2": "Aggressive 1.e4 with White; dynamic defenses with Black",
      "ia.pol3": "Constant fight — avoids simplifications that give up the initiative",
      "ia.pol4": "Repertoire: Sicilian, Italian, King’s Indian, French, King’s Gambit, Ruy Lopez, and Austrian Attack (Pirc)",
      "ia.bel.meta": "(France, 32, FIDE Elo 2237 — peak 2364)",
      "ia.bel.bio": "Dina Vadimovna Belenkaya was born in Saint Petersburg on 22 December 1993. Four-time Saint Petersburg women’s champion and a 2021 Women’s World Cup participant. She represented Russia until 2022, Israel from 2022 to 2026, and France since 2026. She is also a chess commentator and content creator.",
      "ia.bel1": "Practical attack: complicating the position and forcing errors under pressure",
      "ia.bel2": "Aggressive 1.e4 — Italian, Scotch, and initiative gambits",
      "ia.bel3": "Dynamic defenses with Black and a blitz tempo on the clock",
      "ia.bel4": "Repertoire: Italian, Scotch, Evans Gambit, Dragon Sicilian, Winawer French, King’s Indian, and Scandinavian",
      "ia.loadError": "Failed to load AI data.",

      "chooser.title": "New game",
      "chooser.body": "Choose a view. The game stays in sync: you can continue in 2D or 3D from the exact same position, with the same history and clock.",
      "chooser.2d": "2D board",
      "chooser.3d": "3D board",

      "board2d.badge": "Deep learning",
      "board2d.continue3d": "Continue in 3D",
      "board2d.lead": "2D view with move arrows, side history, and a clock. Auto-click switches the clock when you move; turn it off to move first and only then pause / press the clock.",
      "board2d.autoClick": "Auto-click",
      "board2d.pause": "Pause",
      "board2d.resume": "Resume",
      "board2d.pressClock": "Press clock",
      "board2d.clockHint": "The clock starts on the first move. Auto-click switches sides automatically.",
      "board2d.history": "Move history",
      "board2d.engineNoMoves": "The engine has not moved in this game yet.",
      "board2d.thoughtTitle": "Engine thinking",
      "board2d.thoughtAria": "Engine thought log",
      "board2d.masterBanner": "Engine using a master’s strategy",
      "thought.master": "Master:",
      "thought.why": "Why:",
      "thought.phase": "Phase:",
      "thought.squares": "Squares:",
      "thought.piece": "Piece:",
      "thought.type": "Type:",
      "thought.oppMove": "Opponent’s move:",
      "thought.noPrev": "start / no previous move",
      "board2d.noMoves": "No moves yet.",
      "board2d.legendAria": "Arrow legend",
      "board2d.lastMove": "Last move",
      "board2d.quiet": "Quiet move",
      "board2d.capture": "Capture",
      "board2d.castle": "Castling",
      "board2d.ep": "En passant",
      "board2d.double": "Double pawn push",
      "board2d.promo": "Promotion",
      "board2d.selected": "Selected",
      "board2d.new": "New game",
      "board2d.undo": "Undo",
      "board2d.analyze": "Analyze",
      "board2d.save": "Save replay",
      "board2d.list": "List replays",
      "board2d.mode": "Mode",
      "board2d.modeEngine": "Vs engine (minimax)",
      "board2d.modeHuman": "Human vs human",
      "board2d.modeMp": "Online multiplayer",
      "board2d.yourColor": "Your color (vs engine)",
      "board2d.whiteStart": "White (moves first)",
      "board2d.blackEngine": "Black (engine opens)",
      "board2d.lobbyTitle": "Lobby — same API as the 3D view (password, WebSocket, spectators)",
      "board2d.yourName": "Your name",
      "board2d.oppName": "Expected opponent (optional)",
      "board2d.roomPass": "Room password (create, optional)",
      "board2d.maxSpec": "Max spectators",
      "board2d.create": "Create room",
      "board2d.join": "Join (player)",
      "board2d.spectate": "Spectate (top)",
      "board2d.claimW": "Take White",
      "board2d.claimB": "Take Black",
      "board2d.connIdle": "Channel: — · Top-down view for spectators",
      "board2d.trainTd": "TD learning on every move (value network)",
      "board2d.engineTune": "Engine depth and time",
      "board2d.engineHelp": "<strong>Depth</strong>: how many half-moves (plies) the engine looks ahead. <strong>Time (ms)</strong>: maximum thinking time per move.",
      "board2d.depth": "Depth",
      "board2d.timeMs": "Engine time (ms)",
      "board2d.state": "Game status",
      "board2d.lastEngine": "Last engine move",
      "board2d.report": "Report (Tabula + metrics)",
      "board2d.book": "Book and search (SatorX + Lichess)",
      "board2d.bookLine": "Position book: —",
      "board2d.searchPh": "Search games (e4, kasparov, draw…)",
      "board2d.search": "Search",
      "board2d.replays": "Replays",
      "board2d.fen": "FEN",
      "board2d.dlTitle": "From the board to deep learning",
      "board2d.dl1": "In engines like AlphaZero, the <strong>neural network</strong> does not “see” wood: it receives tensors derived from the position (several 8×8 planes: pieces, repetitions, and so on). Here you see the same state in notation and a teaching grid.",
      "board2d.dlS": "State s",
      "board2d.dlSdesc": ": a legal position (FEN or the “planes” below) — the network input.",
      "board2d.dlP": "Policy π(a|s)",
      "board2d.dlPdesc": ": probabilities over legal moves — “where to play”.",
      "board2d.dlV": "Value V(s)",
      "board2d.dlVdesc": ": expected result from s — “how good the position is”.",
      "board2d.dlB": "Replay buffer",
      "board2d.dlBdesc": ": (state, action, result) pairs from your games — the training set.",
      "board2d.dlTrain": "Each move (with the option above) updates the TD network; at the end of the game the replay and buffer positions are stored in SQLite and the server schedules heuristic-weight training in the background.",
      "board2d.dlCli": "<code class=\"cli\">npm run build-buffer</code> rebuilds the buffer in the database and exports <code class=\"cli\">data/replay_buffer.jsonl</code>. <code class=\"cli\">npm run train-buffer</code> trains from the database; use <code class=\"cli\">npm run train-buffer-file</code> with the jsonl file only.",
      "board2d.gridSummary": "8×8 grid (simple encoding for study)",
      "board2d.gridHelp": "Letters = piece type (uppercase = White). Real networks use multiple binary channels per type and color.",
      "ph.name": "e.g. Ana",
      "ph.oppUntil": "Until the opponent joins",
      "ph.lobbyId": "Room ID",
      "ph.password": "Password",

      "chess3d.loadingAria": "Loading the 3D board",
      "chess3d.loadingHint": "Preparing the library, board, and pieces…",
      "chess3d.loadingGesture": "On mobile: one finger to play · two fingers to rotate and zoom",
      "chess3d.game": "Game",
      "chess3d.hide": "Hide",
      "chess3d.show": "Show",
      "chess3d.hideTitle": "Hide panel",
      "chess3d.hint": "Move: click the piece, then the destination square (no dragging). <kbd>Esc</kbd> cancels the selection. Touch-to-move: after choosing a piece, you cannot switch to another of yours.",
      "chess3d.historyAria": "Move history",
      "chess3d.bookLine": "Position book: —",
      "chess3d.new": "New game",
      "chess3d.undo": "Undo",
      "chess3d.continue2d": "Continue in 2D",
      "chess3d.mode": "Mode",
      "chess3d.modeEngine": "Vs engine",
      "chess3d.modeHuman": "Human vs human",
      "chess3d.modeMp": "Online multiplayer",
      "chess3d.yourColor": "Your color",
      "chess3d.lobby": "Multiplayer lobby",
      "chess3d.yourName": "Your name",
      "chess3d.oppName": "Opponent’s name",
      "chess3d.roomPass": "Room password (optional)",
      "chess3d.players": "Players in the game",
      "chess3d.players2": "2 (chess)",
      "chess3d.playersTitle": "Chess: two players on the board",
      "chess3d.maxSpec": "Max spectators",
      "chess3d.maxSpecTitle": "Who watches without playing; can take a seat if a player drops",
      "chess3d.create": "Create room",
      "chess3d.join": "Join",
      "chess3d.spectate": "Spectate",
      "chess3d.spectateTitle": "Top-down view; join as a player if a seat opens",
      "chess3d.claimW": "Take White",
      "chess3d.claimB": "Take Black",
      "chess3d.connIdle": "Channel: — · Ping: —",
      "chess3d.chatAria": "Lobby messages",
      "chess3d.chatPh": "Message to opponent…",
      "chess3d.send": "Send",
      "chess3d.camera": "Camera",
      "chess3d.camTitle": "3D board view",
      "chess3d.camPlayer": "Player (default)",
      "chess3d.camTop": "Top-down",
      "chess3d.camQuarter": "3/4 (classic)",
      "chess3d.camFixed": "White always at the bottom",
      "chess3d.engineTune": "Engine depth and time",
      "chess3d.engineHelp": "<strong>Depth</strong> is search depth: how many <em>half-moves</em> (plies) the engine tries to look ahead. <strong>ms</strong> is the time cap per move in milliseconds.",
      "chess3d.depth": "Depth",
      "chess3d.ms": "ms",
      "chess3d.trainTd": "Online TD training",
      "chess3d.net": "Network: —",
      "chess3d.metricsHint": "The predictive rating is an estimate from the value network (not official Elo).",
      "chess3d.legend": "Move map",
      "chess3d.legendAria": "Move-color legend",
      "chess3d.sel": "Selected piece",
      "chess3d.quiet": "Quiet move",
      "chess3d.capture": "Capture",
      "chess3d.castle": "Castling",
      "chess3d.ep": "En passant",
      "chess3d.double": "Double pawn push",
      "chess3d.promo": "Promotion",
      "chess3d.capPromo": "Capture + promotion",
      "chess3d.check": "King in check",
      "chess3d.mate": "Checkmate",
      "chess3d.board2d": "2D board",
      "chess3d.promoTitle": "Pawn promotion",
      "chess3d.goNew": "New game",
      "ph.oppOptional": "Optional (shown until the opponent joins)",
      "ph.guestPass": "The guest will need this password",
      "ph.joinPass": "Password (if any)",

      "go.gameOver": "Game over",
      "go.win": "Victory",
      "go.loss": "Defeat",
      "go.ended": "The game has ended.",
      "go.checkmate": "Checkmate",
      "go.blackWon": "Black won the game.",
      "go.whiteWon": "White won the game.",
      "go.stalemate": "Stalemate",
      "go.stalemateDetail": "Draw: there are no legal moves and the king is not in check.",
      "go.draw": "Draw",
      "go.insufficient": "Insufficient material to force checkmate.",
      "go.repetition": "Threefold repetition of the same position.",
      "go.fifty": "Fifty-move rule with no capture or pawn move.",
      "go.drawEnded": "The game ended in a draw.",

      "status.waitOpp": "Waiting for opponent — the game starts only when the guest joins the room.",
      "status.mateBlack": "Checkmate — Black wins.",
      "status.mateWhite": "Checkmate — White wins.",
      "status.stalemate": "Draw by stalemate.",
      "status.insufficient": "Draw — insufficient material.",
      "status.repetition": "Draw — threefold repetition.",
      "status.fifty": "Draw — fifty-move rule.",
      "status.draw": "Draw.",
      "status.turnWhite": "White to move.",
      "status.turnBlack": "Black to move.",
      "status.check": "Check! ",
      "status.yourTurn": " — your turn.",
      "status.thinking": " — engine thinking…",
      "status.gameOverClock": "Game over — clock stopped.",
      "status.clockPaused": "Clock paused. Resume, or make a move and use Pause / Press clock.",
      "status.clockAwait": "Move made — press Pause or Press clock to hand the time to your opponent.",
      "status.autoOn": "Auto-click on: the clock switches sides by itself after each move.",
      "status.autoOff": "Auto-click off: play, then press the clock (or pause).",

      "clock.white": "WHITE",
      "clock.black": "BLACK",
      "clock.you": "YOU",
      "clock.engine": "SATOR ENGINE",

      "book.unavailable": "Position book: unavailable.",
      "book.sator": "SatorX book: {list}{remote}",
      "book.empty": "Position book: no local samples{remote}",
      "book.lichess": " · Lichess: {san}",

      "mp.channelIdle": "Channel: — · Ping: —",
      "mp.channelLine": "Channel: {ch} · Ping: {ping}",
      "mp.ws": "realtime (WS)",
      "mp.http": "HTTP (fallback)",
      "mp.conn2dIdle": "Channel: — · Top-down view as spectator",
      "mp.conn2dLine": "Channel: {ch} · Ping: {ping}{spec}",
      "mp.specTag": " · Spectator (top-down view)",
      "mp.white": "White",
      "mp.black": "Black",
      "mp.spectator": "Spectator",
      "mp.specChat": "{name} (spec.)",
      "mp.roomVs": "Room {id} — {w} vs {b}",
      "mp.roomWaitLink": "Room {id} — {w} vs {b} (waiting to connect)",
      "mp.roomWait": "Room {id} — {w} (waiting for opponent)",
      "mp.roomWaitShort": "Room {id} — {w} vs {b} (waiting)",
      "mp.specRoom": "Spectator — room {id} (top-down view)",
      "mp.hostWait": "Host — wait for opponent (link with ?join= or ?lobby=).",
      "mp.hostWait2d": "Host — wait for opponent (link with ?join=…).",
      "mp.unavailableHost": "Online lobby is unavailable on this host. For multiplayer, use a dedicated Node server (e.g. Railway, Fly.io) with `npm run server`.",
      "mp.share": "Copy invite link",
      "mp.copied": "Copied!",
      "mp.unsupported": "The online lobby is unavailable: on Vercel configure PostgreSQL (DATABASE_URL or POSTGRES_URL in production environment variables + migrations applied on deploy).",
      "mp.hostSkipJoin": "You are the host of this room — you are already sitting as White. Send the invite link to your opponent; do not use “Join room”.",
      "mp.hostSkipSpec": "You are the host of this room — you cannot spectate your own game. Wait for your opponent or share the link.",
      "mp.alreadyIn": "You are already connected to this room.",
      "mp.urlHint": "Room ID filled in. Opponent: “Join room”. If two players are already seated, use “Spectate” or “Claim seat” (after a disconnect).",
      "mp.alreadyCreated": "You already created room “{id}”. Share the code or wait for your opponent.",
      "mp.alreadyPlaying": "You are already playing in this room — do not use “Spectate”.",
      "mp.alreadyWatching": "You are already spectating this room.",
      "mp.needId": "Enter the room ID.",
      "mp.connecting": "Connecting to the server…",
      "mp.connectingRoom": "Connecting to the room…",
      "mp.enteringSpec": "Joining as spectator…",
      "mp.claiming": "Taking a seat…",
      "mp.restarting": "Restarting the game in the room…",
      "mp.created": "Connected. Room created — share the code or the link.",
      "mp.joined": "Joined the room successfully.",
      "mp.watching": "Watching in real time.",
      "mp.claimed": "Seat taken — connecting realtime.",
      "mp.oppJoined": "Opponent connected to the room — you can play.",
      "mp.handshake": "Handshake with opponent: realtime channel is active.",
      "mp.seatTaken": "{name} took {seat}.",
      "mp.seatW": "White",
      "mp.seatB": "Black",
      "mp.player": "Player",
      "mp.rematchOk": "New game in the same room.",
      "mp.needRealtimeChat": "Open the realtime channel (reconnect to the room) to use chat.",
      "mp.net": "Network error.",
      "mp.netCreate": "Network error while creating the room. Try again.",
      "mp.netJoin": "Network error while joining the room.",
      "mp.netChat": "Network error while sending the message.",
      "mp.errCreate": "Could not create the room.",
      "mp.errJoin": "Could not join the room.",
      "mp.errSpectate": "Could not spectate.",
      "mp.errClaim": "Could not take the seat.",
      "mp.errRematch": "Could not start a new game.",
      "mp.errChat": "Could not send the message.",
      "mp.errCreateAlert": "Error creating room",
      "mp.errJoinAlert": "Error joining room",
      "mp.ended": "Game over.",
      "mp.rating": "Predictive (classical) rating ~{rating} (vs engine ~{elo})",

      "ranking.title": "Ranking — online rooms",
      "ranking.sub": "History of multiplayer games: room ID, players, winner, score (1 / 0 / 0.5), duration, and reason. Win by absence: after <strong>2 minutes</strong> without a realtime (WebSocket) connection, the win is awarded to whoever stayed connected.",
      "ranking.when": "Date / time",
      "ranking.room": "Room ID",
      "ranking.white": "White",
      "ranking.black": "Black",
      "ranking.winner": "Winner",
      "ranking.score": "Points (W / B)",
      "ranking.time": "Time",
      "ranking.reason": "Reason",
      "ranking.empty": "No games recorded yet. Play online in the 3D view and results will appear here.",
      "ranking.loading": "Loading…",
      "ranking.records": "{n} record",
      "ranking.recordsPlural": "{n} records",
      "ranking.err": "Could not load the ranking. Make sure the server is running (e.g. npm run server). {msg}",
      "ranking.bad": "Invalid response",

      "matches.title": "Ranking",
      "matches.sub": "All games — online multiplayer, vs the engine, or vs another human — with start, end, score, opponent, and location.",
      "matches.start": "Start",
      "matches.end": "End",
      "matches.score": "Score",
      "matches.versus": "Opponent",
      "matches.type": "Type",
      "matches.typeMultiplayer": "Multiplayer",
      "matches.typeEngine": "Vs engine",
      "matches.typeHuman": "Vs human",
      "matches.location": "Location",
      "matches.empty": "No games recorded yet. Play in 2D, 3D, or online and the history will appear here.",
      "matches.loading": "Loading…",
      "matches.records": "{n} record",
      "matches.recordsPlural": "{n} records",
      "matches.err": "Could not load the match log. Make sure the server is running (e.g. npm run server). {msg}",
      "matches.bad": "Invalid response",
      "matches.you": "You",
      "matches.engine": "Sator Engine",
      "matches.localOpp": "Local player",

      "reason.checkmate.w": "Checkmate — White wins.",
      "reason.checkmate.b": "Checkmate — Black wins.",
      "reason.stalemate": "Stalemate — draw.",
      "reason.insufficient": "Insufficient material — draw.",
      "reason.repetition": "Threefold repetition — draw.",
      "reason.fifty": "Fifty-move rule — draw.",
      "reason.draw": "Draw.",
      "reason.disconnect_timeout.w": "White wins — opponent absent (realtime) for 2+ minutes.",
      "reason.disconnect_timeout.b": "Black wins — opponent absent (realtime) for 2+ minutes.",
      "reason.disconnect_timeout": "Win by absence (2+ minutes without a realtime connection).",
      "reason.dual_offline": "Draw — both players absent (realtime) for 2+ minutes.",

      "offline.title": "No connection",
      "offline.body": "Sator Engine needs a network for the engine and APIs. Check your connection and try again.",
      "offline.back": "Back to home",

      "api.fenInvalid": "Invalid FEN",
      "api.sendPgnOrMoves": "Send pgn or moves",
      "api.replaySaveFail": "Failed to save replay to the database",
      "api.replayListFail": "Failed to list replays",
      "api.replayMissing": "Replay not found",
      "api.replayReadFail": "Failed to read replay",
      "api.needMoveLearn": "Send fenBefore, fenAfter, and san",
      "api.fenBeforeInvalid": "Invalid fenBefore",
      "api.illegalMove": "Illegal move for fenBefore",
      "api.fenAfterMismatch": "fenAfter does not match the move",
      "api.fenAfterInvalid": "Invalid fenAfter",
      "api.needId": "id is required",
      "api.liveSaveFail": "Failed to save live session",
      "api.sessionMissing": "Session not found",
      "api.sendFen": "Send fen",
      "api.badCred": "Invalid credential.",
      "api.gameEnded": "Game over.",
      "api.badPass": "Incorrect password",
      "api.roomFull": "Room full — Black’s seat is already connected.",
      "api.roomMissing": "Room does not exist",
      "api.notFinished": "The game has not ended yet.",
      "api.createFail": "Error creating room.",
      "api.createRetry": "Could not create a room. Try again.",
      "api.needRoomId": "Enter the room ID.",
      "api.joinFail": "Error joining the room.",
      "api.rematchFail": "Error restarting the game.",
      "api.roomInvalid": "Invalid room",
      "api.waitTwo": "Wait for two players in the room to spectate.",
      "api.specLimit": "Spectator limit reached.",
      "api.specFail": "Error spectating.",
      "api.needSeat": "Provide seat: \"w\" or \"b\".",
      "api.notStarted": "The game has not started yet.",
      "api.seatTaken": "That seat is already taken in realtime.",
      "api.noSeat": "No free seat to take (or 2 minutes have passed — win by absence).",
      "api.claimFail": "Error taking the seat.",
      "api.lobbyMissing": "Lobby not found",
      "api.readRoomFail": "Error reading the room.",
      "api.badData": "Invalid data.",
      "api.chatFail": "Error sending the message.",
      "api.rankingFail": "Failed to read ranking (run: npx prisma migrate deploy)",
      "api.roomOrEnded": "Invalid room or game already finished",
      "api.notOver": "The game has not ended yet"
    }
  };

  var API_MAP = {
    "FEN inválido": "api.fenInvalid",
    "Envie pgn ou moves": "api.sendPgnOrMoves",
    "Falha ao gravar replay na base de dados": "api.replaySaveFail",
    "Falha ao listar replays": "api.replayListFail",
    "Replay não encontrado": "api.replayMissing",
    "Falha ao ler replay": "api.replayReadFail",
    "Envie fenBefore, fenAfter e san": "api.needMoveLearn",
    "fenBefore inválido": "api.fenBeforeInvalid",
    "Lance ilegal para fenBefore": "api.illegalMove",
    "fenAfter não corresponde ao lance": "api.fenAfterMismatch",
    "fenAfter inválido": "api.fenAfterInvalid",
    "id obrigatório": "api.needId",
    "Falha ao gravar sessão ao vivo": "api.liveSaveFail",
    "Sessão não encontrada": "api.sessionMissing",
    "Envie fen": "api.sendFen",
    "Credencial inválida.": "api.badCred",
    "Partida terminada.": "api.gameEnded",
    "Senha incorreta": "api.badPass",
    "Sala cheia — o lugar das pretas já está ligado.": "api.roomFull",
    "Sala não existe": "api.roomMissing",
    "Sala não existe.": "api.roomMissing",
    "A partida ainda não terminou.": "api.notFinished",
    "A partida ainda não terminou": "api.notOver",
    "Erro ao criar sala.": "api.createFail",
    "Não foi possível criar uma sala. Tente novamente.": "api.createRetry",
    "Indique o ID da sala.": "api.needRoomId",
    "Erro ao entrar na sala.": "api.joinFail",
    "Erro ao reiniciar a partida.": "api.rematchFail",
    "Sala inválida": "api.roomInvalid",
    "Aguarde dois jogadores na sala para assistir.": "api.waitTwo",
    "Limite de espectadores atingido.": "api.specLimit",
    "Erro ao assistir.": "api.specFail",
    "Indique seat: \"w\" ou \"b\".": "api.needSeat",
    "Partida ainda não começou.": "api.notStarted",
    "Esse lugar já está ocupado no tempo real.": "api.seatTaken",
    "Não há lugar livre para ocupar (ou passaram 2 minutos — vitória por ausência).": "api.noSeat",
    "Erro ao ocupar lugar.": "api.claimFail",
    "Lobby não encontrado": "api.lobbyMissing",
    "Erro ao ler sala.": "api.readRoomFail",
    "Dados inválidos.": "api.badData",
    "Erro ao enviar mensagem.": "api.chatFail",
    "Falha ao ler ranking (corra: npx prisma migrate deploy)": "api.rankingFail",
    "Sala inválida ou partida já terminada": "api.roomOrEnded",
    "Xeque-mate — vitória das brancas.": "reason.checkmate.w",
    "Xeque-mate — vitória das pretas.": "reason.checkmate.b",
    "Afogamento — empate.": "reason.stalemate",
    "Material insuficiente — empate.": "reason.insufficient",
    "Tripla repetição — empate.": "reason.repetition",
    "Regra dos 50 lances — empate.": "reason.fifty",
    "Empate.": "reason.draw",
    "Vitória das brancas — oponente ausente (tempo real) por 2+ minutos.": "reason.disconnect_timeout.w",
    "Vitória das pretas — oponente ausente (tempo real) por 2+ minutos.": "reason.disconnect_timeout.b"
  };

  function readStored() {
    try {
      var v = localStorage.getItem(LS_KEY);
      if (v && SUPPORTED[v]) return v;
    } catch (_) {}
    return DEFAULT_LANG;
  }

  var current = readStored();

  function htmlLang() {
    return current === "en" ? "en" : "pt-BR";
  }

  function localeTag() {
    return current === "en" ? "en-US" : "pt-BR";
  }

  function interpolate(str, vars) {
    if (!vars) return str;
    return String(str).replace(/\{(\w+)\}/g, function (_, k) {
      return vars[k] != null ? String(vars[k]) : "";
    });
  }

  function t(key, vars) {
    var table = D[current] || D[DEFAULT_LANG];
    var str = (table && table[key]) || (D[DEFAULT_LANG] && D[DEFAULT_LANG][key]) || key;
    return interpolate(str, vars);
  }

  function apiError(msg, fallbackKey) {
    if (!msg) return t(fallbackKey || "mp.net");
    if (API_MAP[msg]) return t(API_MAP[msg]);
    return msg;
  }

  function matchTypeLabel(entry) {
    var code = entry && entry.matchType;
    if (!code && entry) {
      var mode = String(entry.mode || "").toLowerCase();
      if (mode === "multiplayer" || entry.lobbyId) code = "multiplayer";
      else if (mode === "human") code = "human";
      else code = "engine";
    }
    if (code === "multiplayer") return t("matches.typeMultiplayer");
    if (code === "human") return t("matches.typeHuman");
    return t("matches.typeEngine");
  }

  function matchLocationLabel(entry) {
    var loc = entry && entry.location ? String(entry.location).trim() : "";
    if (!loc) return t("common.na");
    var stripped = loc
      .replace(/^Online\s*·?\s*/i, "")
      .replace(/^Local vs IA\s*·?\s*/i, "")
      .replace(/^Local\s*·?\s*/i, "")
      .trim();
    if (!stripped || /^online$/i.test(stripped)) {
      return entry.matchType === "multiplayer" || entry.lobbyId ? "Online" : t("common.na");
    }
    return stripped;
  }

  function reason(code, winner, fallback) {
    if (code === "checkmate") {
      return t(winner === "b" ? "reason.checkmate.b" : "reason.checkmate.w");
    }
    if (code === "disconnect_timeout") {
      if (winner === "w" || winner === "b") return t("reason.disconnect_timeout." + winner);
      return t("reason.disconnect_timeout");
    }
    if (code) {
      var key = "reason." + code;
      var s = t(key);
      if (s !== key) return s;
    }
    if (fallback && API_MAP[fallback]) return t(API_MAP[fallback]);
    return fallback || t("reason.draw");
  }

  function applyAttr(el, attr, value) {
    if (value == null) return;
    el.setAttribute(attr, value);
  }

  function apply(root) {
    var scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    scope.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    scope.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    scope.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });
    scope.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    scope.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      el.setAttribute("alt", t(el.getAttribute("data-i18n-alt")));
    });
    scope.querySelectorAll("[data-i18n-content]").forEach(function (el) {
      applyAttr(el, "content", t(el.getAttribute("data-i18n-content")));
    });
    var titleEl = document.querySelector("title[data-i18n]");
    if (titleEl) document.title = t(titleEl.getAttribute("data-i18n"));
    document.documentElement.lang = htmlLang();
    syncSwitcher();
  }

  function injectCss() {
    if (document.getElementById("sator-i18n-css")) return;
    var s = document.createElement("style");
    s.id = "sator-i18n-css";
    s.textContent =
      ".lang-switch{position:fixed;top:max(10px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:400;display:flex;gap:8px;pointer-events:auto}" +
      ".lang-switch.lang-switch--left{left:max(12px,env(safe-area-inset-left));right:auto}" +
      ".lang-btn{width:42px;height:30px;padding:3px;border:1px solid rgba(201,168,76,.38);border-radius:5px;background:rgba(8,10,16,.78);cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:border-color .2s,box-shadow .2s,transform .15s}" +
      ".lang-btn svg{width:30px;height:20px;display:block;border-radius:2px;box-shadow:0 1px 2px rgba(0,0,0,.35)}" +
      ".lang-btn.is-active{border-color:#f0cc5a;box-shadow:0 0 14px rgba(201,168,76,.4)}" +
      ".lang-btn:hover{transform:translateY(-1px);border-color:rgba(201,168,76,.75)}" +
      ".lang-btn:focus-visible{outline:2px solid #f0cc5a;outline-offset:2px}";
    document.head.appendChild(s);
  }

  function injectSwitcher() {
    if (document.getElementById("satorLangSwitch")) return;
    var wrap = document.createElement("div");
    wrap.id = "satorLangSwitch";
    wrap.className = "lang-switch";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", t("lang.group"));
    wrap.innerHTML =
      '<button type="button" class="lang-btn" data-lang="en" title="English" aria-label="English">' + FLAG_EN + "</button>" +
      '<button type="button" class="lang-btn" data-lang="pt-BR" title="Português (Brasil)" aria-label="Português (Brasil)">' + FLAG_BR + "</button>";
    if (/chess3d\.html$/i.test(location.pathname || "")) wrap.classList.add("lang-switch--left");
    document.body.insertBefore(wrap, document.body.firstChild);
    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-lang]");
      if (!btn) return;
      setLang(btn.getAttribute("data-lang"));
    });
    syncSwitcher();
  }

  function syncSwitcher() {
    var wrap = document.getElementById("satorLangSwitch");
    if (!wrap) return;
    wrap.setAttribute("aria-label", t("lang.group"));
    wrap.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === current);
    });
  }

  function setLang(lang) {
    if (!SUPPORTED[lang] || lang === current) {
      if (SUPPORTED[lang]) {
        current = lang;
        try { localStorage.setItem(LS_KEY, lang); } catch (_) {}
      }
      apply();
      return;
    }
    current = lang;
    try { localStorage.setItem(LS_KEY, lang); } catch (_) {}
    apply();
    try {
      global.dispatchEvent(new CustomEvent("sator:langchange", { detail: { lang: current } }));
    } catch (_) {}
  }

  function getLang() {
    return current;
  }

  function boot() {
    injectCss();
    if (document.body) {
      injectSwitcher();
      apply();
    }
  }

  document.documentElement.lang = htmlLang();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  global.SatorI18n = {
    t: t,
    apiError: apiError,
    reason: reason,
    matchTypeLabel: matchTypeLabel,
    matchLocationLabel: matchLocationLabel,
    apply: apply,
    setLang: setLang,
    getLang: getLang,
    locale: localeTag,
    htmlLang: htmlLang
  };
})(typeof window !== "undefined" ? window : globalThis);
