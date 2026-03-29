# Sator Chess Engine (Node.js) – Tabuleiro Real 8×8

Motor simples (minimax + alpha-beta) usando `chess.js` para regras e uma função de avaliação híbrida:

- **Sator**: TENET (centro/eixo), Perímetro, Porosidade, ROTAS (contrajogo), OPERA (execução).
- **Kasparov-style**: iniciativa, atividade, segurança do rei, tática curta (checks/captures).
- **Sun Tzu**: custo de continuidade do ataque adversário, prevenção, adaptação.

## Instalação
```bash
npm install
```

## Uso

### Melhor lance (posição atual ou inicial)
```bash
npm run bestmove
```

### Melhor lance a partir de um FEN (profundidade 3)
```bash
node src/index.js bestmove --fen "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3" --depth 3
```

### Analisar posição (métricas Sator + heurísticas)
```bash
node src/index.js analyze --fen "FEN_AQUI"
```

## Documentação
Veja `docs/TABULA_SATOR.md` e `docs/diagrams/`.


### Time control (ms)
```bash
node src/index.js bestmove --time 2500 --depth 6
```


## V3
- `npm run selfplay -- <games> <depth> <timeMs>`
- `npm run suite -- <depth> <timeMs>`


## UI (jogar contra o motor)
```bash
npm run server
# abrir http://localhost:3000
```

## Aprendizado evolutivo (auto-tuning)
```bash
npm run evolve -- 30 6 4 600
# iters games depth timeMs
```

## Replay trainer (ajuste leve pós-partida)
```bash
npm run replay -- win|loss|draw
```


## Replay Buffer (automático)
1) Jogue na UI (os replays salvam automaticamente no fim da partida).
2) Construir buffer:
```bash
npm run build-buffer
```
3) Treinar a partir do buffer:
```bash
npm run train-buffer -- 30 4 500
# iters depth timeMs
```
4) Os ajustes ficam em `src/eval/weightsConfig.json`.


## Seed (KasparovSim) – base inicial de replays
Gera replays sintéticos com uma policy agressiva (Kasparov-style) contra o motor.
```bash
npm run seed-kasparov -- 30 7 1800
# games engineDepth engineTimeMs
```
