export const getEnv = (key: string): string => (Cypress.env(key) as string) ?? '';

export const TIMEOUT = {
  listLoad:     20_000,
  tableData:    15_000,
  searchResult: 15_000,
  actionButton: 10_000,
  successToast: 15_000,
  errorMessage:  8_000,
  pageLoad:     30_000,
  shortAction:   5_000,
} as const;

export const WAIT = {
  short:  1_000,
  medium: 1_500,
  long:   2_000,
  xlong:  2_500,
} as const;
