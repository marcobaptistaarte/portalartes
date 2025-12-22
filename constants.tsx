
import React from 'react';
import { Palette, User, School, BookOpen, Layers, FileText, Image as ImageIcon, Box } from 'lucide-react';
import { EducationLevel, ResourceType } from './types';

export const LEVELS: EducationLevel[] = [
  'Educação Infantil',
  'Ensino Fundamental I',
  'Ensino Fundamental II',
  'Ensino Médio'
];

export const GRADES_BY_LEVEL: Record<EducationLevel, string[]> = {
  'Educação Infantil': ['Pré III', 'Pré IV', 'Pré V'],
  'Ensino Fundamental I': ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano'],
  'Ensino Fundamental II': ['6º ano', '7º ano', '8º ano', '9º ano'],
  'Ensino Médio': ['1º ano', '2º ano', '3º ano']
};

export const BIMESTERS = ['1º bimestre', '2º bimestre', '3º bimestre', '4º bimestre'];

export const RESOURCE_TYPES: { type: ResourceType; icon: React.ReactNode }[] = [
  { type: 'Planejamento Bimestral', icon: <Layers size={18} /> },
  { type: 'Planos de Aula', icon: <BookOpen size={18} /> },
  { type: 'Textos Base por Conteúdo', icon: <FileText size={18} /> },
  { type: 'Imagens', icon: <ImageIcon size={18} /> },
  { type: 'Recursos Pedagógicos', icon: <Box size={18} /> }
];

export const ArtPaletteIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-adventist-yellow">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
    <circle cx="12" cy="12" r="2"></circle>
    <circle cx="12" cy="8" r="1"></circle>
    <circle cx="12" cy="16" r="1"></circle>
    <circle cx="8" cy="12" r="1"></circle>
    <circle cx="16" cy="12" r="1"></circle>
  </svg>
);
