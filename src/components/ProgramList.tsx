import React, { useState } from 'react';
import { Program, ProgramCategory, ImpactLevel } from '../types';
import { Search, Edit, Trash2, Shield, BarChart3, Settings, Play, RefreshCw, Layers, CheckSquare, Square, Info } from 'lucide-react';

interface ProgramListProps {
  programs: Program[];
  onToggleActive: (id: string) => void;
  onToggleAll: (active: boolean) => void;
  onEdit: (program: Program) => void;
  onDelete: (id: string) => void;
  onResetDefaults: () => void;
  onAddNew: () => void;
}

const CATEGORIES: { value: ProgramCategory | 'todos'; label: string; icon: string }[] = [
  { value: 'todos', label: 'Todos', icon: '📦' },
  { value: 'antivirus', label: 'Antivírus/Bloatware', icon: '🛡️' },
  { value: 'telemetria', label: 'Telemetria', icon: '📊' },
  { value: 'utilitarios', label: 'Utilitários', icon: '🛠️' },
  { value: 'inicializacao', label: 'Startup Lento', icon: '⚡' },
  { value: 'outros', label: 'Outros', icon: '📁' },
];

export default function ProgramList({
  programs,
  onToggleActive,
  onToggleAll,
  onEdit,
  onDelete,
  onResetDefaults,
  onAddNew,
}: ProgramListProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProgramCategory | 'todos'>('todos');

  // Filter programs
  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.executable.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const allFilteredSelected = filteredPrograms.length > 0 && filteredPrograms.every((p) => p.isActive);

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      // Deactivate all filtered
      filteredPrograms.forEach((p) => {
        if (p.isActive) onToggleActive(p.id);
      });
    } else {
      // Activate all filtered
      filteredPrograms.forEach((p) => {
        if (!p.isActive) onToggleActive(p.id);
      });
    }
  };

  const getImpactBadge = (impact: ImpactLevel) => {
    switch (impact) {
      case 'alto':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Alto Impacto
          </span>
        );
      case 'medio':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Impacto Médio
          </span>
        );
      case 'baixo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Baixo Impacto
          </span>
        );
    }
  };

  const getCategoryEmoji = (cat: ProgramCategory) => {
    switch (cat) {
      case 'antivirus': return '🛡️';
      case 'telemetria': return '📊';
      case 'utilitarios': return '🛠️';
      case 'inicializacao': return '⚡';
      case 'outros': return '📁';
    }
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 shadow-lg flex flex-col h-full" id="program-list-component">
      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-5 border-b border-[#222222]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por programa, executável (.exe) ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080808] border border-[#333333] focus:border-emerald-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors font-mono"
          />
        </div>
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 text-xs font-medium px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer"
            title="Restaura a lista inicial de bloatwares recomendados"
            type="button"
            id="btn-reset-list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restaurar Padrão
          </button>
          <button
            onClick={onAddNew}
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-md shadow-emerald-950/20 cursor-pointer"
            type="button"
            id="btn-add-new-list"
          >
            + Novo Programa
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value as any)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              selectedCategory === cat.value
                ? 'bg-zinc-800 border-zinc-700 text-white shadow-inner'
                : 'bg-[#080808] border-[#222222] text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Program Selection Bar */}
      <div className="flex items-center justify-between bg-[#080808] border border-[#222222] px-4 py-2 rounded-lg mb-4">
        <button
          onClick={handleToggleSelectAll}
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {allFilteredSelected ? (
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          ) : (
            <Square className="w-4 h-4 text-zinc-600" />
          )}
          <span>{allFilteredSelected ? 'Desmarcar Todos Filtros' : 'Selecionar Todos Filtros'}</span>
        </button>
        <span className="text-[11px] text-zinc-500 font-mono">
          Mostrando {filteredPrograms.length} de {programs.length} programas
        </span>
      </div>

      {/* Main Catalog List */}
      <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-1.5 custom-scrollbar">
        {filteredPrograms.length === 0 ? (
          <div className="text-center py-12 bg-[#080808]/40 border border-dashed border-[#222222] rounded-xl">
            <Layers className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <h4 className="text-zinc-400 font-medium text-sm">Nenhum programa encontrado</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              Nenhum registro corresponde aos filtros ou termos buscados. Adicione novos programas usando o botão superior.
            </p>
          </div>
        ) : (
          filteredPrograms.map((p) => (
            <div
              key={p.id}
              className={`p-4 border rounded-xl transition-all relative flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                p.isActive
                  ? 'bg-[#161616] border-[#222222] shadow-sm'
                  : 'bg-[#080808]/40 border-[#222222]/60 opacity-60 hover:opacity-85'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                {/* Activation Checkbox */}
                <button
                  onClick={() => onToggleActive(p.id)}
                  className="mt-1 flex-shrink-0 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={p.isActive ? 'Remover do script de otimização' : 'Adicionar ao script de otimização'}
                >
                  {p.isActive ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-600" />
                  )}
                </button>

                {/* Program Details */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-white tracking-tight">
                      {p.name}
                    </h4>
                    {p.executable && (
                      <span className="text-[10px] font-mono bg-[#080808] border border-[#222222] text-zinc-400 px-1.5 py-0.5 rounded">
                        {p.executable}
                      </span>
                    )}
                  </div>
                  
                  {p.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                      {p.description}
                    </p>
                  )}

                  {/* Badges Info */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {getImpactBadge(p.impact)}
                    <span className="text-[10px] bg-[#080808] text-zinc-400 border border-[#222222] rounded-md px-2 py-0.5 flex items-center gap-1 font-mono">
                      <span>{getCategoryEmoji(p.category)}</span>
                      <span className="capitalize">{p.category}</span>
                    </span>
                    {p.serviceName && (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Serviço: {p.serviceName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center md:self-center gap-1.5 justify-end bg-[#080808]/40 md:bg-transparent p-1.5 md:p-0 rounded-lg border border-[#222222] md:border-transparent">
                <button
                  onClick={() => onEdit(p)}
                  className="text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 p-2 rounded-lg transition-all cursor-pointer"
                  title="Editar programa e comando de remoção"
                  type="button"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 p-2 rounded-lg transition-all cursor-pointer"
                  title="Excluir programa do catálogo"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
