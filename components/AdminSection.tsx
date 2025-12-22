
import React, { useState, useRef } from 'react';
import { Save, LayoutDashboard, FileText, CheckCircle2, AlertCircle, ArrowLeft, Paperclip, X, FileType, Image as ImageIcon, Camera, Layers, GraduationCap, Newspaper, Link as LinkIcon, Globe } from 'lucide-react';
import { LEVELS, GRADES_BY_LEVEL, BIMESTERS, RESOURCE_TYPES } from '../constants';
import { ManualPost, EducationLevel, Bimester, ResourceType, Attachment, MuralPost, NewsItem } from '../types';

interface AdminSectionProps {
  onBack: () => void;
}

type AdminTab = 'content' | 'mural' | 'news';

const AdminSection: React.FC<AdminSectionProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const muralPhotosRef = useRef<HTMLInputElement>(null);

  // Estados para Conteúdo Pedagógico
  const [post, setPost] = useState<Partial<ManualPost>>({
    level: 'Educação Infantil',
    grade: '',
    bimester: '1º bimestre',
    resource: 'Planejamento Bimestral',
    title: '',
    content: '',
    attachments: []
  });

  // Estados para o Mural
  const [muralData, setMuralData] = useState({
    teacherName: '',
    schoolName: '',
    level: 'Educação Infantil' as EducationLevel,
    grade: '',
    workTitle: '',
    description: '',
    photos: [] as string[]
  });

  // Estados para Notícias
  const [newsData, setNewsData] = useState<Partial<NewsItem>>({
    title: '',
    summary: '',
    imageUrl: '',
    type: 'internal',
    externalUrl: '',
    content: ''
  });

  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await convertToBase64(file);
      newAttachments.push({ name: file.name, type: file.type, size: file.size, data: base64 });
    }
    setPost(prev => ({ ...prev, attachments: [...(prev.attachments || []), ...newAttachments] }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleMuralPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (muralData.photos.length + files.length > 6) {
      alert("Máximo de 6 fotos.");
      return;
    }
    const newPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const base64 = await convertToBase64(files[i]);
      newPhotos.push(base64);
    }
    setMuralData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
    if (muralPhotosRef.current) muralPhotosRef.current.value = '';
  };

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post.grade) { alert("Selecione a série."); return; }
    setStatus('saving');
    setTimeout(() => {
      const savedPosts = JSON.parse(localStorage.getItem('manual_posts') || '[]');
      const newPost = { ...post, id: Date.now().toString(), date: new Date().toLocaleDateString('pt-BR') };
      localStorage.setItem('manual_posts', JSON.stringify([...savedPosts, newPost]));
      setStatus('success');
      setPost({ level: 'Educação Infantil', grade: '', bimester: '1º bimestre', resource: 'Planejamento Bimestral', title: '', content: '', attachments: [] });
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  const handleSaveMural = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muralData.grade || muralData.photos.length === 0) {
      alert("Preencha todos os campos e anexe ao menos uma foto.");
      return;
    }
    setStatus('saving');
    setTimeout(() => {
      const savedMural = JSON.parse(localStorage.getItem('mural_posts') || '[]');
      const newPost: MuralPost = {
        id: Date.now().toString(),
        ...muralData,
        date: new Date().toLocaleDateString('pt-BR')
      };
      localStorage.setItem('mural_posts', JSON.stringify([...savedMural, newPost]));
      setStatus('success');
      setMuralData({ teacherName: '', schoolName: '', level: 'Educação Infantil', grade: '', workTitle: '', description: '', photos: [] });
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setTimeout(() => {
      const savedNews = JSON.parse(localStorage.getItem('curated_news') || '[]');
      const newItem: NewsItem = {
        ...(newsData as NewsItem),
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('pt-BR')
      };
      localStorage.setItem('curated_news', JSON.stringify([...savedNews, newItem]));
      setStatus('success');
      setNewsData({ title: '', summary: '', imageUrl: '', type: 'internal', externalUrl: '', content: '' });
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button onClick={onBack} className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow font-bold mb-6 hover:underline">
        <ArrowLeft size={20} /> Voltar para o Portal
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-adventist-blue p-8 text-white">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <LayoutDashboard />
              <h2 className="text-xl font-bold uppercase tracking-widest">Painel Administrativo</h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'content' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <FileText size={18} /> Conteúdo Pedagógico
            </button>
            <button 
              onClick={() => setActiveTab('mural')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'mural' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Camera size={18} /> Mural de Inspirações
            </button>
            <button 
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'news' ? 'bg-adventist-yellow text-adventist-blue' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <Newspaper size={18} /> Notícias
            </button>
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'content' && (
            <form onSubmit={handleSaveContent} className="space-y-8 animate-in fade-in duration-300">
              {/* Conteúdo Pedagógico Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nível</label>
                  <select value={post.level} onChange={e => setPost({...post, level: e.target.value as EducationLevel, grade: ''})} className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Série</label>
                  <select value={post.grade} onChange={e => setPost({...post, grade: e.target.value})} required className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm">
                    <option value="">Selecione...</option>
                    {post.level && GRADES_BY_LEVEL[post.level as EducationLevel].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <input type="text" placeholder="Título da Publicação" className="w-full p-4 rounded-xl border border-slate-200 text-lg font-bold" value={post.title} onChange={e => setPost({...post, title: e.target.value})} required />
              <textarea rows={8} placeholder="Texto Pedagógico..." className="w-full p-4 rounded-xl border border-slate-200 text-sm" value={post.content} onChange={e => setPost({...post, content: e.target.value})} required />
              <div className="flex justify-end gap-4">
                {status === 'success' && <span className="text-green-600 font-bold flex items-center gap-2 animate-in slide-in-from-right"><CheckCircle2/> Salvo!</span>}
                <button type="submit" disabled={status === 'saving'} className="bg-adventist-blue text-adventist-yellow px-10 py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">
                  {status === 'saving' ? 'Salvando...' : 'Publicar Conteúdo'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'mural' && (
            <form onSubmit={handleSaveMural} className="space-y-8 animate-in fade-in duration-300">
               {/* Mural Form */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Professor(a)</label>
                    <input type="text" placeholder="Ex: Prof. Denise" value={muralData.teacherName} onChange={e => setMuralData({...muralData, teacherName: e.target.value})} required className="w-full p-3 rounded-xl border border-slate-200 text-sm" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Escola (Sigla)</label>
                    <input type="text" placeholder="Ex: CAP" value={muralData.schoolName} onChange={e => setMuralData({...muralData, schoolName: e.target.value})} required className="w-full p-3 rounded-xl border border-slate-200 text-sm" />
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><Layers size={14}/> Nível</label>
                    <select value={muralData.level} onChange={e => setMuralData({...muralData, level: e.target.value as EducationLevel, grade: ''})} className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm">
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><GraduationCap size={14}/> Série</label>
                    <select value={muralData.grade} onChange={e => setMuralData({...muralData, grade: e.target.value})} required className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm">
                      <option value="">Selecione...</option>
                      {muralData.level && GRADES_BY_LEVEL[muralData.level].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
               </div>
               <input type="text" placeholder="Título do Trabalho" className="w-full p-4 rounded-xl border border-slate-200 text-lg font-bold" value={muralData.workTitle} onChange={e => setMuralData({...muralData, workTitle: e.target.value})} required />
               <textarea rows={6} placeholder="Instruções..." className="w-full p-4 rounded-xl border border-slate-200 text-sm" value={muralData.description} onChange={e => setMuralData({...muralData, description: e.target.value})} required />
               <div className="flex justify-end gap-4">
                  {status === 'success' && <span className="text-green-600 font-bold flex items-center gap-2 animate-in slide-in-from-right"><CheckCircle2/> Postado!</span>}
                  <button type="submit" disabled={status === 'saving'} className="bg-adventist-blue text-adventist-yellow px-10 py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">
                    {status === 'saving' ? 'Publicando...' : 'Postar no Mural'}
                  </button>
               </div>
            </form>
          )}

          {activeTab === 'news' && (
            <form onSubmit={handleSaveNews} className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={14} /> Tipo de Notícia
                </label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setNewsData({...newsData, type: 'internal'})}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs uppercase transition-all ${newsData.type === 'internal' ? 'border-adventist-blue bg-adventist-blue text-white' : 'border-slate-200 text-slate-400'}`}
                  >
                    Matéria Interna
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewsData({...newsData, type: 'external'})}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs uppercase transition-all ${newsData.type === 'external' ? 'border-adventist-blue bg-adventist-blue text-white' : 'border-slate-200 text-slate-400'}`}
                  >
                    Link Externo
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Título da Notícia" 
                  className="w-full p-4 rounded-xl border border-slate-200 text-lg font-bold" 
                  value={newsData.title} 
                  onChange={e => setNewsData({...newsData, title: e.target.value})} 
                  required 
                />
                <textarea 
                  rows={2} 
                  placeholder="Resumo (Aparece no card da Home)" 
                  className="w-full p-4 rounded-xl border border-slate-200 text-sm" 
                  value={newsData.summary} 
                  onChange={e => setNewsData({...newsData, summary: e.target.value})} 
                  required 
                />
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border">
                  <ImageIcon size={20} className="text-slate-400" />
                  <input 
                    type="url" 
                    placeholder="URL da Imagem de Capa" 
                    className="flex-1 bg-transparent text-sm outline-none" 
                    value={newsData.imageUrl} 
                    onChange={e => setNewsData({...newsData, imageUrl: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              {newsData.type === 'external' ? (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-adventist-blue/30">
                  <LinkIcon size={20} className="text-adventist-blue" />
                  <input 
                    type="url" 
                    placeholder="Cole o link da notícia externa aqui..." 
                    className="flex-1 bg-transparent text-sm outline-none font-bold" 
                    value={newsData.externalUrl} 
                    onChange={e => setNewsData({...newsData, externalUrl: e.target.value})} 
                    required 
                  />
                </div>
              ) : (
                <textarea 
                  rows={8} 
                  placeholder="Escreva a matéria completa..." 
                  className="w-full p-4 rounded-xl border border-slate-200 text-sm" 
                  value={newsData.content} 
                  onChange={e => setNewsData({...newsData, content: e.target.value})} 
                  required 
                />
              )}

              <div className="flex justify-end gap-4">
                {status === 'success' && <span className="text-green-600 font-bold flex items-center gap-2 animate-in slide-in-from-right"><CheckCircle2/> Postado!</span>}
                <button type="submit" disabled={status === 'saving'} className="bg-adventist-blue text-adventist-yellow px-10 py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all">
                  {status === 'saving' ? 'Publicando...' : 'Postar Notícia'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSection;
