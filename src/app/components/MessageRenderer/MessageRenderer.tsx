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
  }), []);

  const parseBoldText = (text: string, lineIndex: number): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    
    const regex = new RegExp(patterns.bold);
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      parts.push(
        <strong 
          key={`bold-${lineIndex}-${match.index}`} 
          className="font-bold text-gray-900"
        >
          {match[1]}
        </strong>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
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
      const content = parseBoldText(line, index);
      
      return { type, content, indent, original: line };
    });
  };

  const renderLine = (parsedLine: ParsedLine, index: number): JSX.Element => {
    const { type, content, indent } = parsedLine;
    const key = `line-${index}`;

    const lineStyles: Record<LineType, { className: string; style?: React.CSSProperties }> = {
      title: {
        className: "text-base font-bold text-white mb-2 mt-1",
      },
      subtitle: {
        className: "text-sm font-semibold text-gray-100 mb-1.5 mt-2",
      },
      listItem: {
        className: "text-sm text-gray-200 mb-0.5 leading-relaxed",
        style: { marginLeft: indent > 0 ? `${indent * 0.3}rem` : '0' },
      },
      numberedItem: {
        className: "text-sm text-gray-200 mb-1.5 ml-3",
      },
      indentedText: {
        className: "text-sm text-gray-300 mb-0.5 leading-snug",
        style: { marginLeft: `${indent * 0.2}rem` },
      },
      separator: {
        className: "",
      },
      empty: {
        className: "h-1",
      },
      normal: {
        className: "text-sm text-gray-200 mb-0.5 leading-relaxed",
      },
    };

    if (type === 'separator') {
      return <hr key={key} className="my-3 border-gray-600 opacity-30" />;
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