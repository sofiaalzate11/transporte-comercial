const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarCorreo(correo: string): string | null {
  const valor = correo.trim();
  if (!valor) {
    return 'Ingresa tu correo electrónico';
  }
  if (!CORREO_REGEX.test(valor)) {
    return 'Ingresa un correo electrónico válido';
  }
  return null;
}

export function validarContrasena(contrasena: string): string | null {
  if (!contrasena) {
    return 'Ingresa una contraseña';
  }
  if (contrasena.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  return null;
}

export function validarRequerido(
  valor: string,
  mensaje: string,
): string | null {
  return valor.trim() ? null : mensaje;
}
