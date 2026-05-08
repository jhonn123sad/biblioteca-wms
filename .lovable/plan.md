# Plano de Refatoração e Otimização da Biblioteca WMS

O objetivo é transformar o código atual em uma arquitetura modular, performática e segura, seguindo as melhores práticas de desenvolvimento React.

## Etapa 1: Arquitetura e Separação de Responsabilidades
*   **Extração de Lógica (Hooks):** Mover a lógica de filtragem, ordenação e agrupamento de categorias de `Index.tsx` para um novo hook `useFilteredPrompts`.
*   **Componentização:**
    *   `HighlightCarousel`: Extrair o carrossel de destaques.
    *   `FilterSystem`: Criar um componente dedicado para a barra de filtros e busca.
    *   `PromptGrid`: Componente para gerenciar o layout de grade responsivo.
    *   `BackgroundEffects`: Mover os efeitos visuais de fundo para um componente isolado.

## Etapa 2: Performance e Otimização
*   **Virtualização/Lazy Loading:** Implementar carregamento progressivo para lidar com grandes volumes de prompts.
*   **Otimização de Imagens:** Melhorar a estratégia de thumbnails do Google Drive e adicionar placeholders de carregamento mais suaves.
*   **Memoização Refinada:** Revisar todos os `useMemo` e `useCallback` para garantir que renders desnecessários sejam eliminados.

## Etapa 3: Tratamento de Erros e Robustez
*   **Validação de Dados:** Adicionar verificações rigorosas nos dados vindos da planilha (Google Sheets) para evitar quebras por campos nulos ou formatos inesperados.
*   **Feedback ao Usuário:** Melhorar os estados de erro com mensagens claras e botões de recuperação (Retry).
*   **Logs de Depuração:** Implementar um sistema de log silencioso para monitorar falhas em produção.

## Etapa 4: UI/UX, Acessibilidade e Estilo
*   **Acessibilidade (a11y):** Garantir suporte total a navegação por teclado, contraste adequado (WCAG) e labels ARIA.
*   **Responsividade:** Ajustar breakpoints para garantir uma experiência perfeita em tablets e telas ultra-wide.
*   **Refinamento Estético:** Unificar o sistema de cores e espaçamentos (design tokens) usando Tailwind.

## Etapa 5: Documentação e Manutenibilidade
*   **Comentários Técnicos:** Adicionar JSDoc em todas as funções e hooks.
*   **Limpeza de Código:** Remover redundâncias e simplificar condicionais complexas.

---

### Detalhes Técnicos para Desenvolvedores:
- **Estado Global:** Manter o uso de React Query para cache de dados.
- **Animações:** Otimizar `framer-motion` usando `layout` e `variants` para performance.
- **Segurança:** Validar inputs de busca contra ataques básicos de injeção e garantir que o localStorage seja acessado de forma segura.
