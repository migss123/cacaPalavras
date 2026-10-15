# Documento de Projeto Técnico — caçaPalavras

**Versão:** 1.0  
**Data:** 15 de outubro de 2026  
**Design de referência:** Cordel Elétrico  
**Status:** Especificação para implementação do MVP

## 1. Objetivo

Implementar um jogo casual de adivinhação de palavras em português brasileiro, com uma experiência diária curta e uma opção de partidas livres. O jogador deve descobrir uma palavra de cinco letras em até seis tentativas, recebendo feedback por posição e mantendo o progresso localmente, sem cadastro.

O produto deve preservar a personalidade visual do **Cordel Elétrico**: gráfica, brasileira, artesanal, colorida e tátil, sem copiar a identidade visual ou os elementos proprietários de Termo ou Wordle.

## 2. Escopo do MVP

### Incluído

- Desafio diário com uma palavra de cinco letras.
- Uma palavra igual para todos os jogadores no Brasil.
- Troca do desafio à meia-noite no horário de Brasília.
- Até seis tentativas por partida.
- Modo livre com partidas ilimitadas.
- Validação de palavras em português brasileiro.
- Acentos ignorados na comparação.
- Suporte a letras repetidas.
- Teclado físico e teclado virtual.
- Estatísticas locais e sequência do desafio diário.
- Compartilhamento de resultado sem revelar a resposta.
- Layout responsivo com prioridade para celulares.
- Alto contraste, movimento reduzido e suporte a leitor de tela.

### Fora do MVP

- Cadastro e sincronização entre dispositivos.
- Ranking global.
- Multiplayer em tempo real.
- Anúncios ou monetização.
- Modo difícil.
- Dueto e quarteto.
- Painel administrativo para edição de palavras.
- Definições e conteúdo educativo para cada resposta.

## 3. Direção visual: Cordel Elétrico

### Princípios

1. **Identidade própria:** usar uma linguagem de cartaz popular contemporâneo, sem reproduzir Termo ou Wordle.
2. **Legibilidade antes da decoração:** texturas, sombras e animações não podem comprometer contraste ou leitura.
3. **Sensação tátil:** tiles e botões devem parecer peças impressas ou etiquetas.
4. **Alegria sem excesso:** animações curtas, respostas informais e cores expressivas.
5. **Acessibilidade por padrão:** a informação de estado nunca dependerá apenas de cor.

### Tokens visuais

```css
:root {
  --color-canvas: #fff3d6;
  --color-surface: #fffdf7;
  --color-ink: #24201c;
  --color-blue: #155e75;
  --color-red: #d94841;
  --color-yellow: #f4c542;
  --color-green: #3a8f5b;
  --color-amber: #d99219;
  --color-gray: #6c6258;
  --shadow-print: 0 7px 0 rgb(21 94 117 / 18%);
  --radius-card: 20px;
  --font-heading: Georgia, "Times New Roman", serif;
  --font-body: "Trebuchet MS", Arial, sans-serif;
}
```

Os tokens devem ficar centralizados para permitir ajustes de tema sem alterar componentes individualmente.

### Componentes visuais

- **Cabeçalho:** nome do jogo, identificação do desafio e controles de acessibilidade.
- **Tabuleiro:** seis linhas por cinco colunas, com tiles retangulares, borda azul e sombra curta.
- **Teclado:** três linhas de teclas, com Enter e apagar em tamanho maior.
- **Painel lateral:** estatísticas, distribuição de tentativas e legenda textual.
- **Ações:** compartilhar e iniciar modo livre.
- **Mensagens:** área persistente para erros, dicas e resultado.
- **Resultado:** card com a palavra correta, quantidade de tentativas e ação de compartilhamento.

## 4. Arquitetura recomendada

### Fase inicial

O protótipo atual está em um único [index.html](../index.html). Ele deve continuar executável sem servidor para facilitar demonstrações, mas a implementação do produto deve evoluir para módulos separados:

```text
cacaPalavras/
├── index.html
├── src/
│   ├── main.js
│   ├── game/
│   │   ├── game-state.js
│   │   ├── scoring.js
│   │   ├── daily-challenge.js
│   │   └── word-service.js
│   ├── ui/
│   │   ├── board.js
│   │   ├── keyboard.js
│   │   ├── result-modal.js
│   │   ├── stats-panel.js
│   │   └── announcer.js
│   ├── storage/
│   │   └── local-storage.js
│   └── styles/
│       ├── tokens.css
│       ├── base.css
│       ├── components.css
│       └── utilities.css
├── data/
│   ├── answers.json
│   └── guesses.json
├── tests/
│   ├── scoring.test.js
│   ├── daily-challenge.test.js
│   └── storage.test.js
└── docs/
    └── projeto-tecnico.md
```

### Responsabilidade dos módulos

| Módulo | Responsabilidade |
|---|---|
| `game-state` | Estado atual, linha, tentativa e resultado |
| `scoring` | Avaliação de letras corretas, presentes e ausentes |
| `daily-challenge` | Conversão de data de Brasília em índice da palavra |
| `word-service` | Normalização e validação de palavras |
| `local-storage` | Persistência e migração dos dados locais |
| `board` | Renderização do tabuleiro e estados acessíveis |
| `keyboard` | Teclado virtual e estado das teclas |
| `announcer` | Mensagens para leitores de tela e status visível |
| `stats-panel` | Estatísticas do desafio diário |

## 5. Modelo de estado

```js
const gameState = {
  mode: "daily", // "daily" | "practice"
  puzzleId: "2026-10-15",
  answerLength: 5,
  maxAttempts: 6,
  currentAttempt: "",
  attemptIndex: 0,
  guesses: [],
  evaluations: [],
  phase: "playing", // "playing" | "won" | "lost"
  startedAt: null,
  finishedAt: null
};
```

O estado de uma partida não deve misturar dados do desafio diário com o modo livre. A sequência, a distribuição e o total de jogos do usuário devem considerar apenas partidas diárias.

## 6. Regras de negócio

### Desafio diário

- A resposta tem exatamente cinco letras após a normalização.
- O mesmo `puzzleId` representa a mesma resposta para todos os usuários.
- O `puzzleId` deve ser derivado da data em `America/Sao_Paulo`.
- Uma partida concluída deve permanecer concluída após recarregar a página.
- Uma partida em andamento deve ser restaurada após recarregar a página.
- A sequência aumenta somente quando o desafio diário é vencido.
- Perder ou deixar de concluir um desafio quebra a sequência, conforme a política definida no produto.
- O modo livre não altera a sequência nem a distribuição diária.

### Tentativa

- A palavra digitada deve conter cinco letras.
- Palavra inválida não consome tentativa.
- Cada tentativa válida é avaliada uma única vez.
- Após seis tentativas, a partida termina.
- Após a vitória, novas entradas devem ser bloqueadas.

### Acentos

Para comparar palavras, usar:

```js
function normalizeWord(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}
```

A resposta pode ser armazenada e exibida com acentuação correta, mas `AÇÃO` e `ACAO` devem ser equivalentes nas comparações.

## 7. Algoritmo de avaliação

A avaliação deve marcar primeiro as letras verdes e depois consumir as ocorrências restantes para marcar amarelo. Isso evita classificar incorretamente palavras com letras repetidas.

```js
function evaluateGuess(guess, answer) {
  const result = Array(answer.length).fill("absent");
  const remaining = answer.split("");

  for (let index = 0; index < guess.length; index += 1) {
    if (guess[index] === answer[index]) {
      result[index] = "correct";
      remaining[index] = null;
    }
  }

  for (let index = 0; index < guess.length; index += 1) {
    if (result[index] === "correct") continue;

    const remainingIndex = remaining.indexOf(guess[index]);
    if (remainingIndex !== -1) {
      result[index] = "present";
      remaining[remainingIndex] = null;
    }
  }

  return result;
}
```

### Casos obrigatórios de teste

| Resposta | Tentativa | Resultado esperado |
|---|---|---|
| `FESTA` | `FESTA` | cinco `correct` |
| `FESTA` | `FARDO` | `correct`, `absent`, `absent`, `absent`, `absent` |
| `CARRO` | `RADAR` | respeitar a quantidade de `R` e `A` disponíveis |
| `AÇÃO` | `ACAO` | cinco posições equivalentes após normalização |
| `CASAS` | `SACOS` | letras repetidas avaliadas individualmente |

## 8. Banco de palavras

### Estrutura

```json
{
  "answers": [
    {
      "id": "0001",
      "word": "FESTA",
      "display": "festa",
      "difficulty": "common",
      "reviewed": true
    }
  ],
  "guesses": ["ABRIR", "ACENO", "FESTA"]
}
```

### Critérios de seleção

- Uso comum no português brasileiro.
- Cinco letras após normalização.
- Sem nomes próprios, siglas ou abreviações.
- Sem termos ofensivos ou inadequados.
- Sem regionalismos excessivamente raros no conjunto de respostas.
- Revisão humana antes de entrar na lista oficial.
- Registro da licença e da origem dos dados.

As listas de respostas e de tentativas devem ser distintas. Uma palavra pode ser aceita como tentativa sem ser elegível como resposta diária.

### Distribuição do desafio

Para o MVP estático, o índice pode ser calculado assim:

```js
function getDailyPuzzleId(dateInSaoPaulo) {
  return formatDate(dateInSaoPaulo, "yyyy-MM-dd");
}

function getAnswerIndex(puzzleId, answerCount) {
  return stableHash(puzzleId) % answerCount;
}
```

O hash deve ser determinístico e documentado. Se a lista for reordenada, a distribuição histórica não pode mudar; por isso, a lista publicada deve ser versionada.

Para impedir a descoberta antecipada das respostas em uma versão pública, a distribuição deve migrar para um endpoint ou build diário no futuro.

## 9. Persistência local

### Chaves

```text
cacapalavras:daily:{puzzleId}
cacapalavras:stats
cacapalavras:preferences
cacapalavras:storage-version
```

### Dados diários

```js
{
  puzzleId: "2026-10-15",
  guesses: ["RADIO", "FESTA"],
  evaluations: [["present", "absent", "..."]],
  phase: "won",
  completedAt: "2026-10-15T10:20:00.000Z"
}
```

### Estatísticas

```js
{
  played: 12,
  wins: 11,
  currentStreak: 7,
  maxStreak: 7,
  distribution: { "1": 1, "2": 2, "3": 6, "4": 3, "5": 0, "6": 0 },
  lastCompletedPuzzleId: "2026-10-15"
}
```

O código deve validar os dados lidos antes de usá-los. Dados ausentes, corrompidos ou de versão antiga devem resultar em um estado inicial seguro e em uma mensagem visível no console de desenvolvimento, sem apagar silenciosamente dados válidos.

## 10. Interface e comportamento

### Fluxo inicial

1. Exibir o desafio diário e a instrução resumida.
2. Dar foco ao contexto principal sem abrir modal automaticamente.
3. Permitir entrada por teclado físico ou teclado virtual.
4. Mostrar a letra no tile imediatamente.
5. Ao enviar, validar o tamanho e a existência da palavra.
6. Exibir avaliação por tile e atualizar o teclado.
7. Após vitória ou derrota, abrir o resultado de forma não bloqueante.

### Microcopy

- Início: “Escolha uma letra para começar.”
- Palavra incompleta: “Complete as 5 letras antes de enviar.”
- Palavra inválida: “Essa palavra não está na lista de tentativas.”
- Feedback: “As pistas apareceram. Tente de novo.”
- Vitória: “Boa demais! Você encontrou a palavra.”
- Derrota: “Quase! A palavra era {palavra}.”
- Compartilhamento: “Resultado copiado! Compartilhe sem spoiler.”
- Modo livre: “Novas partidas não alteram sua sequência.”

## 11. Acessibilidade

### Semântica

- `lang="pt-BR"` no elemento `html`.
- Usar `header`, `main`, `section`, `aside`, `nav` e `footer` quando apropriado.
- Usar botões reais para todas as ações.
- Tabuleiro com `role="grid"` e células com `role="gridcell"`.
- Teclado virtual composto por `button`.
- Título da página descritivo.

### Leitor de tela

- Uma região `aria-live="polite"` deve anunciar o resultado da tentativa.
- Cada tile avaliado deve ter rótulo textual, por exemplo: “A: correta”.
- Não anunciar a resposta antes da conclusão da partida.
- Mensagens de erro devem permanecer disponíveis até serem substituídas por uma mensagem nova.

### Teclado e foco

- Letras A–Z inserem caracteres.
- Enter envia a tentativa.
- Backspace remove a última letra.
- Todos os controles devem ser alcançáveis pela tecla Tab.
- O foco deve permanecer visível.
- O botão ativo deve ter estado discernível sem depender apenas de cor.

### Contraste e movimento

- O estado de cada tile deve ser transmitido por cor e texto/ícone.
- O contraste de texto deve atender WCAG 2.2 AA.
- Disponibilizar modo de alto contraste.
- Respeitar `prefers-reduced-motion`.
- Animações de entrada, virada e comemoração devem ser curtas e dispensáveis.
- Não usar vibração, áudio ou tempo limite como requisito para jogar.

## 12. Compartilhamento sem spoiler

O resultado deve ser montado a partir das avaliações armazenadas, nunca a partir da palavra digitada:

```js
function buildShareText(puzzleNumber, evaluations) {
  const symbols = {
    correct: "🟩",
    present: "🟨",
    absent: "⬛"
  };

  const rows = evaluations
    .map(row => row.map(status => symbols[status]).join(""))
    .join("\n");

  return `caçaPalavras #${puzzleNumber}\n${rows}`;
}
```

Usar `navigator.share` quando disponível e `navigator.clipboard.writeText` como alternativa. O fluxo deve apresentar uma confirmação visível e não bloquear o jogador se o navegador negar a permissão.

## 13. Segurança, privacidade e confiabilidade

- Não coletar dados pessoais no MVP.
- Não enviar tentativas ou estatísticas a um servidor.
- Não incluir tokens, chaves ou credenciais no frontend.
- Escapar qualquer texto que venha futuramente de uma fonte remota.
- Não usar `innerHTML` com entrada do jogador.
- Validar mensagens recebidas de APIs antes de renderizar.
- Documentar que limpar os dados do navegador remove o histórico local.

## 14. Estratégia de testes

### Unitários

- Normalização de acentos.
- Avaliação de letras repetidas.
- Validação de tamanho.
- Validação de palavras.
- Cálculo do desafio diário.
- Atualização de sequência.
- Atualização da distribuição.
- Geração do compartilhamento.
- Migração de dados armazenados.

### Integração

- Digitação física completa de uma tentativa.
- Digitação pelo teclado virtual.
- Palavra inválida sem consumir tentativa.
- Vitória bloqueando novas entradas.
- Derrota após seis tentativas.
- Restauração após recarregar a página.
- Alternância entre Cordel Elétrico e modo de acessibilidade.

### Aceitação visual

- Funciona em viewport de 320 px sem rolagem horizontal.
- Mantém a identidade do Cordel Elétrico em desktop e celular.
- Tiles e teclas permanecem legíveis em alto contraste.
- O painel lateral se reorganiza abaixo do tabuleiro em telas estreitas.

### Acessibilidade

- Testar navegação apenas com teclado.
- Testar com leitor de tela.
- Testar `prefers-reduced-motion`.
- Executar auditoria automatizada com axe ou Lighthouse.
- Verificar contraste com ferramenta automatizada e inspeção manual.

## 15. Entrega e deploy

### Desenvolvimento

1. Adicionar lint e testes ao projeto.
2. Extrair o JavaScript do HTML.
3. Extrair tokens e componentes CSS.
4. Adicionar as listas versionadas.
5. Implementar persistência.
6. Executar testes unitários e auditoria de acessibilidade.

### Produção

O MVP pode ser publicado como site estático em GitHub Pages, Netlify ou serviço equivalente. O build deve:

- Validar JSON das listas.
- Executar lint.
- Executar testes.
- Gerar arquivos estáticos.
- Usar nomes de arquivos versionados para ativos cacheáveis.

Uma evolução para PWA pode adicionar `manifest.webmanifest`, service worker e ícones. O cache deve invalidar a lista diária corretamente e nunca servir uma palavra antiga após a troca do desafio.

## 16. Plano de implementação

### Iteração 1 — Fundação

- Estruturar módulos.
- Definir tokens do Cordel Elétrico.
- Extrair tabuleiro e teclado.
- Manter o protótipo visual funcionando.

### Iteração 2 — Motor do jogo

- Implementar estado.
- Implementar normalização.
- Implementar avaliação de letras repetidas.
- Implementar validação de palavras.
- Adicionar testes unitários.

### Iteração 3 — Persistência e modos

- Salvar partida diária.
- Restaurar partida após reload.
- Calcular estatísticas.
- Implementar modo livre isolado.

### Iteração 4 — Resultado e acessibilidade

- Implementar modal ou painel de resultado.
- Implementar compartilhamento.
- Revisar foco e anúncios.
- Adicionar alto contraste e movimento reduzido.

### Iteração 5 — Qualidade e publicação

- Testes responsivos.
- Auditoria WCAG.
- Testes em navegadores Chromium, Firefox e Safari.
- Build e deploy.

## 17. Critérios de aceite do MVP

- [ ] O usuário consegue descobrir uma palavra de cinco letras em até seis tentativas.
- [ ] Uma tentativa inválida não consome uma chance.
- [ ] Acentos não impedem uma resposta correta.
- [ ] Letras repetidas são avaliadas pela quantidade correta.
- [ ] O desafio diário é igual para jogadores na mesma data de Brasília.
- [ ] Uma partida continua no mesmo estado após atualização da página.
- [ ] O modo livre não altera estatísticas nem sequência diárias.
- [ ] Estatísticas e sequência funcionam sem conta.
- [ ] O compartilhamento não revela a palavra.
- [ ] O jogo pode ser operado integralmente pelo teclado.
- [ ] O resultado das letras é compreensível sem depender de cores.
- [ ] A interface é utilizável em uma tela de 320 px de largura.
- [ ] O design Cordel Elétrico é consistente nos estados vazio, preenchido, correto, presente, ausente, vitória e derrota.
- [ ] Testes automatizados cobrem o algoritmo de letras repetidas e a normalização de acentos.

## 18. Riscos e decisões futuras

| Risco | Impacto | Mitigação |
|---|---|---|
| Lista inclui palavras obscuras | Frustração | Curadoria separada de respostas e tentativas |
| Respostas futuras expostas no bundle | Trapaça | Endpoint ou build diário em versão futura |
| Perda do `localStorage` | Perda de sequência | Explicar a limitação e oferecer exportação em versão futura |
| Acessibilidade limitada por animações | Exclusão | Respeitar redução de movimento e fornecer anúncios textuais |
| Diferenças de fuso horário | Desafio inconsistente | Usar `America/Sao_Paulo`, não o relógio local sem conversão |
| Cópia involuntária de referência | Risco de identidade | Manter nome, paleta, textos e ilustrações próprios |

As decisões sobre contas, sincronização, modo difícil, conteúdo educativo e operação remota da palavra diária devem ser tratadas em documentos de produto posteriores, não adicionadas implicitamente ao MVP.
