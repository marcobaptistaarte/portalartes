
import React, { useState, useEffect } from 'react';
import { Smartphone, Apple, Chrome, Share, PlusSquare, Download, CheckCircle, Info, ShieldCheck } from 'lucide-react';

const AppTutorial: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Para instalar agora, use o menu do navegador (3 pontos ou Compartilhar) e selecione 'Instalar Aplicativo' ou 'Adicionar à Tela de Início'.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const AppIconPreview = () => (
    <div className="relative mx-auto w-32 h-32 mb-8 group">
      <div className="absolute inset-0 bg-adventist-yellow/20 rounded-[2.5rem] blur-xl group-hover:blur-2xl transition-all"></div>
      <div className="relative w-full h-full bg-adventist-blue rounded-[2.5rem] flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-800 overflow-hidden">
        <svg viewBox="0 0 24 24" className="w-16 h-16 text-adventist-yellow" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      </div>
      <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
        <CheckCircle size={16} />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-16">
        <AppIconPreview />
        <h2 className="text-4xl font-black text-adventist-blue dark:text-adventist-yellow mb-4">
          Instale o Aplicativo
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Tenha o Portal de Artes sempre à mão. Ele não ocupa memória física e funciona como um aplicativo nativo diretamente na sua gaveta de apps.
        </p>
      </div>

      {isInstalled ? (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 p-8 rounded-[2.5rem] text-center mb-16 shadow-lg">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Aplicativo Instalado!</h3>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Você já pode encontrar o Portal na sua lista de aplicativos do celular.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Guia Android */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-adventist-blue/10 rounded-2xl">
                <Chrome className="text-adventist-blue" size={24} />
              </div>
              <h3 className="text-xl font-bold">No Android</h3>
            </div>
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-adventist-blue text-adventist-yellow flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Toque no botão <strong>"Instalar Agora"</strong> abaixo ou no banner do navegador.</p>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-adventist-blue text-adventist-yellow flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">O ícone aparecerá na sua <strong>gaveta de apps</strong> (WebAPK), sem o selo do Chrome.</p>
              </li>
            </ul>
            <button 
              onClick={handleInstallClick}
              className="w-full mt-10 bg-adventist-blue text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-slate-900 transition-all active:scale-95"
            >
              <Download size={20} /> Instalar Agora
            </button>
          </div>

          {/* Guia iOS */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-adventist-blue/10 rounded-2xl">
                <Apple className="text-adventist-blue" size={24} />
              </div>
              <h3 className="text-xl font-bold">No iPhone (iOS)</h3>
            </div>
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-adventist-blue text-adventist-yellow flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">No Safari, toque no botão <strong>Compartilhar</strong> <Share size={16} className="inline text-adventist-blue" />.</p>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-adventist-blue text-adventist-yellow flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Escolha a opção <strong>"Adicionar à Tela de Início"</strong> <PlusSquare size={16} className="inline text-adventist-blue" />.</p>
              </li>
            </ul>
            <div className="mt-10 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-[10px] text-center text-slate-400 uppercase font-bold tracking-widest">
              Processo manual do iOS
            </div>
          </div>
        </div>
      )}

      <div className="bg-adventist-blue rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-md">
            <ShieldCheck size={48} className="text-adventist-yellow" />
          </div>
          <div>
            <h4 className="text-2xl font-bold mb-2">Tecnologia Segura</h4>
            <p className="text-blue-100 leading-relaxed opacity-80">
              O Portal utiliza tecnologia PWA (Progressive Web App). Ele é mais rápido que o site comum, consome menos bateria e não exige atualizações manuais na loja de apps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppTutorial;
