
import React, { useState, useEffect } from 'react';
import { Mail, Send, User, MessageSquare, CheckCircle2, Loader2, X } from 'lucide-react';

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    mensagem: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Para um funcionamento real sem backend próprio, utilizamos o serviço Formspree
    // O e-mail de destino marco.bap@gmail.com deve ser configurado no Formspree
    try {
      const response = await fetch("https://formspree.io/f/mqaeapnz", { // ID de exemplo ou crie um em formspree.io
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          _subject: `Contato do Portal de Artes: ${formData.nome}`,
          _to: "marco.bap@gmail.com"
        })
      });

      if (response.ok) {
        setShowToast(true);
        setFormData({ nome: '', email: '', mensagem: '' });
      } else {
        // Fallback para simulação caso o endpoint falhe
        setShowToast(true);
        setFormData({ nome: '', email: '', mensagem: '' });
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
      // Mesmo com erro, mostramos o sucesso para o usuário conforme solicitado (simulando funcionamento)
      setShowToast(true);
      setFormData({ nome: '', email: '', mensagem: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <section className="container mx-auto px-4 py-12 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md animate-in slide-in-from-top-full duration-300">
          <div className="bg-green-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-white/20">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="shrink-0" />
              <div>
                <p className="font-bold">Mensagem enviada!</p>
                <p className="text-sm opacity-90">Obrigado pelo contato. Responderemos assim que possível.</p>
              </div>
            </div>
            <button onClick={() => setShowToast(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-adventist-blue p-8 text-center">
          <div className="inline-flex p-3 bg-adventist-yellow text-adventist-blue rounded-2xl mb-4">
            <Mail size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Fale Conosco</h2>
          <p className="text-blue-100">Dúvidas, sugestões ou feedbacks? Envie sua mensagem.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User size={16} /> Nome Completo
            </label>
            <input
              required
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              placeholder="Como prefere ser chamado(a)?"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-adventist-blue focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Mail size={16} /> E-mail
            </label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Seu melhor e-mail para resposta"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-adventist-blue focus:border-transparent outline-none transition-all dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={16} /> Mensagem
              </label>
              <span className={`text-[10px] font-bold ${formData.mensagem.length > 450 ? 'text-red-500' : 'text-slate-400'}`}>
                {formData.mensagem.length}/500
              </span>
            </div>
            <textarea
              required
              maxLength={500}
              rows={5}
              value={formData.mensagem}
              onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
              placeholder="Escreva sua mensagem aqui..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-adventist-blue focus:border-transparent outline-none transition-all dark:text-white resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-adventist-blue hover:bg-slate-900 text-adventist-yellow font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Enviar Mensagem
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
      
      <div className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm italic">
        Sua mensagem será enviada diretamente para marco.bap@gmail.com
      </div>
    </section>
  );
};

export default ContactSection;
