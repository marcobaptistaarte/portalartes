
import React, { useState, useEffect } from 'react';
import { Smartphone, Apple, Chrome, Share, PlusSquare, Download, Palette, ShieldCheck, CheckCircle, Package, ArrowRight, Info } from 'lucide-react';

const AppTutorial: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se já está em modo standalone (instalado)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('Evento beforeinstallprompt disparado');
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Detectar quando o app é instalado com sucesso
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Para instalar agora, use o menu de 3 pontos do Chrome e procure por 'Instalar Aplicativo'. Se aparecer 'Adicionar à tela inicial', aguarde alguns segundos até que o sistema reconheça o app completo.");
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuário escolheu: ${outcome}`);
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex p-4 bg-adventist-blue text-adventist-yellow rounded-3xl mb-6 shadow-xl">
          <Smartphone size={40} />
        </div>
        <h2 className="text-4xl font-extrabold text-adventist-blue dark:text-adventist-yellow mb-4">
          Aplicativo Oficial
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Instale o Portal como um aplicativo real. Ele aparecerá na sua lista de apps, poderá ser organizado em pastas e não terá a marca do navegador no ícone.
        </p>
      </div>

      {isInstalled ? (
        <div className="mb-12 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 p-8 rounded-[2.5rem] text-center shadow-lg">
          <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Instalação Concluída!</h3>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            O Portal de Artes já está disponível na sua lista de aplicativos. Procure por ele no menu do seu celular.
          </p>
        </div>
      ) : (
        <div className="mb-12">
          {deferredPrompt ? (
            <div className="bg-adventist-yellow/20 border-2 border-adventist-yellow p-10 rounded-[2.5rem] text-center shadow-xl animate-in zoom-in duration-500">
              <Package className="mx-auto mb-4 text-adventist-blue" size={48} />
              <h3 className="text-2xl font-bold text-adventist-blue mb-2">Pronto para Instalação</h3>
              <p className="text-adventist-blue/70 mb-8 font-medium">Seu dispositivo suporta a instalação nativa.</p>
              <button 
                onClick={handleInstallClick}
                className="inline-flex items-center gap-4 bg-adventist-blue text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                <Download size={24} /> Instalar Agora
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 p-10 rounded-[2.5rem] text-center">
              <Info className="mx-auto mb-4 text-slate-400" size={40} />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Aguardando Reconhecimento</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                O Google Chrome está validando os requisitos. Navegue por algumas páginas do portal e o botão de instalação aparecerá aqui automaticamente.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Guia Android */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-adventist-blue/10 rounded-xl">
              <Chrome className="text-adventist-blue" size={24} />
            </div>
            <h3 className="text-xl font-bold">Instalação no Android</h3>
          </div>
          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="bg-adventist-blue text-adventist-yellow w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Clique no botão <strong>"Instalar Agora"</strong> acima ou no banner que o Chrome mostrará.</p>
            </li>
            <li className="flex gap-4">
              <div className="bg-adventist-blue text-adventist-yellow w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Aguarde o Android criar o <strong>WebAPK</strong>. Isso leva cerca de 20 segundos.</p>
            </li>
            <li className="flex gap-4">
              <div className="bg-adventist-blue text-adventist-yellow w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">O ícone aparecerá na sua <strong>gaveta de aplicativos</strong>, sem o logo do Chrome.</p>
            </li>
          </ul>
        </div>

        {/* Guia iOS */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-adventist-blue/10 rounded-xl">
              <Apple className="text-adventist-blue" size={24} />
            </div>
            <h3 className="text-xl font-bold">Instalação no iPhone</h3>
          </div>
          <ul className="space-y-6">
            <li className="flex gap-4">
              <div className="bg-adventist-blue text-adventist-yellow w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Toque em <strong>Compartilhar</strong> <Share size={16} className="inline text-adventist-blue" /> no Safari.</p>
            </li>
            <li className="flex gap-4">
              <div className="bg-adventist-blue text-adventist-yellow w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={16} className="inline text-adventist-blue" />.</p>
            </li>
            <li className="flex gap-4">
              <div className="bg-adventist-blue text-adventist-yellow w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">O Portal abrirá como um app independente, em tela cheia.</p>
            </li>
          </ul>
        </div>
      </div>

      {/* Informativo Visual */}
      <div className="bg-adventist-blue rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 opacity-10">
          <Palette size={300} />
        </div>
        <div className="relative z-10">
          <h4 className="text-2xl font-bold mb-10 text-center">Por que esta versão é melhor?</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="space-y-4">
              <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="text-adventist-yellow" />
              </div>
              <h5 className="font-bold uppercase text-xs tracking-widest">App Verdadeiro</h5>
              <p className="text-xs text-blue-100 leading-relaxed">Diferente de um atalho comum, ele se integra ao sistema e aparece na lista oficial de apps instalados.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                <CheckCircle className="text-adventist-yellow" />
              </div>
              <h5 className="font-bold uppercase text-xs tracking-widest">Sem Marcações</h5>
              <p className="text-xs text-blue-100 leading-relaxed">O ícone fica limpo, sem aquela bolinha pequena do Chrome ou Safari no canto inferior.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                <Smartphone className="text-adventist-yellow" />
              </div>
              <h5 className="font-bold uppercase text-xs tracking-widest">Tela Infinita</h5>
              <p className="text-xs text-blue-100 leading-relaxed">Ao abrir, as barras de navegação somem, dando lugar a uma experiência de tela cheia imersiva.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppTutorial;
