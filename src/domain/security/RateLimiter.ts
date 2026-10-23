export type RateLimitAction = 'REQUEST_OTP' | 'VERIFY_OTP' | 'LOGIN_ATTEMPT';

export interface RateLimitRule {
  maxRequests: number;
  windowMs: number;
  cooldownMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface RequestRecord {
  timestamps: number[];
  lastRequestTime: number;
}

export class RateLimiter {
  private static records = new Map<string, RequestRecord>();

  private static readonly RULES: Record<RateLimitAction, RateLimitRule> = {
    REQUEST_OTP: {
      maxRequests: 3,
      windowMs: 5 * 60 * 1000, // 5 minutos
      cooldownMs: 60 * 1000,    // 60 segundos entre reenvíos
    },
    VERIFY_OTP: {
      maxRequests: 5,
      windowMs: 10 * 60 * 1000, // 10 minutos
      cooldownMs: 0,
    },
    LOGIN_ATTEMPT: {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutos
      cooldownMs: 5 * 1000,
    },
  };

  private static getKey(action: RateLimitAction, identifier: string): string {
    return `${action}:${identifier.trim().toLowerCase()}`;
  }

  public static check(action: RateLimitAction, identifier: string): RateLimitResult {
    const key = this.getKey(action, identifier);
    const rule = this.RULES[action];
    const now = Date.now();

    const record = this.records.get(key) || { timestamps: [], lastRequestTime: 0 };
    // Filtrar solicitudes fuera de la ventana de tiempo
    const validTimestamps = record.timestamps.filter((ts) => now - ts < rule.windowMs);

    // Verificar tiempo de enfriamiento entre peticiones individuales
    if (rule.cooldownMs > 0 && record.lastRequestTime > 0) {
      const elapsed = now - record.lastRequestTime;
      if (elapsed < rule.cooldownMs) {
        const retryAfter = Math.ceil((rule.cooldownMs - elapsed) / 1000);
        return {
          allowed: false,
          remaining: Math.max(0, rule.maxRequests - validTimestamps.length),
          retryAfterSeconds: retryAfter,
        };
      }
    }

    if (validTimestamps.length >= rule.maxRequests) {
      const oldest = validTimestamps[0];
      const retryAfter = Math.ceil((rule.windowMs - (now - oldest)) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, retryAfter),
      };
    }

    return {
      allowed: true,
      remaining: rule.maxRequests - validTimestamps.length,
      retryAfterSeconds: 0,
    };
  }

  public static hit(action: RateLimitAction, identifier: string): RateLimitResult {
    const checkResult = this.check(action, identifier);
    if (!checkResult.allowed) {
      return checkResult;
    }

    const key = this.getKey(action, identifier);
    const rule = this.RULES[action];
    const now = Date.now();

    const record = this.records.get(key) || { timestamps: [], lastRequestTime: 0 };
    const validTimestamps = record.timestamps.filter((ts) => now - ts < rule.windowMs);
    validTimestamps.push(now);

    this.records.set(key, {
      timestamps: validTimestamps,
      lastRequestTime: now,
    });

    return {
      allowed: true,
      remaining: rule.maxRequests - validTimestamps.length,
      retryAfterSeconds: 0,
    };
  }

  public static reset(action: RateLimitAction, identifier: string): void {
    const key = this.getKey(action, identifier);
    this.records.delete(key);
  }
}
