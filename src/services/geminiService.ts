import { GoogleGenAI } from '@google/genai';

interface GeminiTaskData {
  description: string;
  notes?: string;
  referenceImages: string[]; // Array de imagens de referência (IA + internet)
}

interface GeminiRequest {
  title: string;
  imageBase64?: string;
  studentInfo?: string;
}

export class GeminiService {
  private apiKey: string;
  private genAI: GoogleGenAI;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async generateTaskData(request: GeminiRequest): Promise<GeminiTaskData> {
    try {
      const prompt = this.buildPrompt(request);
      const response = await this.callGeminiAPI(prompt, request.imageBase64);
      
      const taskData = this.parseGeminiResponse(response);
      
      // Gerar múltiplas imagens de referência
      try {
        const referenceImages = await this.generateMultipleReferenceImages(request.title);
        taskData.referenceImages = referenceImages;
      } catch (imageError) {
        console.warn('Erro ao gerar imagens de referência:', imageError);
        // Usar imagens padrão se a geração falhar
        taskData.referenceImages = this.getDefaultReferenceImages();
      }
      
      return taskData;
    } catch (error) {
      console.error('Erro ao gerar dados com Gemini:', error);
      throw new Error('Falha ao gerar dados da tarefa com IA');
    }
  }

  private buildPrompt(request: GeminiRequest): string {
    const basePrompt = `
Você é um assistente especializado em criar tarefas artísticas para alunos de desenho e pintura.

Com base no título da tarefa e na imagem de referência (se fornecida), gere uma descrição detalhada formatada em HTML.

INSTRUÇÕES IMPORTANTES:
- Use formatação HTML para tornar a descrição mais atrativa e organizada
- Use <strong> para destacar conceitos importantes e materiais
- Use <em> para técnicas específicas e observações especiais  
- Use <h3> para títulos de seções (SEM emojis)
- Use <ul> e <li> para listas de materiais, etapas ou técnicas
- Use <ol> e <li> para sequências ordenadas de passos
- Use cores com <span style="color: #cor"> para destacar elementos importantes
- Use <blockquote> para citações ou dicas especiais
- Use <a href="URL" target="_blank"> para links úteis de referência, tutoriais ou exemplos
- SEMPRE inclua uma seção "Referências e Tutoriais" com links relevantes:
  * Tutoriais no YouTube sobre a técnica específica
  * Galerias de arte ou Pinterest com exemplos visuais
  * Sites educativos sobre arte quando aplicável
  * Artistas famosos que dominam a técnica mencionada
- Seja específico sobre técnicas, materiais e objetivos
- NÃO use emojis em lugar algum

Título da tarefa: "${request.title}"
${request.studentInfo ? `Informações do aluno: ${request.studentInfo}` : ''}

Responda APENAS com um JSON válido no seguinte formato:
{
  "description": "<h3>Objetivo</h3><p>Descrição formatada em HTML com <strong>negrito</strong>, <em>itálico</em>, <ul><li>listas</li></ul> e <span style='color: #2563eb'>cores</span></p>"
}

EXEMPLO de formatação desejada:
{
  "description": "<h3>Objetivo da Tarefa</h3><p>Criar uma <strong>paisagem urbana</strong> utilizando técnica de <em>aquarela sobre papel</em>.</p><h3>Materiais Necessários</h3><ul><li><strong>Papel aquarela</strong> - 300g/m²</li><li><strong>Pincéis</strong> - redondos nº 6, 10 e 14</li><li><strong>Tintas aquarela</strong> - azul ultramar, ocre amarelo, terra de siena</li></ul><h3>Etapas de Execução</h3><ol><li>Esboço inicial com <em>lápis 2B</em></li><li>Aplicação de <span style='color: #3b82f6'>tons frios</span> no céu</li><li>Detalhamento dos prédios com <span style='color: #f59e0b'>tons quentes</span></li></ol><h3>Referências e Tutoriais</h3><p>Estude exemplos de aquarela urbana em <a href='https://www.youtube.com/results?search_query=aquarela+paisagem+urbana+tutorial' target='_blank'>tutoriais no YouTube</a> e veja obras de <a href='https://www.pinterest.com/search/pins/?q=urban%20watercolor%20painting' target='_blank'>aquarela urbana no Pinterest</a>.</p><blockquote><strong>Dica:</strong> Mantenha as cores do céu mais claras para criar contraste com os edifícios</blockquote>"
}

Seja criativo com a formatação, mas mantenha o conteúdo técnico e educativo.
`;

    return basePrompt;
  }

  async callGeminiAPI(prompt: string, imageBase64?: string): Promise<string> {
    try {
      const model = await this.genAI.models.generateContentStream({
        model: 'gemini-2.0-flash-exp',
        config: {
          responseModalities: ['TEXT'],
        },
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              ...(imageBase64 ? [{
                inlineData: {
                  mimeType: "image/jpeg",
                  data: imageBase64.split(',')[1] // Remove o prefixo data:image/jpeg;base64,
                }
              }] : [])
            ]
          }
        ]
      });

      let responseText = '';
      for await (const chunk of model) {
        if (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].content && chunk.candidates[0].content.parts) {
          const textPart = chunk.candidates[0].content.parts.find((part: any) => part.text);
          if (textPart && textPart.text) {
            responseText += textPart.text;
          }
        }
      }
      
      console.log('Resposta do Gemini recebida com sucesso');
      return responseText;
    } catch (error) {
      console.error('Erro na API do Gemini:', error);
      throw new Error(`Erro na API do Gemini: ${error}`);
    }
  }

  private parseGeminiResponse(response: string): GeminiTaskData {
    try {
      const text = response;
      
      // Extrair JSON da resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validar e normalizar os dados
      return {
        description: parsed.description || 'Descrição não gerada',
        notes: parsed.notes || '',
        referenceImages: [] // Será preenchido posteriormente
      };
    } catch (error) {
      console.error('Erro ao processar resposta do Gemini:', error);
      throw new Error('Falha ao processar resposta da IA');
    }
  }

  async generateMultipleReferenceImages(title: string): Promise<string[]> {
    try {
      console.log('Gerando múltiplas imagens de referência para:', title);
      
      const images: string[] = [];
      
      // 1. Gerar 2-3 imagens com IA do Gemini
      const aiImages = await this.generateAIImages(title, 2);
      images.push(...aiImages);
      
      // 2. Adicionar imagens da internet relacionadas
      const internetImages = await this.getInternetReferenceImages(title);
      images.push(...internetImages);
      
      // 3. Garantir que temos pelo menos 4-6 imagens no total
      if (images.length < 4) {
        const additionalImages = this.getDefaultReferenceImages();
        images.push(...additionalImages.slice(0, 4 - images.length));
      }
      
      console.log(`Total de imagens de referência geradas: ${images.length}`);
      return images;
    } catch (error) {
      console.error('Erro ao gerar múltiplas imagens:', error);
      return this.getDefaultReferenceImages();
    }
  }

  private async generateAIImages(title: string, count: number): Promise<string[]> {
    const images: string[] = [];
    
    try {
      const model = await this.genAI.models.generateContentStream({
        model: 'gemini-2.0-flash-preview-image-generation',
        config: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
        contents: [
          {
            role: 'user',
            parts: [
              { text: `Crie ${count} imagens de referência artísticas para uma tarefa de desenho/pintura com o título: "${title}". 
              
              Cada imagem deve ser:
              - Formato quadrado (1:1)
              - Estilo artístico e educativo
              - Adequada para alunos de arte
              - Mostrar técnicas e conceitos visuais diferentes
              - Inspiradora e clara
              - Cores vibrantes e contrastantes
              - Resolução alta para referência visual
              
              Título da tarefa: ${title}
              
              Gere ${count} imagens únicas e variadas.` }
            ]
          }
        ]
      });

      for await (const chunk of model) {
        if (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].content && chunk.candidates[0].content.parts) {
          const imagePart = chunk.candidates[0].content.parts.find((part: any) => part.inlineData);
          if (imagePart && imagePart.inlineData) {
            const mimeType = imagePart.inlineData.mimeType || 'image/jpeg';
            const base64Data = imagePart.inlineData.data;
            console.log('Imagem IA gerada com sucesso:', mimeType);
            images.push(`data:${mimeType};base64,${base64Data}`);
            
            if (images.length >= count) break;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao gerar imagens com IA:', error);
    }
    
    return images;
  }

  private async getInternetReferenceImages(title: string): Promise<string[]> {
    try {
      // Usar imagens curadas de arte para diferentes temas
      const artImages = this.getCuratedArtImages(title);
      return artImages;
    } catch (error) {
      console.error('Erro ao buscar imagens da internet:', error);
      return [];
    }
  }

  private getCuratedArtImages(title: string): string[] {
    // Imagens curadas baseadas no título da tarefa
    const lowerTitle = title.toLowerCase();
    
    // Imagens de arte em formato quadrado (400x400) de domínio público ou Creative Commons
    const artCollections: { [key: string]: string[] } = {
      // Paisagens e natureza
      paisagem: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=400&fit=crop&crop=center'
      ],
      // Retratos e figuras
      retrato: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1494790108755-2616c6e53ae9?w=400&h=400&fit=crop&crop=center'
      ],
      // Animais
      animal: [
        'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400&h=400&fit=crop&crop=center'
      ],
      // Flores e plantas
      flor: [
        'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1516205651411-aef33a44f7c2?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center'
      ],
      // Arte abstrata
      abstrato: [
        'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center'
      ],
      // Tatuagem
      tatuagem: [
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=400&fit=crop&crop=center'
      ],
      // Default - arte geral
      default: [
        'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8a?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=400&fit=crop&crop=center'
      ]
    };

    // Determinar qual coleção usar baseada no título
    let selectedImages: string[] = artCollections.default;
    
    for (const [keyword, images] of Object.entries(artCollections)) {
      if (lowerTitle.includes(keyword)) {
        selectedImages = images;
        break;
      }
    }

    // Retornar 2-3 imagens aleatórias da coleção selecionada
    const shuffled = [...selectedImages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(3, shuffled.length));
  }

  private getDefaultReferenceImages(): string[] {
    // Retornar imagens SVG padrão de arte em formato quadrado
    return [
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iODAiIGZpbGw9IiM2MEE1RjUiLz4KPHN2ZyB4PSIxNjAiIHk9IjE2MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgN2MtMi43NiAwLTUgMi4yNC01IDVzMi4yNCA1IDUgNSA1LTIuMjQgNS01LTIuMjQtNS01LTV6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0xMDAgMTAwaDIwMHYyMDBIMTAweiIgZmlsbD0iIzYwQTVGNSIvPgo8cGF0aCBkPSJNMTUwIDE1MGgxMDB2MTAwSDE1MHoiIGZpbGw9IiNGRkMxMDciLz4KPC9zdmc+',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwYzU1LjIgMCAxMDAgNDQuOCAxMDAgMTAwcy00NC44IDEwMC0xMDAgMTAwLTEwMC00NC44LTEwMC0xMDBzNDQuOC0xMDAgMTAwLTEwMHoiIGZpbGw9IiNGRkMxMDciLz4KPC9zdmc+',
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTAwaDIwMHYyMDBIMTAweiIgZmlsbD0iIzYwQTVGNSIvPgo8cGF0aCBkPSJNMTUwIDE1MGgxMDB2MTAwSDE1MHoiIGZpbGw9IiNGRkMxMDciLz4KPC9zdmc+'
    ];
  }
}

// Função helper para criar instância do serviço
export const createGeminiService = (apiKey: string): GeminiService => {
  return new GeminiService(apiKey);
};
