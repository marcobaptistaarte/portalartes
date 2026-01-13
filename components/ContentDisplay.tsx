import React from 'react';
import { Download, Share2, Printer, Loader2, BookCheck, FileText, ExternalLink } from 'lucide-react';

interface ContentDisplayProps {
  content: any | null;
  isLoading: boolean;
  error: string | null;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, isLoading, error }) => {
  
  // Processador de formatação de texto (Markdown-like + Custom Tags)
  const renderFormattedLine = (line: string, index: number) => {
    if (!line.trim()) return <br key={index} />;

    let className = "text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-4";
    let contentNode: string = line;

    // 1. Detectar Alinhamento (usando regex global para garantir remoção de todas as tags)
    if (contentNode.includes('[center]')) {
      className += " text-center";
      contentNode = contentNode.replace(/\[center\]/g, '').replace(/\[\/center\]/g, '');
    } else if (contentNode.includes('[right]')) {
      className += " text-right";
      contentNode = contentNode.replace(/\[right\]/g, '').replace(/\[\/right\]/g, '');
    } else if (contentNode.includes('[justify]')) {
      className += " text-justify";
      contentNode = contentNode.replace(/\[justify\]/g, '').replace(/\[\/justify\]/g, '');
    }

    // 2. Detectar Títulos (ORDEM IMPORTANTE: ## antes de #)
    if (contentNode.startsWith('## ')) {
      return <h3 key={index} className="text-xl font-bold text-slate-800 dark:text-white mt-6 mb-3">{parseInlineStyles(contentNode.replace('## ', ''))}</h3>;
    }
    if (contentNode.startsWith('# ')) {
      return <h2 key={index} className="text-2xl font-black text-adventist-blue dark:text-adventist-yellow mt-8 mb-4">{parseInlineStyles(contentNode.replace('# ', ''))}</h2>;
    }

    // 3. Detectar Listas
    if (contentNode.trim().startsWith('- ')) {
      const textOnly = contentNode.trim().replace('- ', '');
      return (
        <li key={index} className={`${className} list-none flex gap-2 ml-4`}>
          <span className="text-adventist-yellow">•</span>
          <span>{parseInlineStyles(textOnly)}</span>
        </li>
      );
    }

    return <p key={index} className={className}>{parseInlineStyles(contentNode)}</p>;
  };

  // Função para processar estilos inline (negrito, itálico, etc)
  const parseInlineStyles = (text: string) => {
    // Ordem: Negrito (**), Itálico (*), Sublinhado (<u>), Tachado (~~)
    let parts: (string | React.ReactElement)[] = [text];

    // Bold
    parts = parts.flatMap(p => typeof p !== 'string' ? p : p.split(/(\*\*.*?\*\*)/g).map(s => 
      s.startsWith('**') && s.endsWith('**') ? <strong key={Math.random()}>{s.slice(2, -2)}</strong> : s
    ));

    // Italic
    parts = parts.flatMap(p => typeof p !== 'string' ? p : p.split(/(\*.*?\*)/g).map(s => 
      s.startsWith('*') && s.endsWith('*') ? <em key={Math.random()}>{s.slice(1, -1)}</em> : s
    ));

    // Underline
    parts = parts.flatMap(p => typeof p !== 'string' ? p : p.split(/(<u>.*?<\/u>)/g).map(s => 
      s.startsWith('<u>') && s.endsWith('</u>') ? <u key={Math.random()}>{s.slice(3, -4)}</u> : s
    ));

    // Strikethrough
    parts = parts.flatMap(p => typeof p !== 'string' ? p : p.split(/(~~.*?~~)/g).map(s => 
      s.startsWith('~~') && s.endsWith('~~') ? <del key={Math.random()}>{s.slice(2, -2)}</del> : s
    ));

    return parts;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-adventist-blue dark:text-adventist-yellow">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-lg font-medium animate-pulse">Consultando base de dados Supabase...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-12 max-w-2xl mx-auto border-2 border-dashed border-slate-200 dark:border-slate-700">
          <BookCheck size={64} className="mx-auto text-slate-300 dark:text-slate-600 mb-6" />
          <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Aguardando Seleção</h4>
          <p className="text-slate-500 dark:text-slate-400">
            Utilize os filtros acima para acessar os materiais pedagógicos oficiais da rede.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b border-slate-100 dark:border-slate-700">
            <div>
              <div className="flex gap-2 mb-4">
                {content.tags?.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 bg-adventist-blue/10 dark:bg-adventist-yellow/10 text-adventist-blue dark:text-adventist-yellow text-[10px] font-bold uppercase rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {content.title}
              </h2>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button className="p-3 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-adventist-blue hover:text-white transition-all">
                <Printer size={20} />
              </button>
              <button className="p-3 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-adventist-blue hover:text-white transition-all">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <article className="max-w-none mb-12">
            {content.content?.split('\n').map((line: string, i: number) => renderFormattedLine(line, i))}
          </article>

          {content.arquivo_url && (
            <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Download className="text-adventist-blue dark:text-adventist-yellow" />
                Material para Download
              </h3>
              <div className="max-w-sm">
                <a
                  href={content.arquivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-adventist-blue/5 dark:bg-adventist-yellow/5 hover:bg-white dark:hover:bg-slate-700 border border-adventist-blue/20 dark:border-adventist-yellow/20 rounded-2xl transition-all hover:shadow-lg hover:border-adventist-blue group text-left"
                >
                  <div className="p-3 bg-white dark:bg-slate-800 text-adventist-blue dark:text-adventist-yellow rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    <FileText size={24} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate pr-2 text-slate-800 dark:text-slate-200">Clique para baixar o anexo</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Link seguro do storage</p>
                  </div>
                  <ExternalLink size={16} className="ml-auto text-slate-400" />
                </a>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-700/50 p-6 px-12 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 dark:border-slate-700 gap-4">
          <p className="text-sm text-slate-400 font-medium italic">© 2026 Portal de Ensino de Artes</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-adventist-yellow animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Sincronizado via Supabase</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDisplay;
