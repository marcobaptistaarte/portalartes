
import React, { useState, useRef } from 'react';
import { Save, LayoutDashboard, FileText, CheckCircle2, AlertCircle, ArrowLeft, Paperclip, X, FileType, Image as ImageIcon, Camera, Layers, GraduationCap, Newspaper, Link as LinkIcon, Globe, Loader2, Sparkles, Plus, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { LEVELS, GRADES_BY_LEVEL, BIMESTERS, RESOURCE_TYPES } from '../constants';
import { ManualPost, EducationLevel, Bimester, ResourceType, MuralPost, NewsItem } from '../types';
import { supabase } from '../supabaseClient';
import { GoogleGenAI } from "@google/genai";

interface AdminSectionProps {
  onBack: () => void;
}

type AdminTab = 'content' | 'mural' | 'news';

// SENHA MESTRA DO PORTAL
const ADMIN_PASSWORD = 'artes2025';

const AdminSection: React.FC<AdminSectionProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Estados de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);

  // --- Estados para Materiais ---
  const [post, setPost] = useState<Partial<ManualPost>>({
    level: 'Educação Infantil',
    grade: '',
    bimester: '1º bimestre',
    resource: 'Planejamento Bimestral',
    title: '',
    content: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- Estados para Mural ---
  const [muralData, setMuralData] = useState({
    professor_nome: '',
    escola_nome: '',
    nivel: 'Ensino Fundamental I' as EducationLevel,
    serie: '',
    titulo_trabalho: '',
    descricao: ''
  });
  const [muralFiles, setMuralFiles] = useState<File[]>([]);

  // --- Estados para Notícias ---
  const [newsData, setNewsData] = useState({
    url: '',
    titulo: '',
    resumo: '',
    imagem_url: '',
    tipo: 'external' as const
  });

  // Função de Login
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

  // Funções de Ajuda
  const handleMuralFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 10);
      setMuralFiles(prev => [...prev, ...filesArray].slice(0, 10));
    }
  };

  const removeMuralFile = (index: number) => {
    setMuralFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fetchNewsMetadata = async () => {
    if (!newsData.url) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Extraia o título, um resumo curto (max 150 caracteres) e sugira uma URL de imagem de destaque (Unsplash ou similar) para este link: ${newsData.url}. Responda apenas em JSON com as chaves: "titulo", "resumo", "imagem_url".`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const data = JSON.parse(response.text);
      setNewsData(prev => ({
        ...prev,
        titulo: data.titulo || '',
        resumo: data.resumo || '',
        imagem_url: data.imagem_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80'
      }));
    } catch (err) {
      console.error("Erro IA:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveMural = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      const photoUrls: string[] = [];
      for (const file of muralFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
        const { data, error: uploadError } = await supabase.storage.from('mural').upload(`fotos/${fileName}`, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('mural').getPublicUrl(`fotos/${fileName}`);
        photoUrls.push(publicUrl);
      }
      const { error } = await supabase.from('mural_posts').insert([{
        professor_nome: muralData.professor_nome,
        escola_nome: muralData.escola_nome,
        nivel: muralData.nivel,
        serie: muralData.serie,
        titulo_trabalho: muralData.titulo_trabalho,
        descricao: muralData.descricao,
        fotos: photoUrls
      }]);
      if (error) throw error;
      setStatus('success');
      setMuralFiles([]);
      setMuralData({ professor_nome: '', escola_nome: '', nivel: 'Ensino Fundamental I', serie: '', titulo_trabalho: '', descricao: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) { setStatus('error'); }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      const { error } = await supabase.from('curated_news').insert([{
        titulo: newsData.titulo,
        resumo: newsData.resumo,
        imagem_url: newsData.imagem_url,
        url_externa: newsData.url,
        tipo: newsData.tipo,
        data_postagem: new Date().toLocaleDateString('pt-BR')
      }]);
      if (error) throw error;
      setStatus('success');
      setNewsData({ url: '', titulo: '', resumo: '', imagem_url: '', tipo: 'external' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) { setStatus('error'); }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      let fileUrl = '';
      if (selectedFile) {
        const fileName = `${Date.now()}-${selectedFile.name}`;
        await supabase.storage.from('materiais').upload(`uploads/${fileName}`, selectedFile);
        const { data: { publicUrl } } = supabase.storage.from('materiais').getPublicUrl(`uploads/${fileName}`);
        fileUrl = publicUrl;
      }
      await supabase.from('materiais_pedagogicos').insert([{
        titulo: post.title,
        nivel: post.level,
        serie: post.grade,
        bimestre: post.bimester,
        tipo_recurso: post.resource,
        conteudo: post.content,
        arquivo_url: fileUrl
      }]);
      setStatus('success');
      setPost({ level: 'Educação Infantil', grade: '', bimester: '1º bimestre', resource: 'Planejamento Bimestral', title: '', content: '' });
      setSelectedFile(null);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) { setStatus('error'); }
  };

  // RENDERIZAÇÃO DA TELA DE LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <button onClick={onBack} className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold mb-8 hover:underline">
          <ArrowLeft size={20} /> Voltar para o Portal
        </button>

        <div className={`w-full max-w-md bg-adventist-blue rounded-[3rem] p-10 shadow-2xl transition-all duration-300 ${loginError ? 'translate-x-2 bg-red-900' : ''}`}>
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-adventist-yellow rounded-[2rem] flex items-center justify-center text-adventist-blue shadow-lg">
              <Lock size={40} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">Acesso Restrito</h2>
              <p className="text-blue-100/70 text-sm">Identifique-se para gerenciar o portal</p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Digite a senha mestra"
                  className="w-full bg-white/10 border-2 border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/30 focus:bg-white/20 focus:border-adventist-yellow outline-none transition-all text-center font-bold tracking-[0.3em]"
                  autoFocus
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button 
                type="submit" 
                className="w-full bg-adventist-yellow text-adventist-blue font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
              >
                Acessar Painel
              </button>
            </form>

            {loginError && (
              <p className="text-adventist-yellow text-xs font-bold animate-pulse">Senha incorreta. Tente novamente.</p>
            )}
          </div>
        </div>
        
        <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">Portal de Artes • 2025</p>
      </div>
    );
  }

  // RENDERIZAÇÃO DO PAINEL (AUTENTICADO)
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold hover:underline">
          <ArrowLeft size={20} /> Voltar para o Portal
        </button>
        <div className="flex items-center gap-2 bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
          <ShieldCheck size={14} /> Modo Administrador Ativo
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-adventist-blue p-8 text-white">
          <div className="flex flex-wrap gap-4">
            <button onClick={() => setActiveTab('content')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'content' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}>
              <FileText size={16} /> Material
            </button>
            <button onClick={() => setActiveTab('mural')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'mural' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}>
              <Camera size={16} /> Mural
            </button>
            <button onClick={() => setActiveTab('news')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'news' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 hover:bg-white/20'}`}>
              <Newspaper size={16} /> Notícia
            </button>
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'content' && (
             <form onSubmit={handleSaveContent} className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <select value={post.level} onChange={e => setPost({...post, level: e.target.value as EducationLevel, grade: ''})} className="p-3 rounded-xl border border-slate-200 text-sm">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <select value={post.grade} onChange={e => setPost({...post, grade: e.target.value})} className="p-3 rounded-xl border border-slate-200 text-sm">
                    <option value="">Série...</option>
                    {post.level && GRADES_BY_LEVEL[post.level as EducationLevel].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <input type="text" placeholder="Título" className="w-full p-3 rounded-xl border border-slate-200" value={post.title} onChange={e => setPost({...post, title: e.target.value})} required />
                <textarea rows={4} placeholder="Conteúdo" className="w-full p-3 rounded-xl border border-slate-200" value={post.content} onChange={e => setPost({...post, content: e.target.value})} required />
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center">
                  <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} id="file-mat" className="hidden" />
                  <label htmlFor="file-mat" className="cursor-pointer text-sm font-bold text-slate-500">{selectedFile ? selectedFile.name : 'Selecionar PDF/Word'}</label>
                </div>
                <button type="submit" disabled={status === 'saving'} className="w-full py-4 bg-adventist-blue text-adventist-yellow rounded-xl font-bold shadow-lg">
                  {status === 'saving' ? 'Salvando...' : 'Publicar Material'}
                </button>
             </form>
          )}

          {activeTab === 'mural' && (
            <form onSubmit={handleSaveMural} className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Nome do Professor" className="p-3 rounded-xl border border-slate-200" value={muralData.professor_nome} onChange={e => setMuralData({...muralData, professor_nome: e.target.value})} required />
                <input type="text" placeholder="Escola / Unidade" className="p-3 rounded-xl border border-slate-200" value={muralData.escola_nome} onChange={e => setMuralData({...muralData, escola_nome: e.target.value})} required />
                <select value={muralData.nivel} onChange={e => setMuralData({...muralData, nivel: e.target.value as EducationLevel})} className="p-3 rounded-xl border border-slate-200">
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <input type="text" placeholder="Série (ex: 5º ano)" className="p-3 rounded-xl border border-slate-200" value={muralData.serie} onChange={e => setMuralData({...muralData, serie: e.target.value})} required />
              </div>
              <input type="text" placeholder="Título do Trabalho" className="w-full p-3 rounded-xl border border-slate-200 font-bold" value={muralData.titulo_trabalho} onChange={e => setMuralData({...muralData, titulo_trabalho: e.target.value})} required />
              <textarea rows={4} placeholder="Explicação pedagógica do projeto..." className="w-full p-3 rounded-xl border border-slate-200" value={muralData.descricao} onChange={e => setMuralData({...muralData, descricao: e.target.value})} required />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase">Fotos (Máx 10)</label>
                  <span className="text-xs text-slate-400">{muralFiles.length}/10 selecionadas</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {muralFiles.map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeMuralFile(i)} className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full"><X size={12} /></button>
                    </div>
                  ))}
                  {muralFiles.length < 10 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-50 text-slate-400">
                      <Plus size={20} />
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleMuralFiles} />
                    </label>
                  )}
                </div>
              </div>

              <button type="submit" disabled={status === 'saving'} className="w-full py-4 bg-adventist-blue text-adventist-yellow rounded-xl font-bold">
                {status === 'saving' ? 'Fazendo Upload...' : 'Publicar no Mural'}
              </button>
            </form>
          )}

          {activeTab === 'news' && (
            <form onSubmit={handleSaveNews} className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Link da Notícia Original</label>
                <div className="flex gap-2">
                  <input type="url" placeholder="https://..." className="flex-1 p-3 rounded-xl border border-slate-200" value={newsData.url} onChange={e => setNewsData({...newsData, url: e.target.value})} required />
                  <button type="button" onClick={fetchNewsMetadata} disabled={isAiLoading || !newsData.url} className="px-4 bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50">
                    {isAiLoading ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                    Puxar com IA
                  </button>
                </div>
              </div>
              <input type="text" placeholder="Título da Notícia" className="w-full p-3 rounded-xl border border-slate-200 font-bold" value={newsData.titulo} onChange={e => setNewsData({...newsData, titulo: e.target.value})} required />
              <textarea placeholder="Resumo curto..." className="w-full p-3 rounded-xl border border-slate-200" value={newsData.resumo} onChange={e => setNewsData({...newsData, resumo: e.target.value})} required />
              <input type="text" placeholder="URL da Imagem de Capa" className="w-full p-3 rounded-xl border border-slate-200 text-xs" value={newsData.imagem_url} onChange={e => setNewsData({...newsData, imagem_url: e.target.value})} required />
              
              {newsData.imagem_url && (
                <div className="aspect-video rounded-xl overflow-hidden border">
                  <img src={newsData.imagem_url} className="w-full h-full object-cover" alt="Preview" />
                </div>
              )}

              <button type="submit" disabled={status === 'saving'} className="w-full py-4 bg-adventist-blue text-adventist-yellow rounded-xl font-bold">
                {status === 'saving' ? 'Salvando...' : 'Publicar Notícia'}
              </button>
            </form>
          )}

          <div className="mt-6 flex justify-center">
             {status === 'success' && <span className="text-green-600 font-bold flex items-center gap-2 animate-bounce"><CheckCircle2/> Operação realizada com sucesso!</span>}
             {status === 'error' && <span className="text-red-600 font-bold flex items-center gap-2"><AlertCircle/> Erro na operação.</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSection;
