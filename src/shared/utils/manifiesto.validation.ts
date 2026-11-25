const CODIGO_MANIFIESTO_REGEX = /^MAN-\d{5}$/;

/** Valida el código público de remesa usado por el rastreo sin login. */
export function validarCodigoManifiesto(codigo: string): string | null {
  const valor = codigo.trim().toUpperCase();
  if (!valor) {
    return 'Ingresa el código de tu remesa';
  }
  if (!CODIGO_MANIFIESTO_REGEX.test(valor)) {
    return 'El código debe tener el formato MAN-XXXXX (por ejemplo MAN-10425)';
  }
  return null;
}

export function normalizarCodigoManifiesto(codigo: string): string {
  return codigo.trim().toUpperCase();
}
