import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Camera, 
  Newspaper, 
  Loader2, 
  Sparkles, 
  Plus, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Info
} from 'lucide-react';
import { LEVELS, GRADES_BY_LEVEL, BIMESTERS, RESOURCE_TYPES } from '../constants';
import { ManualPost, EducationLevel, Bimester, ResourceType } from '../types';
import { supabase } from '../supabaseClient';
import { GoogleGenAI } from "@google/genai";

interface AdminSectionProps {
  onBack: () => void;
}

type AdminTab = 'content' | 'mural' | 'news';

const ADMIN_PASSWORD = 'Schlussel01';

const AdminSection: React.FC<AdminSectionProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const [post, setPost] = useState<Partial<ManualPost>>({
    level: 'Educação Infantil',
    grade: '',
    bimester: '1º bimestre',
    resource: 'Conteúdo',
    title: '',
    content: '',
    video_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [muralData, setMuralData] = useState({
    professor_nome: '',
    escola_nome: '',
    nivel: 'Ensino Fundamental I' as EducationLevel,
    serie: '',
    titulo_trabalho: '',
    descricao: ''
  });
  const [muralFiles, setMuralFiles] = useState<File[]>([]);

  const [newsData, setNewsData] = useState({
    url: '',
    titulo: '',
    resumo: '',
    imagem_url: '',
    tipo: 'external' as const
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const fetchVideoMetadata = async () => {
    if (!post.video_url) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise este link de vídeo: ${post.video_url}. Crie um título pedagógico atraente e um resumo curto (max 200 caracteres) explicando como este vídeo pode ser usado em uma aula de Artes. Responda em JSON com "titulo" e "resumo".`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        setPost(prev => ({
          ...prev,
          title: data.titulo || prev.title,
          content: data.resumo || prev.content
        }));
      }
    } catch (err) {
      console.error("Erro IA Vídeo:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchNewsMetadata = async () => {
    if (!newsData.url) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Extraia o título, um resumo curto (max 150 caracteres) e sugira uma URL de imagem de destaque para este link: ${newsData.url}. Responda apenas em JSON com as chaves: "titulo", "resumo", "imagem_url".`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        setNewsData(prev => ({
          ...prev,
          titulo: data.titulo || '',
          resumo: data.resumo || '',
          imagem_url: data.imagem_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80'
        }));
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsAiLoading(false); 
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post.grade) {
      alert("Por favor, selecione a Série antes de salvar.");
      return;
    }

    setStatus('saving');
    setErrorMessage(null);
    
    try {
      let fileUrl = '';
      if (selectedFile) {
        const sanitizedName = selectedFile.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '_')
          .replace(/[^a-zA-Z0-9._-]/g, '');

        const fileName = `${Date.now()}-${sanitizedName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('materiais')
          .upload(`uploads/${fileName}`, selectedFile);

        if (uploadError) {
          throw new Error(`Erro no Storage: ${uploadError.message}. Verifique se o bucket 'materiais' existe e é público.`);
        }

        const { data: { publicUrl } } = supabase.storage.from('materiais').getPublicUrl(`uploads/${fileName}`);
        fileUrl = publicUrl;
      }

      const { error: dbError } = await supabase.from('materiais_pedagogicos').insert([{
        titulo: post.title?.trim(),
        nivel: post.level,
        serie: post.grade,
        bimestre: post.bimester,
        tipo_recurso: post.resource,
        conteudo: post.content?.trim(),
        arquivo_url: fileUrl,
        video_url: post.video_url?.trim() || null
      }]);

      if (dbError) {
        throw new Error(`Erro no Banco de Dados: ${dbError.message}. Verifique se as colunas e as permissões RLS estão corretas.`);
      }

      setStatus('success');
      setPost({ level: 'Educação Infantil', grade: '', bimester: '1º bimestre', resource: 'Conteúdo', title: '', content: '', video_url: '' });
      setSelectedFile(null);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) { 
      console.error("Erro detalhado:", err);
      setErrorMessage(err.message || 'Ocorreu um erro inesperado ao salvar.');
      setStatus('error'); 
    }
  };

  const handleSaveMural = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage(null);
    try {
      const photoUrls: string[] = [];
      for (const file of muralFiles) {
        const sanitizedName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizedName}`;
        
        const { error: uploadError } = await supabase.storage.from('mural').upload(`fotos/${fileName}`, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('mural').getPublicUrl(`fotos/${fileName}`);
        photoUrls.push(publicUrl);
      }

      const { error: dbError } = await supabase.from('mural_posts').insert([{
        professor_nome: muralData.professor_nome,
        escola_nome: muralData.escola_nome,
        nivel: muralData.nivel,
        serie: muralData.serie,
        titulo_trabalho: muralData.titulo_trabalho,
        descricao: muralData.descricao,
        fotos: photoUrls
      }]);

      if (dbError) throw dbError;

      setStatus('success');
      setMuralFiles([]);
      setMuralData({ professor_nome: '', escola_nome: '', nivel: 'Ensino Fundamental I', serie: '', titulo_trabalho: '', descricao: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) { 
      setErrorMessage(err.message || 'Erro ao salvar no mural.');
      setStatus('error'); 
    }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage(null);
    try {
      const { error: dbError } = await supabase.from('curated_news').insert([{
        titulo: newsData.titulo,
        resumo: newsData.resumo,
        imagem_url: newsData.imagem_url,
        url_externa: newsData.url,
        tipo: newsData.tipo,
        data_postagem: new Date().toLocaleDateString('pt-BR')
      }]);

      if (dbError) throw dbError;

      setStatus('success');
      setNewsData({ url: '', titulo: '', resumo: '', imagem_url: '', tipo: 'external' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) { 
      setErrorMessage(err.message || 'Erro ao salvar notícia.');
      setStatus('error'); 
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <button onClick={onBack} className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold mb-8 hover:underline"><ArrowLeft size={20} /> Voltar</button>
        <div className={`w-full max-w-md bg-adventist-blue rounded-[3rem] p-10 shadow-2xl transition-all duration-300 ${loginError ? 'translate-x-2 bg-red-900' : ''}`}>
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-adventist-yellow rounded-[2rem] flex items-center justify-center text-adventist-blue shadow-lg"><Lock size={40} /></div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">Acesso Restrito</h2>
              <p className="text-blue-100/70 text-sm">Digite a senha para gerenciar o portal</p>
            </div>
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Senha mestra" className="w-full bg-white/10 border-2 border-white/10 rounded-2xl py-4 px-6 text-white text-center font-bold tracking-[0.3em] outline-none focus:border-adventist-yellow" autoFocus />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
              <button type="submit" className="w-full bg-adventist-yellow text-adventist-blue font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-all uppercase">Acessar Painel</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold hover:underline"><ArrowLeft size={20} /> Voltar para o Portal</button>
        <div className="flex items-center gap-2 bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-500/20"><ShieldCheck size={14} /> Modo Admin Ativo</div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-adventist-blue p-8 text-white flex gap-4">
          <button onClick={() => setActiveTab('content')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'content' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><FileText size={16} /> Material</button>
          <button onClick={() => setActiveTab('mural')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'mural' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><Camera size={16} /> Mural</button>
          <button onClick={() => setActiveTab('news')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'news' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}><Newspaper size={16} /> Notícia</button>
        </div>

        <div className="p-8">
          {activeTab === 'content' && (
             <form onSubmit={handleSaveContent} className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nível</label>
                    <select value={post.level} onChange={e => setPost({...post, level: e.target.value as EducationLevel, grade: ''})} className="w-full p-3 rounded-xl border border-slate-200 text-sm">
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Série</label>
                    <select value={post.grade} onChange={e => setPost({...post, grade: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 text-sm" required>
                      <option value="">Selecione...</option>
                      {post.level && (GRADES_BY_LEVEL[post.level as EducationLevel] || []).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Bimestre</label>
                    <select value={post.bimester} onChange={e => setPost({...post, bimester: e.target.value as Bimester})} className="w-full p-3 rounded-xl border border-slate-200 text-sm">
                      {BIMESTERS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo de Material</label>
                    <select value={post.resource} onChange={e => setPost({...post, resource: e.target.value as ResourceType})} className="w-full p-3 rounded-xl border border-slate-200 text-sm">
                      {RESOURCE_TYPES.map(r => <option key={r.type} value={r.type}>{r.type}</option>)}
                    </select>
                  </div>
                </div>

                {post.resource === 'Vídeo' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Link do Vídeo (YouTube/Vimeo)</label>
                    <div className="flex gap-2">
                      <input type="url" placeholder="https://..." className="flex-1 p-3 rounded-xl border border-slate-200" value={post.video_url} onChange={e => setPost({...post, video_url: e.target.value})} />
                      <button type="button" onClick={fetchVideoMetadata} disabled={isAiLoading || !post.video_url} className="px-4 bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50">
                        {isAiLoading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>} Mágica com IA
                      </button>
                    </div>
                  </div>
                )}

                <input type="text" placeholder="Título" className="w-full p-3 rounded-xl border border-slate-200 font-bold" value={post.title} onChange={e => setPost({...post, title: e.target.value})} required />
                <textarea rows={4} placeholder="Conteúdo Pedagógico / Descrição" className="w-full p-3 rounded-xl border border-slate-200" value={post.content} onChange={e => setPost({...post, content: e.target.value})} required />
                
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center">
                  <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} id="file-mat" className="hidden" />
                  <label htmlFor="file-mat" className="cursor-pointer text-sm font-bold text-slate-500 block p-2">
                    {selectedFile ? `Arquivo selecionado: ${selectedFile.name}` : 'Selecionar PDF/Arquivo Anexo'}
                  </label>
                </div>
                
                <button type="submit" disabled={status === 'saving'} className="w-full py-4 bg-adventist-blue text-adventist-yellow rounded-xl font-bold shadow-lg uppercase tracking-widest transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50">
                  {status === 'saving' ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20}/> Publicando...</span>
                  ) : 'Publicar Material'}
                </button>
             </form>
          )}

          {activeTab === 'mural' && (
            <form onSubmit={handleSaveMural} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Nome do Professor" className="p-3 rounded-xl border border-slate-200" value={muralData.professor_nome} onChange={e => setMuralData({...muralData, professor_nome: e.target.value})} required />
                <input type="text" placeholder="Escola" className="p-3 rounded-xl border border-slate-200" value={muralData.escola_nome} onChange={e => setMuralData({...muralData, escola_nome: e.target.value})} required />
              </div>
              <input type="text" placeholder="Título do Trabalho" className="w-full p-3 rounded-xl border border-slate-200 font-bold" value={muralData.titulo_trabalho} onChange={e => setMuralData({...muralData, titulo_trabalho: e.target.value})} required />
              <textarea rows={4} placeholder="Explicação..." className="w-full p-3 rounded-xl border border-slate-200" value={muralData.descricao} onChange={e => setMuralData({...muralData, descricao: e.target.value})} required />
              <div className="grid grid-cols-5 gap-2">
                {muralFiles.map((file, i) => (
                  <div key={i} className="relative aspect-square rounded-lg bg-slate-100 overflow-hidden"><img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" /></div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-slate-50"><Plus size={20} /><input type="file" multiple accept="image/*" className="hidden" onChange={e => setMuralFiles([...muralFiles, ...Array.from(e.target.files || [])].slice(0, 10))} /></label>
              </div>
              <button type="submit" className="w-full py-4 bg-adventist-blue text-adventist-yellow rounded-xl font-bold">Publicar no Mural</button>
            </form>
          )}

          {activeTab === 'news' && (
            <form onSubmit={handleSaveNews} className="space-y-6">
              <div className="flex gap-2">
                <input type="url" placeholder="URL da Notícia" className="flex-1 p-3 rounded-xl border border-slate-200" value={newsData.url} onChange={e => setNewsData({...newsData, url: e.target.value})} required />
                <button type="button" onClick={fetchNewsMetadata} className="px-4 bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2"><Sparkles size={18}/> IA</button>
              </div>
              <input type="text" placeholder="Título" className="w-full p-3 rounded-xl border border-slate-200 font-bold" value={newsData.titulo} onChange={e => setNewsData({...newsData, titulo: e.target.value})} required />
              <textarea placeholder="Resumo..." className="w-full p-3 rounded-xl border border-slate-200" value={newsData.resumo} onChange={e => setNewsData({...newsData, resumo: e.target.value})} required />
              <input type="text" placeholder="URL da Imagem" className="w-full p-3 rounded-xl border border-slate-200" value={newsData.imagem_url} onChange={e => setNewsData({...newsData, imagem_url: e.target.value})} required />
              <button type="submit" className="w-full py-4 bg-adventist-blue text-adventist-yellow rounded-xl font-bold">Publicar Notícia</button>
            </form>
          )}

          <div className="mt-6">
             {status === 'success' && (
               <div className="flex items-center justify-center gap-2 text-green-600 font-bold animate-bounce bg-green-50 p-3 rounded-xl border border-green-200">
                 <CheckCircle2 size={20}/> Postado com sucesso!
               </div>
             )}
             {status === 'error' && (
               <div className="space-y-3">
                 <div className="flex items-start gap-2 text-red-600 font-bold bg-red-50 p-4 rounded-xl border border-red-200">
                   <AlertCircle size={20} className="shrink-0 mt-1"/>
                   <div className="space-y-1">
                     <p>Falha ao salvar:</p>
                     <p className="text-xs font-mono bg-white/50 p-2 rounded border border-red-100">{errorMessage}</p>
                   </div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[10px] text-slate-500 space-y-2">
                    <p className="font-bold flex items-center gap-1"><Info size={12}/> POSSÍVEIS SOLUÇÕES NO SUPABASE:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Verifique se o bucket <strong>'materiais'</strong> foi criado no Storage e está como <strong>Public</strong>.</li>
                      <li>Verifique se a tabela <strong>'materiais_pedagogicos'</strong> possui RLS desativado ou uma política de 'INSERT' para a função 'anon'.</li>
                      <li>Confirme se o campo 'conteudo' é do tipo <strong>text</strong> (não varchar).</li>
                    </ul>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSection;
