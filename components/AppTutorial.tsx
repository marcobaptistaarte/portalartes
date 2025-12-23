
import React, { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle, Package, Info, ShieldCheck, Zap } from 'lucide-react';

const AppTutorial: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detecta se já está rodando como app instalado
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("O sistema está preparando os arquivos. Aguarde alguns segundos na página ou tente usar a opção 'Instalar Aplicativo' no menu do Chrome.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <div className="inline-flex p-4 bg-adventist-blue text-adventist-yellow rounded-3xl mb-6 shadow-xl">
          <Zap size={40} className="fill-adventist-yellow" />
        </div>
        <h2 className="text-4xl font-extrabold text-adventist-blue dark:text-adventist-yellow mb-4">
          Instalar Aplicativo Real
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Diferente de um atalho, esta versão será instalada na sua biblioteca de aplicativos, sem o ícone do navegador.
        </p>
      </div>

      {isInstalled ? (
        <div className="mb-12 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 p-8 rounded-[2.5rem] text-center">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <h3 className="text-xl font-bold text-green-700 dark:text-green-400">Portal Instalado com Sucesso!</h3>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Você já pode encontrá-lo na gaveta de apps do seu celular.</p>
        </div>
      ) : (
        <div className="max-w-md mx-auto mb-16">
          {deferredPrompt ? (
            <div className="bg-adventist-blue p-10 rounded-[2.5rem] text-center shadow-2xl border-4 border-adventist-yellow/30">
              <Package className="mx-auto mb-6 text-adventist-yellow" size={56} />
              <h3 className="text-2xl font-bold text-white mb-6">Pronto para Instalar</h3>
              <button 
                onClick={handleInstall}
                className="w-full bg-adventist-yellow text-adventist-blue py-5 rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Download size={24} /> INSTALAR AGORA
              </button>
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 p-10 rounded-[2.5rem] text-center">
              <Info className="mx-auto mb-4 text-slate-400" size={40} />
              <p className="text-slate-500 text-sm">
                Aguardando sinal do sistema... Navegue por alguns segundos e o botão de instalação aparecerá aqui.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="text-adventist-blue" size={24} />
            <h3 className="font-bold text-lg">Vantagens do WebAPK</h3>
          </div>
          <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex gap-2"><span>•</span> Aparece na lista oficial de aplicativos do Android.</li>
            <li className="flex gap-2"><span>•</span> Ícone limpo (sem o logo do Chrome no canto).</li>
            <li className="flex gap-2"><span>•</span> Pode ser movido para a tela inicial ou pastas de apps.</li>
            <li className="flex gap-2"><span>•</span> Abre instantaneamente em tela cheia (Standalone).</li>
          </ul>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-lg border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="text-adventist-blue" size={24} />
            <h3 className="font-bold text-lg">Como saber se instalou?</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Após clicar em instalar, o Android processa a criação do pacote por alguns segundos. Verifique o progresso nas notificações do seu celular. Quando terminar, ele aparecerá na gaveta onde ficam todos os seus outros apps.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppTutorial;
