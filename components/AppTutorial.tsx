
import React, { useState, useEffect } from 'react';
import { Smartphone, Apple, Chrome, Share, PlusSquare, Download, Palette, ShieldCheck, CheckCircle, ArrowDown } from 'lucide-react';

const AppTutorial: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
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
          Instale como um Aplicativo Real
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Não é apenas um atalho. Ao instalar, o Portal de Artes aparecerá na sua lista oficial de aplicativos, terá um ícone limpo e abrirá sem as barras do navegador.
        </p>
      </div>

      {/* Botão de Instalação Dinâmica (Aparece se o navegador suportar) */}
      {deferredPrompt && (
        <div className="mb-12 bg-adventist-yellow/20 border-2 border-adventist-yellow p-8 rounded-[2.5rem] text-center animate-bounce shadow-lg">
          <h3 className="text-xl font-bold text-adventist-blue mb-4">Seu aparelho é compatível!</h3>
          <button 
            onClick={handleInstallClick}
            className="inline-flex items-center gap-3 bg-adventist-blue text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Download size={24} /> Instalar Agora
          </button>
          <p className="mt-4 text-xs font-bold text-adventist-blue/70 uppercase">Recomendado para Android e Windows</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Android Tutorial */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-lg space-y-8">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <Chrome size={24} />
            </div>
            <h3 className="text-xl font-bold">Android (Chrome)</h3>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-adventist-blue">
            <p className="text-sm font-bold text-adventist-blue dark:text-adventist-yellow mb-2 uppercase tracking-wider">Passo 1: O Alerta</p>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Ao navegar pelo site, uma janela ou barra inferior pode aparecer dizendo <strong>"Adicionar Portal de Artes à tela inicial"</strong>.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-adventist-blue">
            <p className="text-sm font-bold text-adventist-blue dark:text-adventist-yellow mb-2 uppercase tracking-wider">Passo 2: Instalar</p>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Toque em <strong>"Instalar"</strong>. O sistema Android criará um ícone limpo (WebAPK) que aparecerá junto aos seus outros apps.
            </p>
          </div>

          <p className="text-xs text-slate-400 italic">
            *Caso não apareça o alerta, use o menu de três pontos no topo do Chrome e escolha "Instalar aplicativo".
          </p>
        </div>

        {/* iPhone Tutorial */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-lg space-y-8">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <Apple size={24} />
            </div>
            <h3 className="text-xl font-bold">iPhone (Safari)</h3>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-adventist-blue">
            <p className="text-sm font-bold text-adventist-blue dark:text-adventist-yellow mb-2 uppercase tracking-wider">Passo 1: Compartilhar</p>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Toque no ícone de <strong>Compartilhar</strong> <Share size={18} className="inline text-adventist-blue" /> na barra inferior do Safari.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-adventist-blue">
            <p className="text-sm font-bold text-adventist-blue dark:text-adventist-yellow mb-2 uppercase tracking-wider">Passo 2: Adicionar</p>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Escolha <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={18} className="inline text-adventist-blue" />. Ele funcionará como um app real ao abrir.
            </p>
          </div>
        </div>
      </div>

      {/* Resultado Visual */}
      <div className="mt-16 bg-adventist-blue rounded-[3rem] p-10 text-center text-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Palette size={200} />
        </div>
        
        <h4 className="text-2xl font-bold mb-8">Diferença do App Instalado</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20">
            <ShieldCheck className="mx-auto mb-4 text-adventist-yellow" size={32} />
            <p className="text-sm font-bold uppercase mb-2">Ícone Limpo</p>
            <p className="text-xs text-blue-100">Sem o logo do navegador no canto do ícone.</p>
          </div>
          <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20">
            <CheckCircle className="mx-auto mb-4 text-adventist-yellow" size={32} />
            <p className="text-sm font-bold uppercase mb-2">Lista de Apps</p>
            <p className="text-xs text-blue-100">Aparece na pesquisa de aplicativos do celular.</p>
          </div>
          <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20">
            <Smartphone className="mx-auto mb-4 text-adventist-yellow" size={32} />
            <p className="text-sm font-bold uppercase mb-2">Tela Inteira</p>
            <p className="text-xs text-blue-100">Remove a barra de endereço e botões do navegador.</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm italic text-blue-200">
            Arraste o ícone para a sua tela principal ou para dentro de pastas como qualquer outro aplicativo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppTutorial;
