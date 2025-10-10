// components/MessageRenderer.tsx
import React, { useMemo } from 'react';

interface MessageRendererProps {
  content: string;
  isBot?: boolean;
}

type LineType = 
  | 'title' 
  | 'subtitle' 
  | 'listItem' 
  | 'numberedItem' 
  | 'indentedText' 
  | 'separator' 
  | 'empty' 
  | 'normal';

interface ParsedLine {
  type: LineType;
  content: (string | JSX.Element)[];
  indent: number;
  original: string;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ 
  content, 
  isBot = false 
}) => {
  const patterns = useMemo(() => ({
    title: /^[🎓📊📖🏫💪🎯⚠️✨🏆⭐]/,
    subtitle: /^[📚📈🏠👥📝💡]/,
    listItem: /^•/,
    numberedItem: /^\d+\./,
    bold: /\*\*(.*?)\*\*/g,
    link: /\[LINK:(.*?)\]/g, // Nuevo patrón para detectar enlaces
  }), []);

  const parseTextWithFormatting = (text: string, lineIndex: number): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    
    // Regex combinado para bold y links
    const combinedRegex = /(\*\*(.*?)\*\*|\[LINK:(.*?)\])/g;
    let match: RegExpExecArray | null;
    
    while ((match = combinedRegex.exec(text)) !== null) {
      // Agregar texto antes del match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Determinar si es bold o link
      if (match[0].startsWith('**')) {
        // Es texto en negrita
        parts.push(
          <strong 
            key={`bold-${lineIndex}-${match.index}`} 
            className="font-bold text-amber-300"
          >
            {match[2]}
          </strong>
        );
      } else if (match[0].startsWith('[LINK:')) {
        // Es un enlace
        const url = match[3];
        parts.push(
          <a
            key={`link-${lineIndex}-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline decoration-cyan-500/50 hover:decoration-cyan-400 transition-colors duration-200 font-medium"
          >
            Enlace
            <svg 
              className="w-3 h-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
          </a>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Agregar texto restante
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text];
  };

  const detectLineType = (line: string): LineType => {
    const trimmed = line.trim();
    
    if (trimmed === '') return 'empty';
    if (trimmed === '---') return 'separator';
    if (patterns.title.test(trimmed)) return 'title';
    if (patterns.subtitle.test(trimmed)) return 'subtitle';
    if (patterns.listItem.test(trimmed)) return 'listItem';
    if (patterns.numberedItem.test(trimmed)) return 'numberedItem';
    if (line.startsWith('   ') || line.startsWith('      ')) return 'indentedText';
    
    return 'normal';
  };

  const parseLines = (text: string): ParsedLine[] => {
    return text.split('\n').map((line, index) => {
      const type = detectLineType(line);
      const indent = line.search(/\S/) || 0;
      const content = parseTextWithFormatting(line, index);
      
      return { type, content, indent, original: line };
    });
  };

  const renderLine = (parsedLine: ParsedLine, index: number): JSX.Element => {
    const { type, content, indent } = parsedLine;
    const key = `line-${index}`;

    const lineStyles: Record<LineType, { className: string; style?: React.CSSProperties }> = {
      title: {
        className: "text-base font-bold text-cyan-300 mb-2 mt-1 drop-shadow-sm",
      },
      subtitle: {
        className: "text-sm font-semibold text-emerald-300 mb-1.5 mt-2",
      },
      listItem: {
        className: "text-sm text-slate-200 mb-0.5 leading-relaxed",
        style: { marginLeft: indent > 0 ? `${indent * 0.3}rem` : '0' },
      },
      numberedItem: {
        className: "text-sm text-slate-200 mb-1.5 ml-3",
      },
      indentedText: {
        className: "text-sm text-slate-300 mb-0.5 leading-snug",
        style: { marginLeft: `${indent * 0.2}rem` },
      },
      separator: {
        className: "",
      },
      empty: {
        className: "h-1",
      },
      normal: {
        className: "text-sm text-slate-100 mb-0.5 leading-relaxed",
      },
    };

    if (type === 'separator') {
      return <hr key={key} className="my-3 border-cyan-500/30 opacity-40" />;
    }

    const { className, style } = lineStyles[type];
    
    return (
      <div key={key} className={className} style={style}>
        {content}
      </div>
    );
  };

  const renderedContent = useMemo(() => {
    const parsedLines = parseLines(content);
    return parsedLines.map((line, index) => renderLine(line, index));
  }, [content]);

  return (
    <div className="message-content" role={isBot ? "article" : "status"}>
      {renderedContent}
    </div>
  );
};

export default MessageRenderer;