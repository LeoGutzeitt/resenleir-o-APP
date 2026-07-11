export const idsIguais = (
  primeiro: string | number | null | undefined,
  segundo: string | number | null | undefined,
) => primeiro != null && segundo != null && String(primeiro) === String(segundo);
