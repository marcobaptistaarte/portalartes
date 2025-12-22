
export type EducationLevel = 'Educação Infantil' | 'Ensino Fundamental I' | 'Ensino Fundamental II' | 'Ensino Médio';

export type Bimester = '1º bimestre' | '2º bimestre' | '3º bimestre' | '4º bimestre';

export type ResourceType = 'Planejamento Bimestral' | 'Planos de Aula' | 'Textos Base por Conteúdo' | 'Imagens' | 'Recursos Pedagógicos';

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
  data: string; // Base64 string for simulation
  size: number;
}

export interface MuralPost {
  id: string;
  teacherName: string;
  schoolName: string;
  level: EducationLevel;
  grade: string;
  workTitle: string;
  description: string;
  photos: string[]; // Array of Base64 strings
  date: string;
}

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export interface ManualPost {
  id: string;
  level: EducationLevel;
  grade: string;
  bimester: Bimester;
  resource: ResourceType;
  title: string;
  content: string;
  date: string;
  attachments: Attachment[];
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
}
