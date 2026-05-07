# Como Usar o Stitch para Gerar os Designs

## O que você tem aqui

```
.stitch/
├── DESIGN.md          ← Design System (fonte da verdade)
├── COMO-USAR.md       ← Este guia
└── prompts/
    ├── 01-hoje.md        ← Tela: Hoje (Today Panel)
    ├── 02-dashboard.md   ← Tela: Dashboard
    ├── 03-mapeamento.md  ← Tela: Mapeamento de Produto
    ├── 04-setup.md       ← Tela: Setup da Campanha
    ├── 05-analise.md     ← Tela: Análise e Otimização
    ├── 06-portfolio.md   ← Tela: Portfólio
    ├── 07-comparador.md  ← Tela: Comparador de Produtos
    ├── 08-escala.md      ← Tela: Simulador de Escala
    ├── 09-relatorios.md  ← Tela: Relatórios
    └── 10-historico.md   ← Tela: Histórico de Campanhas
```

---

## Passo a Passo

### Passo 1 — Você entrega a chave API do Stitch
Me passe a API key do Google Stitch via MCP. Eu cuidarei de todo o resto.

### Passo 2 — Criar projeto no Stitch
Eu vou chamar `create_project` (ou `list_projects` se já existir) com o nome "CPC Funnel Pro".

### Passo 3 — Gerar telas em sequência
Para cada arquivo de prompt em `.stitch/prompts/`, eu vou:
1. Ler o conteúdo do prompt
2. Chamar `generate_screen_from_text` com o prompt
3. Baixar o HTML gerado para `.stitch/designs/[nome-da-tela].html`
4. Baixar o screenshot para `.stitch/designs/[nome-da-tela].png`

### Passo 4 — Iterar e refinar
Se alguma tela não ficar como esperado:
- Vou chamar `edit_screens` com instruções de ajuste
- As edições são incrementais — não regeram a tela do zero

### Passo 5 — Exportar / Usar no app
Os HTMLs gerados servem como referência visual para implementar no React.
Você pode apontar para cada arquivo e implementar baseado no design gerado.

---

## Ordem recomendada de geração

1. Dashboard (tela mais complexa — define o padrão visual)
2. Hoje (simples — valida sidebar + topbar)
3. Setup (valida tabs e header de produto)
4. Análise (valida layout 2-colunas com diagnóstico)
5. Mapeamento (valida formulário guiado)
6. Portfólio (valida tabs e lista de produtos)
7. Comparador, Escala, Relatórios, Histórico (telas secundárias)

---

## Notas importantes

- O arquivo `DESIGN.md` deve ser enviado como contexto em TODAS as gerações para manter consistência visual
- Se o Stitch suportar "design system" nativo, importe o DESIGN.md como fonte de tokens
- Os prompts já incluem o design system embutido, então cada tela pode ser gerada independentemente
