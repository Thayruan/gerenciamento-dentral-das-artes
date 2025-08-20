import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Palette, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Digite aqui...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const applyStyle = (style: string, value?: string) => {
    execCommand(style, value);
  };

  const changeColor = () => {
    const color = prompt('Digite uma cor (ex: #ff0000, red, blue):');
    if (color) {
      execCommand('foreColor', color);
    }
  };

  const changeBackgroundColor = () => {
    const color = prompt('Digite uma cor de fundo (ex: #ffff00, yellow, lightblue):');
    if (color) {
      execCommand('hiliteColor', color);
    }
  };

  const insertLink = () => {
    const url = prompt('Digite a URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Negrito (Ctrl+B)', action: () => applyStyle('bold') },
    { icon: Italic, command: 'italic', title: 'Itálico (Ctrl+I)', action: () => applyStyle('italic') },
    { icon: Underline, command: 'underline', title: 'Sublinhado (Ctrl+U)', action: () => applyStyle('underline') },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Alinhar à esquerda', action: () => applyStyle('justifyLeft') },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Centralizar', action: () => applyStyle('justifyCenter') },
    { icon: AlignRight, command: 'justifyRight', title: 'Alinhar à direita', action: () => applyStyle('justifyRight') },
    { icon: List, command: 'insertUnorderedList', title: 'Lista com marcadores', action: () => applyStyle('insertUnorderedList') },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Lista numerada', action: () => applyStyle('insertOrderedList') },
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-100 border border-gray-300 rounded-t-lg">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.action}
            title={button.title}
            className="p-2 text-gray-700 hover:bg-gray-200 rounded transition-colors"
          >
            <button.icon className="h-4 w-4" />
          </button>
        ))}
        
        {/* Separador */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        {/* Botões de cor */}
        <button
          type="button"
          onClick={changeColor}
          title="Cor do texto"
          className="p-2 text-gray-700 hover:bg-gray-200 rounded transition-colors"
        >
          <Palette className="h-4 w-4" />
        </button>
        
        <button
          type="button"
          onClick={changeBackgroundColor}
          title="Cor de fundo"
          className="p-2 text-gray-700 hover:bg-gray-200 rounded transition-colors"
        >
          <div className="h-4 w-4 bg-gradient-to-r from-yellow-200 to-blue-200 rounded border border-gray-300"></div>
        </button>
        
        {/* Separador */}
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        {/* Botão de link */}
        <button
          type="button"
          onClick={insertLink}
          title="Inserir link"
          className="p-2 text-gray-700 hover:bg-gray-200 rounded transition-colors"
        >
          🔗
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          min-h-[120px] p-3 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${isFocused ? 'bg-white' : 'bg-gray-50'}
        `}
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
        data-placeholder={placeholder}
      />
      

    </div>
  );
};

export default RichTextEditor;
