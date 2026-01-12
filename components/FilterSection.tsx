import React from 'react';
import { ChevronRight, Filter, ArrowLeft } from 'lucide-react';
import { 
  LEVELS, 
  GRADES_BY_LEVEL, 
  BIMESTERS, 
  RESOURCE_TYPES 
} from '../constants';
import { SelectionState, EducationLevel, Bimester } from '../types';

interface FilterSectionProps {
  selection: SelectionState;
  onUpdate: (update: Partial<SelectionState>) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ selection, onUpdate }) => {
  return (
    <section className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 py-6 md:py-8 px-4">
      <div className="container mx-auto space-y-6 md:space-y-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-adventist-blue dark:text-adventist-yellow">
            <Filter size={20} />
            <h3 className="font-bold text-base md:text-lg uppercase tracking-wider">Filtros de Conteúdo</h3>
          </div>
          {(selection.level || selection.grade || selection.bimester || selection.resource) && (
            <button 
              onClick={() => onUpdate({ level: null, grade: null, bimester: null, resource: null })}
              className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Nível de Ensino */}
        <div className="space-y-3">
          <label className="text-[10px] md:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Nível de Ensino</label>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 md:gap-3">
            {LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => onUpdate({ level, grade: null, bimester: null, resource: null })}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl border-2 transition-all font-medium text-xs md:text-sm h-full flex items-center justify-center text-center ${
                  selection.level === level
                    ? 'bg-adventist-blue border-adventist-blue text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-adventist-blue text-slate-700 dark:text-slate-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Série / Ano */}
        {selection.level && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <label className="text-[10px] md:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Série <ChevronRight size={14} /> {selection.level}
              </label>
              <button 
                onClick={() => onUpdate({ level: null, grade: null })}
                className="flex items-center gap-1 text-[10px] font-bold text-adventist-blue dark:text-adventist-yellow uppercase hover:underline"
              >
                <ArrowLeft size={12} /> Voltar Nível
              </button>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {(GRADES_BY_LEVEL[selection.level] || []).map((grade) => (
                <button
                  key={grade}
                  onClick={() => onUpdate({ grade, bimester: null, resource: null })}
                  className={`px-3 py-2 rounded-lg border transition-all text-xs md:text-sm font-semibold h-full flex items-center justify-center text-center ${
                    selection.grade === grade
                      ? 'bg-adventist-yellow border-adventist-yellow text-adventist-blue shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-adventist-yellow text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bimestre */}
        {selection.grade && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <label className="text-[10px] md:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Período <ChevronRight size={14} /> {selection.grade}
              </label>
              <button 
                onClick={() => onUpdate({ grade: null, bimester: null })}
                className="flex items-center gap-1 text-[10px] font-bold text-adventist-blue dark:text-adventist-yellow uppercase hover:underline"
              >
                <ArrowLeft size={12} /> Voltar Série
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {BIMESTERS.map((bim) => (
                <button
                  key={bim}
                  onClick={() => onUpdate({ bimester: bim as Bimester, resource: null })}
                  className={`px-3 py-2.5 md:py-3 rounded-lg border-2 text-center transition-all font-bold text-xs md:text-sm ${
                    selection.bimester === bim
                      ? 'border-adventist-blue bg-adventist-blue/5 dark:bg-white/5 text-adventist-blue dark:text-adventist-yellow'
                      : 'border-transparent bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {bim}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tipo de Recurso */}
        {selection.bimester && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <label className="text-[10px] md:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Tipo de Recurso <ChevronRight size={14} /> {selection.bimester}
              </label>
              <button 
                onClick={() => onUpdate({ bimester: null, resource: null })}
                className="flex items-center gap-1 text-[10px] font-bold text-adventist-blue dark:text-adventist-yellow uppercase hover:underline"
              >
                <ArrowLeft size={12} /> Voltar Período
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3">
              {RESOURCE_TYPES.map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => onUpdate({ resource: type })}
                  className={`flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl border-2 transition-all font-bold text-[10px] md:text-sm text-center leading-tight min-h-[80px] md:min-h-0 ${
                    selection.resource === type
                      ? 'bg-adventist-blue border-adventist-blue text-white shadow-lg md:scale-105'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-adventist-blue/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="shrink-0 text-xl">{icon}</span>
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FilterSection;
