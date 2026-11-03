// Limite total do cenário, incluindo cadastro e trocas de perfil.
// Esperas de elementos continuam locais para indicar qual etapa falhou.
export const timeouts = {
  espera: 30_000,
  padrao: 60_000,
  curto: 90_000,
  avaliacao: 120_000,
  remanejamento: 180_000,
  ajustes: 300_000,
  ajustesComFundacao: 360_000,
} as const;
