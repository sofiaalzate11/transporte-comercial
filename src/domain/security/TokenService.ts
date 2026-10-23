import { AuthUser } from '../models/AuthUser';

export interface JwtClaims {
  sub: string;
  email: string;
  role: string;
  plate?: string;
  iat: number;
  exp: number;
  jti: string;
}

export class TokenService {
  private static readonly SECRET_SALT = 'transporte_colombia_sec_jwt_v1';
  private static readonly TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas

  private static base64UrlEncode(str: string): string {
    const base64 = typeof btoa !== 'undefined'
      ? btoa(str)
      : Buffer.from(str, 'utf-8').toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private static base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return typeof atob !== 'undefined'
      ? atob(base64)
      : Buffer.from(base64, 'base64').toString('utf-8');
  }

  // Firma determinista pseudo-HMAC en TypeScript puro sin librerías externas nativas
  private static generateSignature(input: string): string {
    let hash = 0;
    const combined = `${input}.${this.SECRET_SALT}`;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  public static createToken(user: AuthUser): { token: string; expiresAt: number } {
    const now = Date.now();
    const expiresAt = now + this.TOKEN_EXPIRY_MS;

    const header = { alg: 'HS256', typ: 'JWT' };
    const payload: JwtClaims = {
      sub: user.id,
      email: user.email,
      role: user.role,
      plate: user.vehiclePlate,
      iat: Math.floor(now / 1000),
      exp: Math.floor(expiresAt / 1000),
      jti: `tok-${now}-${Math.random().toString(36).substring(2, 9)}`,
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.generateSignature(`${encodedHeader}.${encodedPayload}`);

    return {
      token: `${encodedHeader}.${encodedPayload}.${signature}`,
      expiresAt,
    };
  }

  public static verifyToken(token: string): { valid: boolean; claims?: JwtClaims; error?: string } {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Formato de token inválido' };
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = this.generateSignature(`${encodedHeader}.${encodedPayload}`);

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Firma de token inválida' };
    }

    try {
      const payloadJson = this.base64UrlDecode(encodedPayload);
      const claims: JwtClaims = JSON.parse(payloadJson);

      const nowSeconds = Math.floor(Date.now() / 1000);
      if (claims.exp < nowSeconds) {
        return { valid: false, error: 'El token ha expirado' };
      }

      return { valid: true, claims };
    } catch {
      return { valid: false, error: 'Error al decodificar claims del token' };
    }
  }
}
