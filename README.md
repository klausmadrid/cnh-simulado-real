# CNH Simulado Real — Starter

Microsaas estático (100% gratuito) para estudo da prova teórica da CNH com:
- **Estudo por tema**
- **Simulado (30 questões)**
- **Revisão espaçada (SRS)** com SM-2 simplificado
- **Progresso local** via `localStorage`
- **PWA** (funciona offline)

> **Base legal de conteúdos**: organização por módulos alinhada à Resolução CONTRAN 789/2020 (consolidada), que define a estrutura do curso teórico: Legislação de Trânsito, Direção Defensiva, Noções de Primeiros Socorros, Meio Ambiente/Cidadania e Noções do Funcionamento do Veículo. **Não copie questões oficiais** dos DETRANs; crie enunciados originais.

## Como publicar grátis (GitHub Pages)
1. Crie uma conta no GitHub.
2. Faça upload desta pasta para um repositório público (ex.: `cnh-simulado-real`).
3. Vá em **Settings → Pages → Deploy from branch** (branch `main`, pasta `/root` ou `/`).
4. Acesse a URL do Pages exibida e navegue no app.

## Como editar o banco de questões
- Edite o arquivo `questions.json`. Cada item tem:
```json
{
  "id": "leg-001",
  "module": "leg",
  "difficulty": 1,
  "stem": "Enunciado...",
  "options": ["A...", "B...", "C...", "D..."],
  "answerIndex": 1,
  "explain": "Explicação objetiva."
}
```
- Módulos válidos: `leg` (Legislação), `dd` (Direção Defensiva), `ps` (Primeiros Socorros), `ma` (Meio Ambiente/Cidadania), `nv` (Noções do Veículo).

## Avisos
- Este projeto é **educativo** e **independente** dos DETRANs.
- Não armazena dados pessoais (tudo fica no navegador).

(c) Starter gerado em 2025-08-27
