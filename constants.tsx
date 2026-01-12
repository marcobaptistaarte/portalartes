import { EducationLevel, Bimester, ResourceType } from './types';

export const LEVELS: EducationLevel[] = [
  'Educação Infantil',
  'Ensino Fundamental I',
  'Ensino Fundamental II',
  'Ensino Médio'
];

export const GRADES_BY_LEVEL: Record<EducationLevel, string[]> = {
  'Educação Infantil': ['3 anos', '4 anos', '5 anos'],
  'Ensino Fundamental I': ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano'],
  'Ensino Fundamental II': ['6º ano', '7º ano', '8º ano', '9º ano'],
  'Ensino Médio': ['1ª série', '2ª série', '3ª série']
};

export const BIMESTERS: Bimester[] = [
  '1º bimestre',
  '2º bimestre',
  '3º bimestre',
  '4º bimestre',
  'Anual'
];

export const RESOURCE_TYPES: { type: ResourceType; icon: string }[] = [
  { type: 'Conteúdo', icon: '📚' },
  { type: 'Plano de Aula', icon: '📝' },
  { type: 'Planejamento Bimestral', icon: '🗓️' },
  { type: 'Planejamento Anual', icon: '📅' },
  { type: 'Atividades', icon: '🎨' },
  { type: 'Vídeo', icon: '🎬' }
];
