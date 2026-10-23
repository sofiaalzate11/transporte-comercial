import { useState, useEffect } from 'react';
import { AuthRepositoryImpl } from '../../data/repositories/AuthRepositoryImpl';
import { RegisterUseCase } from '../../domain/usecases/RegisterUseCase';
import { LoginUseCase } from '../../domain/usecases/LoginUseCase';
import { VerifyOtpUseCase } from '../../domain/usecases/VerifyOtpUseCase';
import { GetSessionUseCase } from '../../domain/usecases/GetSessionUseCase';
import { useSessionStore } from '../store/useSessionStore';
import { OtpChallenge } from '../../domain/models/AuthUser';

const authRepo = new AuthRepositoryImpl();
const registerUseCase = new RegisterUseCase(authRepo);
const loginUseCase = new LoginUseCase(authRepo);
const verifyOtpUseCase = new VerifyOtpUseCase(authRepo);
const getSessionUseCase = new GetSessionUseCase(authRepo);

export function useAuth() {
  const session = useSessionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);

  // Restaurar sesión al inicializar
  useEffect(() => {
    let mounted = true;
    getSessionUseCase
      .execute()
      .then((saved) => {
        if (mounted && saved) {
          session.setSession(saved);
        }
      })
      .catch(() => {
        // noop
      })
      .finally(() => {
        if (mounted) {
          session.setInitialized(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleRegister = async (email: string, fullName: string, vehiclePlate?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await registerUseCase.execute({ email, fullName, vehiclePlate });
      setChallenge(result.challenge);
      return result.challenge;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar usuario';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginUseCase.execute(email);
      setChallenge(result.challenge);
      return result.challenge;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const activeSession = await verifyOtpUseCase.execute(email, code);
      session.setSession(activeSession);
      setChallenge(null);
      return activeSession;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Código de verificación inválido';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newChallenge = await authRepo.resendOtp(email);
      setChallenge(newChallenge);
      return newChallenge;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al reenviar código';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authRepo.logout();
      session.clearSession();
      setChallenge(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user: session.user,
    token: session.token,
    isAuthenticated: session.isAuthenticated,
    isLoading,
    error,
    challenge,
    register: handleRegister,
    login: handleLogin,
    verifyOtp: handleVerifyOtp,
    resendOtp: handleResendOtp,
    logout: handleLogout,
  };
}
