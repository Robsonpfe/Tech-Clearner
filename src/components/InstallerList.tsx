import React, { useState } from 'react';
import { InstallerProgram } from '../types';
import { Search, Edit, Trash2, RefreshCw, Folder, CheckSquare, Square, Info, Sparkles } from 'lucide-react';

interface InstallerListProps {
  installers: InstallerProgram[];
  onToggleActive: (id: string) => void;
  onToggleAll: (active: boolean) => void;
  onEdit: (program: InstallerProgram) => void;
  onDelete: (id: string) => void;
  onResetDefaults: () => void;
  onAddNew: () => void;
  installersPath: string;
  onChangeInstallersPath: (path: string) => void;
}

const CATEGORIES = [
  { value: 'todos', label: 'Todos', icon: '📦' },
  { value: 'Navegadores', label: 'Navegadores', icon: '🌐' },
  { value: 'Compactadores', label: 'Compactadores', icon: '🗜️' },
  { value: 'Acesso Remoto', label: 'Suporte Remoto', icon: '🖥️' },
  { value: 'Documentos', label: 'Documentos/PDF', icon: '📄' },
  { value: 'Editores', label: 'Editores/Código', icon: '📝' },
  { value: 'Multimídia', label: 'Multimídia', icon: '🎬' },
  { value: 'Utilitários', label: 'Utilitários', icon: '⚙️' },
];

export default function InstallerList({
  installers,
  onToggleActive,
  onToggleAll,
  onEdit,
  onDelete,
  onResetDefaults,
  onAddNew,
  installersPath,
  onChangeInstallersPath,
}: InstallerListProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Filter installers
  const filteredInstallers = installers.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.installerFileName.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'todos' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const allFilteredSelected = filteredInstallers.length > 0 && filteredInstallers.every((p) => p.isActive);

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      filteredInstallers.forEach((p) => {
        if (p.isActive) onToggleActive(p.id);
      });
    } else {
      filteredInstallers.forEach((p) => {
        if (!p.isActive) onToggleActive(p.id);
      });
    }
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 shadow-lg flex flex-col h-full" id="installer-list-component">
      {/* Path Config & Search Header */}
      <div className="bg-[#161616] border border-[#222222] rounded-xl p-4 mb-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Pasta de Instaladores Locais na Máquina
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
            Caminho do Cliente
          </span>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={installersPath}
            onChange={(e) => onChangeInstallersPath(e.target.value)}
            placeholder="Ex: C:\Instaladores ou D:\Softwares"
            className="w-full bg-[#080808] border border-[#333333] focus:border-sky-500 rounded-lg px-3 py-2.5 text-xs font-mono text-sky-300 placeholder-zinc-700 focus:outline-none transition-colors"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-500">
            LOCAL_PATH
          </span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-normal">
          O script gerado buscará os arquivos nesta pasta específica para executar a instalação silenciosa.
        </p>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-5 border-b border-[#222222]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por instalador, nome ou extensão..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080808] border border-[#333333] focus:border-sky-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-650 focus:outline-none transition-colors font-mono"
          />
        </div>
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 text-xs font-medium px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer"
            title="Restaura a lista inicial de utilitários de instalação"
            type="button"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            Restaurar Padrão
          </button>
          <button
            onClick={onAddNew}
            className="bg-sky-600 hover:bg-sky-500 text-black font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-md shadow-sky-950/20 cursor-pointer"
            type="button"
          >
            + Novo Instalador
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              selectedCategory.toLowerCase() === cat.value.toLowerCase()
                ? 'bg-zinc-800 border-zinc-700 text-white shadow-inner'
                : 'bg-[#080808] border-[#222222] text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Select All / Status Bar */}
      <div className="flex items-center justify-between bg-[#080808] border border-[#222222] px-4 py-2 rounded-lg mb-4">
        <button
          onClick={handleToggleSelectAll}
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {allFilteredSelected ? (
            <CheckSquare className="w-4 h-4 text-sky-400" />
          ) : (
            <Square className="w-4 h-4 text-zinc-600" />
          )}
          <span>{allFilteredSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}</span>
        </button>
        <span className="text-[11px] text-zinc-500 font-mono">
          Mostrando {filteredInstallers.length} de {installers.length} utilitários
        </span>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px] pr-1.5 custom-scrollbar">
        {filteredInstallers.length === 0 ? (
          <div className="text-center py-12 bg-[#080808]/40 border border-dashed border-[#222222] rounded-xl">
            <Info className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <h4 className="text-zinc-400 font-medium text-sm">Nenhum instalador cadastrado</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              Nenhum utilitário corresponde aos filtros. Crie um novo instalador ou restaure o catálogo inicial.
            </p>
          </div>
        ) : (
          filteredInstallers.map((p) => (
            <div
              key={p.id}
              className={`p-4 border rounded-xl transition-all relative flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                p.isActive
                  ? 'bg-sky-950/10 border-sky-900/30 shadow-sm shadow-sky-950/5'
                  : 'bg-[#080808]/40 border-[#222222]/60 opacity-65 hover:opacity-85'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                {/* Activation checkbox */}
                <button
                  onClick={() => onToggleActive(p.id)}
                  className="mt-1 flex-shrink-0 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={p.isActive ? 'Remover da fila de instalação' : 'Adicionar à fila de instalação'}
                >
                  {p.isActive ? (
                    <CheckSquare className="w-5 h-5 text-sky-400" />
                  ) : (
                    <Square className="w-5 h-5 text-zinc-600" />
                  )}
                </button>

                {/* Installer details */}
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-white tracking-tight">
                      {p.name}
                    </h4>
                    <span className="text-[10px] font-mono bg-[#080808] border border-[#222222] text-sky-300 px-1.5 py-0.5 rounded">
                      {p.installerFileName}
                    </span>
                  </div>

                  {p.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {p.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Args Silenciosos: <code className="text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">{p.silentArgs}</code>
                    </span>
                    <span className="text-[10px] bg-[#080808] text-zinc-400 border border-[#222222] rounded-md px-2 py-0.5 font-mono">
                      {p.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center md:self-center gap-1.5 justify-end bg-[#080808]/40 md:bg-transparent p-1.5 md:p-0 rounded-lg border border-[#222222] md:border-transparent">
                <button
                  onClick={() => onEdit(p)}
                  className="text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 p-2 rounded-lg transition-all cursor-pointer"
                  title="Editar dados do instalador silencioso"
                  type="button"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 p-2 rounded-lg transition-all cursor-pointer"
                  title="Remover do catálogo de instaladores"
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
