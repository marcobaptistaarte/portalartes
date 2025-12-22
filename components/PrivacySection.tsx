
import React from 'react';
import { ShieldCheck, Lock, Eye, FileWarning } from 'lucide-react';

const PrivacySection: React.FC = () => {
  return (
    <section className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-adventist-blue text-adventist-yellow rounded-2xl">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-adventist-blue dark:text-adventist-yellow">
              Privacidade e Proteção de Dados
            </h2>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border-l-4 border-adventist-blue">
              <p className="m-0 font-medium italic">
                A sua privacidade é importante para nós. O Portal de Ensino de Artes se compromete a tratar os dados pessoais de seus usuários com responsabilidade, transparência e segurança, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold uppercase tracking-wider text-sm">
                  <Eye size={18} /> Uso de Dados
                </div>
                <p>
                  Os dados pessoais eventualmente coletados no portal, como nome, e-mail ou outras informações fornecidas de forma voluntária, são utilizados exclusivamente para finalidades relacionadas ao funcionamento da plataforma, como acesso aos conteúdos, comunicação com o usuário, melhoria da experiência de navegação e organização dos materiais pedagógicos.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold uppercase tracking-wider text-sm">
                  <Lock size={18} /> Sigilo Total
                </div>
                <p>
                  Em nenhuma hipótese os dados pessoais são vendidos, compartilhados ou utilizados para fins comerciais indevidos. O tratamento das informações é realizado apenas quando necessário e sempre respeitando os princípios da finalidade, necessidade e segurança previstos na LGPD.
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-8">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Segurança das Informações
              </h3>
              <p>
                O Portal de Ensino de Artes adota medidas técnicas e organizacionais adequadas para proteger os dados pessoais contra acessos não autorizados, perdas, alterações ou divulgações indevidas.
              </p>
              <p>
                O portal pode utilizar cookies e tecnologias semelhantes para garantir o correto funcionamento das funcionalidades, facilitar a navegação e compreender como os usuários interagem com os conteúdos. O uso dessas tecnologias tem como objetivo exclusivamente a melhoria da experiência do usuário.
              </p>
            </div>

            <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-8">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                Seus Direitos
              </h3>
              <p>
                O usuário tem o direito de solicitar, a qualquer momento, informações sobre os dados pessoais tratados, bem como correção, atualização ou exclusão dessas informações, conforme previsto na LGPD. Para isso, basta entrar em contato pelos canais disponíveis no portal.
              </p>
              <p className="font-semibold text-adventist-blue dark:text-adventist-yellow pt-4">
                Ao utilizar o Portal de Ensino de Artes, você concorda com esta Política de Privacidade e com o tratamento de dados realizado nos termos aqui descritos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacySection;
