import { useMemo } from 'react';
import { createGeminiService } from '../services/geminiService';

export const useGemini = () => {
  const geminiService = useMemo(() => {
    // Usar a mesma chave que está sendo usada no TaskModal
    const apiKey = 'AIzaSyDesCM6jbbNy9N8yqq4c1SyXDrM8GeLcl8';
    return createGeminiService(apiKey);
  }, []);

  return geminiService;
};
