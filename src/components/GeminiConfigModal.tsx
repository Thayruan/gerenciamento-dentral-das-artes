import React, { useState } from 'react';
import { X, Save, Key, Sparkles } from 'lucide-react';

interface GeminiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey?: string;
}

export const GeminiConfigModal: React.FC<GeminiConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentApiKey = ''
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert('Por favor, insira uma API key válida');
      return;
    }

    setLoading(true);
    try {
      onSave(apiKey.trim());
      onClose();
    } catch (error) {
      console.error('Erro ao salvar API key:', error);
      alert('Erro ao salvar API key');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="modal-content max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Configurar Gemini AI</h2>
                <p className="text-sm text-gray-600">Configure sua API key para usar IA</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="btn btn-ghost btn-sm icon-hover"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Key className="h-4 w-4 inline mr-2" />
                API Key do Google Gemini
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="input w-full pr-10"
                  placeholder="Insira sua API key do Gemini"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm"
                >
                  {showKey ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Obtenha sua API key em: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Como funciona:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• A IA analisa o título da tarefa</li>
                    <li>• Se houver imagem, analisa o conteúdo visual</li>
                    <li>• Gera descrição, duração e prioridade automaticamente</li>
                    <li>• Fornece dicas técnicas personalizadas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary"
              disabled={loading || !apiKey.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configuração
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiConfigModal;
