# PRD — caçaPalavras

**Versão:** 1.0  
**Data:** 15 de outubro de 2026  
**Status:** MVP em implementação  
**Design escolhido:** Cordel Elétrico

## 1. Visão

O caçaPalavras é um jogo casual de adivinhação de palavras em português brasileiro. A experiência principal consiste em descobrir uma palavra de cinco letras em até seis tentativas, recebendo pistas sobre a posição das letras.

O produto combina um desafio diário curto, compartilhável e igual para todos os jogadores no Brasil com um modo livre para partidas ilimitadas.

## 2. Problema

Jogos de palavras rápidos são fáceis de começar, mas muitas experiências existentes deixam de atender jogadores brasileiros por vocabulário inadequado, pouca atenção a acentos, acessibilidade limitada ou dependência de cadastro.

O caçaPalavras deve oferecer uma experiência simples, acolhedora, acessível e adequada ao português brasileiro, sem exigir conta ou instalação.

## 3. Objetivos

### Objetivos do MVP

- Permitir iniciar uma partida imediatamente.
- Ensinar a mecânica sem tutorial obrigatório.
- Permitir jogar no celular e no desktop.
- Oferecer feedback compreensível por cor, texto e leitor de tela.
- Salvar a partida diária e as estatísticas no navegador.
- Permitir compartilhar o desempenho sem revelar a palavra.
- Criar uma identidade visual própria, colorida e descontraída.

### Não objetivos

- Criar uma rede social.
- Competir em tempo real.
- Monetizar a primeira versão.
- Oferecer ranking global.
- Sincronizar progresso entre dispositivos.
- Incluir modo difícil ou múltiplas palavras no MVP.

## 4. Público-alvo

- Pessoas que falam português brasileiro.
- Jogadores casuais que desejam sessões de poucos minutos.
- Usuários de celular e desktop.
- Pessoas que preferem jogar sem cadastro.
- Usuários que dependem de teclado físico, teclado virtual ou leitor de tela.

## 5. Proposta de valor

> Uma descoberta de palavras rápida, brasileira e divertida, para jogar todos os dias — ou quantas vezes quiser no modo livre.

## 6. Regras do jogo

1. A resposta possui cinco letras.
2. O jogador tem seis tentativas.
3. Tentativas devem ser palavras válidas da lista pt-BR.
4. Verde significa letra correta na posição correta.
5. Amarelo significa letra correta na posição incorreta.
6. Cinza significa letra ausente.
7. Acentos não são obrigatórios e não alteram a comparação.
8. Letras repetidas devem ser avaliadas pela quantidade existente na resposta.
9. Palavra inválida não consome tentativa.
10. O desafio diário usa a mesma resposta para todos no Brasil.
11. O modo livre não altera sequência nem estatísticas diárias.

## 7. Funcionalidades

### F01 — Desafio diário

O sistema deve apresentar uma palavra diária calculada a partir da data no fuso `America/Sao_Paulo`. O desafio muda à meia-noite de Brasília.

### F02 — Modo livre

O usuário pode iniciar partidas adicionais ilimitadas. Cada partida escolhe uma resposta válida e não altera as estatísticas do desafio diário.

### F03 — Entrada de palavras

O usuário pode digitar usando:

- Teclado físico.
- Teclado virtual na interface.
- Backspace para apagar.
- Enter para enviar.

### F04 — Feedback

Após o envio de uma palavra válida, cada letra deve receber seu estado e o teclado deve refletir o melhor estado conhecido da letra.

### F05 — Persistência

Partidas e estatísticas do desafio diário devem ser salvas localmente. Uma partida em andamento deve ser restaurada após atualizar a página.

### F06 — Estatísticas

Exibir:

- Total de partidas diárias.
- Percentual de vitórias.
- Sequência atual.
- Distribuição de vitórias por tentativa.

### F07 — Compartilhamento

Gerar uma grade de emojis sem exibir a palavra ou as letras digitadas. Usar a API de compartilhamento quando disponível e copiar para a área de transferência como alternativa.

### F08 — Acessibilidade

Incluir semântica HTML, foco visível, operação completa por teclado, anúncios em `aria-live`, alto contraste, movimento reduzido e textos alternativos aos estados de cor.

### F09 — Direções visuais

O MVP deve iniciar em Cordel Elétrico. As direções Observatório e Banca permanecem disponíveis como variações para avaliação de design.

## 8. Requisitos de conteúdo

O banco deve separar:

- **Respostas:** palavras comuns, revisadas e adequadas para aparecer como desafio.
- **Tentativas:** conjunto mais amplo de palavras aceitas.

Excluir nomes próprios, siglas, abreviações, termos ofensivos e palavras excessivamente raras da lista de respostas. A licença das fontes deve ser registrada antes da distribuição.

## 9. Requisitos não funcionais

- Responsivo a partir de 320 px de largura.
- Sem dependências externas para executar o MVP.
- Sem cadastro obrigatório.
- Sem envio de tentativas ao servidor.
- Sem uso de `innerHTML` para entrada do usuário.
- Compatível com navegadores modernos.
- Contraste compatível com WCAG 2.2 AA nos fluxos principais.
- Suporte a `prefers-reduced-motion`.

## 10. Critérios de aceite

- [ ] É possível jogar uma partida completa.
- [ ] A palavra correta encerra a partida e mostra o número de tentativas.
- [ ] Seis erros encerram a partida e mostram a resposta.
- [ ] Palavras incompletas ou inválidas exibem erro sem consumir tentativa.
- [ ] Acentos são ignorados na comparação.
- [ ] Letras repetidas são avaliadas corretamente.
- [ ] A atualização da página preserva a partida diária.
- [ ] O modo livre não modifica a sequência diária.
- [ ] O compartilhamento não revela a resposta.
- [ ] O jogo funciona por teclado físico e virtual.
- [ ] Leitor de tela recebe o estado das letras.
- [ ] A interface funciona em celular.
- [ ] O modo Cordel Elétrico mantém consistência visual.

## 11. Métricas futuras

- Partidas iniciadas por dia.
- Taxa de conclusão.
- Taxa de vitória do desafio diário.
- Média de tentativas.
- Retorno no dia seguinte.
- Uso do modo livre.
- Uso do compartilhamento.
- Erros de validação de palavras.

No MVP sem backend, as métricas devem ser usadas apenas em testes locais e não coletadas remotamente.

## 12. Roadmap

### MVP atual

- Jogo diário.
- Modo livre.
- Estatísticas locais.
- Persistência.
- Compartilhamento.
- Acessibilidade.
- Design Cordel Elétrico.

### Próxima versão

- Lista de palavras maior e curada.
- PWA e suporte offline.
- Exportação/importação de estatísticas.
- Modo difícil opcional.
- Página de arquivo de desafios.

### Futuro

- Conta opcional e sincronização.
- Painel editorial para palavras.
- Ranking ou desafios entre amigos.
- Definições educativas.

## 13. Decisões em aberto

- Fonte definitiva e licença da lista de palavras.
- Política para recuperar sequência após ausência.
- Backend para ocultar respostas futuras.
- Nome final e identidade registrada.
- Estratégia de distribuição do PWA.
