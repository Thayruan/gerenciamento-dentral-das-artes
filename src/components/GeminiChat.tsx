import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Download, Bot, User, Loader2, RefreshCw, Settings, Plus } from 'lucide-react';
import { useGemini } from '../hooks/useGemini';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  images?: string[];
  isGenerating?: boolean;
}

interface GeminiChatProps {
  students: any[];
}

export const GeminiChat: React.FC<GeminiChatProps> = ({ students }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Sou o assistente IA da Central das Artes. Como posso te ajudar hoje? Posso responder perguntas sobre arte, gerar imagens, ajudar com tarefas dos alunos e muito mais!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>('todos');
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Usar o hook para obter a instância do serviço Gemini
  const geminiService = useGemini();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addMessage = (type: 'user' | 'assistant', content: string, images?: string[]) => {
    const newMessage: Message = {
      id: generateId(),
      type,
      content,
      timestamp: new Date(),
      images
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Adiciona mensagem do usuário
    addMessage('user', userMessage);

    // Adiciona mensagem de "gerando" do assistente
    const generatingMessageId = generateId();
    const generatingMessage: Message = {
      id: generatingMessageId,
      type: 'assistant',
      content: 'Gerando resposta...',
      timestamp: new Date(),
      isGenerating: true
    };
    setMessages(prev => [...prev, generatingMessage]);

    setIsGenerating(true);

    try {
      // Contexto do aluno selecionado
      const studentContext = selectedStudent !== 'todos' 
        ? students.find(s => s.id === selectedStudent)
        : null;

      let contextInfo = '';
      if (studentContext) {
        contextInfo = `\n\nContexto do aluno: ${studentContext.nome} (${studentContext.idade || 'N/A'} anos, ${studentContext.cidade || 'N/A'}, status: ${studentContext.status || 'N/A'})`;
      }

      // Chama a API Gemini
      const response = await geminiService.callGeminiAPI(
        `Você é um assistente especializado em arte e educação artística. Responda de forma útil e criativa para: "${userMessage}"${contextInfo}\n\nResponda em português brasileiro de forma natural e conversacional.`
      );

      // Remove mensagem de "gerando" e adiciona resposta real
      setMessages(prev => prev.filter(msg => msg.id !== generatingMessageId));
      addMessage('assistant', response);

    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      setMessages(prev => prev.filter(msg => msg.id !== generatingMessageId));
      addMessage('assistant', 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!inputMessage.trim() || isGeneratingImage) return;

    const prompt = inputMessage.trim();
    setInputMessage('');
    
    // Adiciona mensagem do usuário
    addMessage('user', `Gerar imagem: ${prompt}`);

    // Adiciona mensagem de "gerando imagem" do assistente
    const generatingMessageId = generateId();
    const generatingMessage: Message = {
      id: generatingMessageId,
      type: 'assistant',
      content: 'Gerando imagem...',
      timestamp: new Date(),
      isGenerating: true
    };
    setMessages(prev => [...prev, generatingMessage]);

    setIsGeneratingImage(true);

    try {
      // Gera múltiplas imagens usando o serviço existente
      const images = await geminiService.generateMultipleReferenceImages(prompt);
      
      // Remove mensagem de "gerando" e adiciona resposta com imagens
      setMessages(prev => prev.filter(msg => msg.id !== generatingMessageId));
      addMessage('assistant', `Aqui estão as imagens geradas para: "${prompt}"`, images);

    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      setMessages(prev => prev.filter(msg => msg.id !== generatingMessageId));
      addMessage('assistant', 'Desculpe, tive um problema ao gerar a imagem. Pode tentar novamente?');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  const downloadImage = (imageUrl: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `imagem_${prompt.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'Olá! Sou o assistente IA da Central das Artes. Como posso te ajudar hoje? Posso responder perguntas sobre arte, gerar imagens, ajudar com tarefas dos alunos e muito mais!',
        timestamp: new Date()
      }
    ]);
  };

  const newChat = () => {
    clearChat();
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar - Estilo ChatGPT */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden`}>
        <div className="p-4">
          {/* Botão Nova Conversa */}
          <button
            onClick={newChat}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nova conversa
          </button>

          {/* Seletor de Aluno */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">Contexto do aluno:</label>
            <select 
              value={selectedStudent} 
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os alunos</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.nome} ({student.cidade || 'N/A'})
                </option>
              ))}
            </select>
            {selectedStudent !== 'todos' && (
              <div className="mt-2 text-xs text-gray-500">
                Contexto: {students.find(s => s.id === selectedStudent)?.nome}
              </div>
            )}
          </div>

          {/* Prompts Rápidos */}
          <div className="mt-6">
            <h3 className="text-xs font-medium text-gray-700 mb-3">Prompts Rápidos:</h3>
            <div className="space-y-2">
              {[
                "Como melhorar o desenho de paisagem?",
                "Técnicas de aquarela para iniciantes",
                "Como criar profundidade no desenho?",
                "Dicas para desenhar retratos realistas",
                "Materiais essenciais para pintura",
                "Como desenvolver criatividade artística?"
              ].map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Total de mensagens: {messages.length}</div>
              <div>Imagens geradas: {messages.filter(m => m.images && m.images.length > 0).reduce((sum, m) => sum + (m.images?.length || 0), 0)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Principal */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
              <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">Assistente IA Gemini</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Limpar chat"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Configurações"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Área de Mensagens - Com padding bottom para o input fixo */}
        <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${
                message.type === 'user' ? 'order-2' : 'order-1'
              }`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  {message.isGenerating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{message.content}</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  )}
                  
                  {/* Imagens geradas */}
                  {message.images && message.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {message.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Imagem gerada ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                              onClick={() => downloadImage(image, message.content)}
                              className="bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100 text-right' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 order-1">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixo na parte inferior */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem ou prompt para imagem..."
                className="w-full px-4 py-3 pr-24 text-sm border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                disabled={isGenerating || isGeneratingImage}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              
              <div className="absolute right-2 bottom-2 flex gap-1">
                <button
                  onClick={handleGenerateImage}
                  disabled={!inputMessage.trim() || isGenerating || isGeneratingImage}
                  className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
                  title="Gerar imagem"
                >
                  {isGeneratingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isGenerating || isGeneratingImage}
                  className="p-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  title="Enviar mensagem"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 text-center">
              Dica: Use Shift+Enter para nova linha, Enter para enviar. Clique no ícone de imagem para gerar imagens!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
