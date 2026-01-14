import React from 'react';
import { Download, Share2, Printer, Loader2, BookCheck, FileText, ExternalLink, ImageIcon, ArrowRight } from 'lucide-react';

interface ContentDisplayProps {
  content: any | null;
  filteredMaterials?: any[];
  isLoading: boolean;
  error: string | null;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, filteredMaterials = [], isLoading, error }) => {
  
  const stripFormatting = (text: string) => {
    if (!text) return '';
    return text.replace(/\[\/?(center|right|justify)\]/g, '').replace(/<\/?u>/g, '').replace(/[*_~]/g, '').replace(/^#+\s+/gm, '').replace(/\s+/g, ' ').trim();
  };

  const renderFormattedLine = (line: string, index: number) => {
    if (!line.trim()) return <br key={index} />;

    let className = "text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-4";
    let contentNode: string = line;

    // YouTube Embed
    if (contentNode.includes('[youtube]')) {
      const match = contentNode.match(/\[youtube\](.*?)\[\/youtube\]/);
      if (match) {
        return (
          <div key={index} className="my-10 aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-900">
            <iframe 
              src={`https://www.youtube.com/embed/${match[1]}`}
              className="w-full h-full"
              allowFullScreen
              title="YouTube video player"
            ></iframe>
          </div>
        );
      }
    }

    // Spotify Embed
    if (contentNode.includes('[spotify]')) {
      const match = contentNode.match(/\[spotify\](.*?)\[\/spotify\]/);
      if (match) {
        return (
          <div key={index} className="my-8 rounded-3xl overflow-hidden shadow-lg">
            <iframe 
              src={`https://open.spotify.com/embed/${match[1]}`}
              width="100%" 
              height="352" 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy"
              title="Spotify Player"
            ></iframe>
          </div>
        );
      }
    }

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

    if (contentNode.startsWith('## ')) {
      return <h3 key={index} className="text-xl font-bold text-slate-800 dark:text-white mt-6 mb-3">{parseInlineStyles(contentNode.replace('## ', ''))}</h3>;
    }
    if (contentNode.startsWith('# ')) {
      return <h2 key={index} className="text-2xl font-black text-adventist-blue dark:text-adventist-yellow mt-8 mb-4">{parseInlineStyles(contentNode.replace('# ', ''))}</h2>;
    }

    if (contentNode.trim().startsWith('- ')) {
      const textOnly = contentNode.trim().replace('- ', '');
      return (
        <li key={index} className={`${className} list-none flex gap-2 ml-4`}>
          <span className="text-adventist-yellow shrink-0">•</span>
          <span>{parseInlineStyles(textOnly)}</span>
        </li>
      );
    }

    return <p key={index} className={className}>{parseInlineStyles(contentNode)}</p>;
  };

  const parseInlineStyles = (text: string) => {
    let parts: (string | React.ReactElement)[] = [text];

    parts = parts.flatMap(p => typeof p !== 'string' ? p : p.split(/(\[.*?\]\(.*?\))/g).map(s => {
      const match = s.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return <a key={Math.random()} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-adventist-blue dark:text-adventist-yellow underline hover:opacity-80 transition-opacity font-bold">{match[1]}</a>;
      }
      return s;
    }));

    parts = parts.flatMap(p => typeof p !== 'string' ? p : p.split(/(\*\*.*?\*\*)/g).map(s => 
      s.startsWith('**') && s.endsWith('**') ? <strong key={Math.random()}>{s.slice(2, -2)}</strong> : s
    ));

    parts = parts.flatMap(p => typeof p !== 'string' ? p : p.split(/(\*.*?\*)/g).map(s => 
      s.startsWith('*') && s.endsWith('*') ? <em key={Math.random()}>{s.slice(1, -1)}</em> : s
    ));

    parts = parts.flatMap(p => typeof p !== 'string' ? p : p.split(/(<u>.*?<\/u>)/g).map(s => 
      s.startsWith('<u>') && s.endsWith('</u>') ? <u key={Math.random()}>{s.slice(3, -4)}</u> : s
    ));

    return parts;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-adventist-blue dark:text-adventist-yellow">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-lg font-medium animate-pulse">Buscando materiais...</p>
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

  // Caso 1: Exibindo um material específico (Página de Material)
  if (content) {
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
                <button onClick={() => window.print()} className="p-3 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-adventist-blue hover:text-white transition-all">
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

            {content.imagens_galeria && content.imagens_galeria.length > 0 && (
              <div className="my-16 space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="text-adventist-blue dark:text-adventist-yellow" /> Galeria de Fotos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {content.imagens_galeria.map((url: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-3xl overflow-hidden shadow-lg hover:scale-[1.02] transition-transform cursor-zoom-in border border-slate-100 dark:border-slate-800">
                      <img src={url} alt={`Galeria ${idx}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content.arquivo_url && (
              <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Download className="text-adventist-blue dark:text-adventist-yellow" />
                  Material para Download: {content.title}
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
                      <p className="text-sm font-bold truncate pr-2 text-slate-800 dark:text-slate-200">{content.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Clique para baixar o anexo</p>
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
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Portal Artes 2.0</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Caso 2: Exibindo Lista de Resultados do Filtro (Página Inicial)
  if (filteredMaterials.length > 0) {
    return (
      <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-adventist-yellow text-adventist-blue flex items-center justify-center font-bold text-xs">
            {filteredMaterials.length}
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Materiais Encontrados</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMaterials.map((item) => (
            <div 
              key={item.id} 
              className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-adventist-blue/50 transition-all cursor-pointer group flex flex-col h-full"
              onClick={() => window.location.hash = `#/material/${item.id}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-0.5 bg-adventist-blue/10 text-adventist-blue dark:bg-adventist-yellow/10 dark:text-adventist-yellow text-[9px] font-bold uppercase rounded">
                  {item.tipo_recurso}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">{item.serie}</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-adventist-blue dark:group-hover:text-adventist-yellow transition-colors">
                {item.titulo}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-3 mb-6 flex-grow">
                {stripFormatting(item.conteudo)}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.bimestre}</span>
                <div className="text-adventist-blue dark:text-adventist-yellow font-black text-[10px] uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Acessar <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Caso 3: Nenhum material encontrado após filtro
  if (filteredMaterials.length === 0 && !isLoading && !error && filteredMaterials !== null) {
     // Aqui verificamos se já houve uma tentativa de filtro (verificando a prop filteredMaterials)
     // Se filteredMaterials é um array vazio mas já houve interação (level selecionado), mostramos "Não encontrado"
     // Se é o estado inicial, mostramos "Aguardando Seleção"
     return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-12 max-w-2xl mx-auto border-2 border-dashed border-slate-200 dark:border-slate-700">
          <BookCheck size={64} className="mx-auto text-slate-300 dark:text-slate-600 mb-6" />
          <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Aguardando Seleção</h4>
          <p className="text-slate-500 dark:text-slate-400">
            Selecione o Nível de Ensino acima para listar todos os materiais disponíveis. Use os outros filtros para refinar sua busca.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default ContentDisplay;
