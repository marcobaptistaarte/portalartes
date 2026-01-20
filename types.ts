
export type EducationLevel = 'Educação Infantil' | 'Ensino Fundamental I' | 'Ensino Fundamental II' | 'Ensino Médio';

export type Bimester = '1º bimestre' | '2º bimestre' | '3º bimestre' | '4º bimestre' | 'Anual';

export type ResourceType = 'Conteúdo' | 'Plano de Aula' | 'Planejamento Bimestral' | 'Planejamento Anual' | 'Atividades' | 'Vídeo';

export interface SelectionState {
  level: EducationLevel | null;
  grade: string | null;
  bimester: Bimester | null;
  resource: ResourceType | null;
}

export interface GeneratedContent {
  title: string;
  content: string;
  tags: string[];
  attachments?: Attachment[];
}

export interface Attachment {
  name: string;
  type: string;
  data: string;
  size: number;
}

/**
 * Interface representing a pedagogical material manually posted.
 */
export interface ManualPost {
  id: string;
  level: EducationLevel;
  grade: string;
  bimester: Bimester;
  resource: ResourceType;
  title: string;
  content: string;
  date: string;
  attachments?: Attachment[];
  video_url?: string;
}

export interface MuralPost {
  id: string;
  teacherName: string;
  schoolName: string;
  level: EducationLevel;
  grade: string;
  bimester: Bimester;
  workTitle: string;
  description: string;
  photos: string[];
  date: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  externalUrl?: string;
  imageUrl: string;
  date: string;
  type: 'internal' | 'external';
  category?: string;
}

export interface VideoCuratory {
  id: string;
  titulo: string;
  resumo: string;
  url_video: string;
  created_at: string;
}
