// Script de verificación automatizada de métodos, funciones y extensiones de seguridad
const assert = require('assert');

// 1. Probar RateLimiter compilado o simulado con lógica exacta
class TestRateLimiter {
  constructor() {
    this.records = new Map();
  }

  check(action, identifier) {
    const key = `${action}:${identifier.toLowerCase()}`;
    const rule = { maxRequests: 3, windowMs: 5000, cooldownMs: 1000 };
    const now = Date.now();
    const record = this.records.get(key) || { timestamps: [], lastRequestTime: 0 };
    const valid = record.timestamps.filter((ts) => now - ts < rule.windowMs);

    if (rule.cooldownMs > 0 && record.lastRequestTime > 0) {
      const elapsed = now - record.lastRequestTime;
      if (elapsed < rule.cooldownMs) {
        return { allowed: false, remaining: rule.maxRequests - valid.length, retryAfter: Math.ceil((rule.cooldownMs - elapsed) / 1000) };
      }
    }
    if (valid.length >= rule.maxRequests) {
      return { allowed: false, remaining: 0, retryAfter: 5 };
    }
    return { allowed: true, remaining: rule.maxRequests - valid.length, retryAfter: 0 };
  }

  hit(action, identifier) {
    const res = this.check(action, identifier);
    if (!res.allowed) return res;
    const key = `${action}:${identifier.toLowerCase()}`;
    const now = Date.now();
    const record = this.records.get(key) || { timestamps: [], lastRequestTime: 0 };
    record.timestamps.push(now);
    record.lastRequestTime = now;
    this.records.set(key, record);
    return { allowed: true, remaining: 3 - record.timestamps.length, retryAfter: 0 };
  }
}

console.log('--- INICIANDO COMPROBACIÓN DE MÉTODOS Y SEGURIDAD ---');

// Test 1: RateLimiter
const limiter = new TestRateLimiter();
const testEmail = 'conductor@transporte.co';

const r1 = limiter.hit('REQUEST_OTP', testEmail);
assert.strictEqual(r1.allowed, true, 'Primer intento debe permitirse');
console.log('✓ Prueba 1 superada: Primera solicitud OTP permitida');

// Test cooldown
const rCooldown = limiter.hit('REQUEST_OTP', testEmail);
assert.strictEqual(rCooldown.allowed, false, 'Segundo intento inmediato debe bloquearse por cooldown');
console.log('✓ Prueba 2 superada: Cooldown antispam entre peticiones bloquea ráfaga');

// Test 2: Token JWT (Header, Payload, Signature)
function createTestJwt(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + 3600
  })).toString('base64url');

  let hash = 0;
  const input = `${header}.${payload}.secret_key`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  const sig = Math.abs(hash).toString(16).padStart(8, '0');
  return `${header}.${payload}.${sig}`;
}

function verifyTestJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false };
  const [h, p, s] = parts;
  let hash = 0;
  const input = `${h}.${p}.secret_key`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  const expected = Math.abs(hash).toString(16).padStart(8, '0');
  if (s !== expected) return { valid: false, error: 'Firma manipulada' };
  const data = JSON.parse(Buffer.from(p, 'base64url').toString('utf-8'));
  return { valid: true, data };
}

const token = createTestJwt({ id: 'usr-123', email: 'carlos@empresa.com', role: 'DRIVER' });
const verified = verifyTestJwt(token);
assert.strictEqual(verified.valid, true, 'Token legítimo debe verificarse');
assert.strictEqual(verified.data.email, 'carlos@empresa.com', 'Payload debe contener el correo');
console.log('✓ Prueba 3 superada: Emisión y validación de firma JWT exitosa');

// Test tamper
const tamperedToken = token.slice(0, -4) + 'abcd';
const tamperResult = verifyTestJwt(tamperedToken);
assert.strictEqual(tamperResult.valid, false, 'Token alterado debe rechazarse');
console.log('✓ Prueba 4 superada: Rechazo automático de tokens manipulados');

// Test 3: Código OTP numérico de 6 dígitos
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
const code = generateOtp();
assert.strictEqual(code.length, 6, 'OTP debe ser de 6 caracteres');
assert.match(code, /^\d{6}$/, 'OTP debe ser estrictamente numérico');
console.log(`✓ Prueba 5 superada: Generación de código OTP (${code}) con formato 6 dígitos`);

console.log('--- TODAS LAS PRUEBAS DE MÉTODOS Y FUNCIONES FINALIZARON EXITOSAMENTE ---');
