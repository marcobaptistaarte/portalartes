
import React, { useState, useEffect } from 'react';
import { Smartphone, Apple, Chrome, Share, PlusSquare, Download, Palette, ShieldCheck, CheckCircle, Package } from 'lucide-react';

const AppTutorial: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar se já está rodando como app
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
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
          Transforme em Aplicativo
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Instale o Portal de Artes para que ele apareça na sua lista oficial de aplicativos, sem barras de endereço e com ícone limpo.
        </p>
      </div>

      {isInstalled ? (
        <div className="mb-12 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 p-8 rounded-[2.5rem] text-center">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Você já está usando o Aplicativo!</h3>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Aproveite a experiência em tela cheia.</p>
        </div>
      ) : (
        deferredPrompt && (
          <div className="mb-12 bg-adventist-yellow/20 border-2 border-adventist-yellow p-8 rounded-[2.5rem] text-center shadow-lg animate-pulse">
            <h3 className="text-xl font-bold text-adventist-blue mb-4">Disponível para Instalação Direta!</h3>
            <button 
              onClick={handleInstallClick}
              className="inline-flex items-center gap-3 bg-adventist-blue text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Download size={24} /> Instalar Aplicativo
            </button>
            <p className="mt-4 text-xs font-bold text-adventist-blue/70 uppercase">Recomendado para Android e Windows</p>
          </div>
        )
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Android Section */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-lg space-y-6">
          <div className="flex items-center gap-3">
            <Chrome className="text-adventist-blue" size={24} />
            <h3 className="text-xl font-bold">Android</h3>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-adventist-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-1">1</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Clique em <strong>"Instalar"</strong> no aviso que aparece ou no menu lateral (três pontos) do Chrome.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-adventist-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-1">2</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">O app será gerado e aparecerá na sua <strong>Lista de Aplicativos</strong> (junto ao WhatsApp).</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-adventist-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-1">3</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Você poderá <strong>arrastar o ícone</strong> para pastas ou para sua tela inicial.</p>
            </div>
          </div>
        </div>

        {/* iOS Section */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-lg space-y-6">
          <div className="flex items-center gap-3">
            <Apple className="text-adventist-blue" size={24} />
            <h3 className="text-xl font-bold">iPhone / iPad</h3>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-adventist-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-1">1</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Toque no ícone de <strong>Compartilhar</strong> <Share size={16} className="inline text-adventist-blue" /> no Safari.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-adventist-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-1">2</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Escolha <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={16} className="inline text-adventist-blue" />.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-adventist-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-1">3</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">O Portal abrirá como um app independente, sem as barras do navegador.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vantagens */}
      <div className="mt-16 bg-adventist-blue rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <Palette size={240} />
        </div>
        <h4 className="text-2xl font-bold mb-8 text-center">Por que instalar?</h4>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <Package className="mx-auto mb-4 text-adventist-yellow" size={32} />
            <p className="font-bold mb-2 uppercase text-xs">App Nativo</p>
            <p className="text-xs text-blue-100">Aparece na gaveta de aplicativos do celular.</p>
          </div>
          <div className="text-center">
            <ShieldCheck className="mx-auto mb-4 text-adventist-yellow" size={32} />
            <p className="font-bold mb-2 uppercase text-xs">Ícone Limpo</p>
            <p className="text-xs text-blue-100">Sem o logo do Chrome pendurado no ícone.</p>
          </div>
          <div className="text-center">
            <Smartphone className="mx-auto mb-4 text-adventist-yellow" size={32} />
            <p className="font-bold mb-2 uppercase text-xs">Tela Cheia</p>
            <p className="text-xs text-blue-100">Foco total no conteúdo, como um app de verdade.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppTutorial;
