import React, { useState, useEffect } from 'react';
import { Program, InstallerProgram, DashboardStats } from './types';
import { DEFAULT_PROGRAMS } from './data/defaultPrograms';
import { DEFAULT_INSTALLERS } from './data/defaultInstallers';
import ProgramList from './components/ProgramList';
import ProgramForm from './components/ProgramForm';
import InstallerList from './components/InstallerList';
import InstallerForm from './components/InstallerForm';
import ScriptGenerator from './components/ScriptGenerator';
import TechnicalGuide from './components/TechnicalGuide';
import TerminalSimulator from './components/TerminalSimulator';
import { Cpu, Database, LayoutGrid, Terminal, FileCode, BookOpen, AlertTriangle, ShieldCheck, Wrench, RefreshCw, LogOut } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'otimizador_ti_programs';
const LOCAL_STORAGE_INSTALLERS_KEY = 'otimizador_ti_installers';
const LOCAL_STORAGE_PATH_KEY = 'otimizador_ti_installers_path';

export default function App() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const [installers, setInstallers] = useState<InstallerProgram[]>([]);
  const [installersPath, setInstallersPath] = useState('C:\\Instaladores');
  const [isAddingInstaller, setIsAddingInstaller] = useState(false);
  const [editingInstaller, setEditingInstaller] = useState<InstallerProgram | null>(null);
  const [currentLeftTab, setCurrentLeftTab] = useState<'bloatware' | 'installers'>('bloatware');

  const [activeRightTab, setActiveRightTab] = useState<'script' | 'simulator' | 'guide'>('script');

  // Load programs & installers from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setPrograms(JSON.parse(stored));
      } catch (e) {
        setPrograms(DEFAULT_PROGRAMS);
      }
    } else {
      setPrograms(DEFAULT_PROGRAMS);
    }

    const storedInstallers = localStorage.getItem(LOCAL_STORAGE_INSTALLERS_KEY);
    if (storedInstallers) {
      try {
        setInstallers(JSON.parse(storedInstallers));
      } catch (e) {
        setInstallers(DEFAULT_INSTALLERS);
      }
    } else {
      setInstallers(DEFAULT_INSTALLERS);
    }

    const storedPath = localStorage.getItem(LOCAL_STORAGE_PATH_KEY);
    if (storedPath) {
      setInstallersPath(storedPath);
    }
  }, []);

  // Save programs helper
  const savePrograms = (newPrograms: Program[]) => {
    setPrograms(newPrograms);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newPrograms));
  };

  // Save installers helper
  const saveInstallers = (newInstallers: InstallerProgram[]) => {
    setInstallers(newInstallers);
    localStorage.setItem(LOCAL_STORAGE_INSTALLERS_KEY, JSON.stringify(newInstallers));
  };

  // Toggle active status of a program
  const handleToggleActive = (id: string) => {
    const updated = programs.map((p) =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    );
    savePrograms(updated);
  };

  // Toggle all programs to active/inactive
  const handleToggleAll = (active: boolean) => {
    const updated = programs.map((p) => ({ ...p, isActive: active }));
    savePrograms(updated);
  };

  // Delete program from catalog
  const handleDeleteProgram = (id: string) => {
    const updated = programs.filter((p) => p.id !== id);
    savePrograms(updated);
    if (editingProgram && editingProgram.id === id) {
      setEditingProgram(null);
    }
  };

  // Save new or edited program
  const handleSaveProgram = (program: Program) => {
    const index = programs.findIndex((p) => p.id === program.id);
    let updated: Program[] = [];
    if (index > -1) {
      // Edit
      updated = [...programs];
      updated[index] = program;
    } else {
      // Add new
      updated = [program, ...programs];
    }
    savePrograms(updated);
    setEditingProgram(null);
    setIsAddingNew(false);
  };

  // Reset to default factory list
  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar o catálogo de bloatwares para os padrões de fábrica? Suas adições serão removidas.')) {
      savePrograms(DEFAULT_PROGRAMS);
    }
  };

  // Toggle active status of an installer
  const handleToggleInstallerActive = (id: string) => {
    const updated = installers.map((p) =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    );
    saveInstallers(updated);
  };

  // Toggle all installers to active/inactive
  const handleToggleAllInstallers = (active: boolean) => {
    const updated = installers.map((p) => ({ ...p, isActive: active }));
    saveInstallers(updated);
  };

  // Delete installer
  const handleDeleteInstaller = (id: string) => {
    const updated = installers.filter((p) => p.id !== id);
    saveInstallers(updated);
    if (editingInstaller && editingInstaller.id === id) {
      setEditingInstaller(null);
    }
  };

  // Save installer
  const handleSaveInstaller = (installer: InstallerProgram) => {
    const index = installers.findIndex((p) => p.id === installer.id);
    let updated: InstallerProgram[] = [];
    if (index > -1) {
      updated = [...installers];
      updated[index] = installer;
    } else {
      updated = [installer, ...installers];
    }
    saveInstallers(updated);
    setEditingInstaller(null);
    setIsAddingInstaller(false);
  };

  // Reset installers to default
  const handleResetInstallers = () => {
    if (window.confirm('Deseja restaurar o catálogo de instaladores para os padrões de fábrica? Suas adições serão removidas.')) {
      saveInstallers(DEFAULT_INSTALLERS);
    }
  };

  // Change installers path
  const handleChangeInstallersPath = (path: string) => {
    setInstallersPath(path);
    localStorage.setItem(LOCAL_STORAGE_PATH_KEY, path);
  };

  // Calculate dynamic stats
  const activePrograms = programs.filter((p) => p.isActive);
  const activeInstallers = installers.filter((p) => p.isActive);
  
  const stats: DashboardStats = {
    totalPrograms: programs.length,
    selectedPrograms: activePrograms.length,
    estimatedCpuSaved: activePrograms.reduce((acc, p) => {
      if (p.impact === 'alto') return acc + 10;
      if (p.impact === 'medio') return acc + 4;
      return acc + 1.5;
    }, 0),
    estimatedRamSaved: activePrograms.reduce((acc, p) => {
      if (p.impact === 'alto') return acc + 500;
      if (p.impact === 'medio') return acc + 250;
      return acc + 100;
    }, 0),
  };


  return (
    <div className="min-h-screen bg-[#080808] text-zinc-300 flex flex-col font-sans select-none antialiased selection:bg-emerald-500/30 selection:text-emerald-300" id="app-root">
      {/* Upper Navigation Header */}
      <header className="bg-[#111111] border-b border-[#222222] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded flex items-center justify-center font-bold text-black shadow-md shadow-emerald-500/10">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white italic">
                TECH_CLEANER <span className="text-emerald-500 font-mono not-italic text-xs font-bold bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded ml-1">v2.4.0</span>
              </h1>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium font-mono uppercase tracking-wider">
              System Hardware Optimization & Background Process Manager
            </p>
          </div>
        </div>

        {/* Current status info */}
        <div className="flex items-center gap-6 self-end md:self-auto">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 uppercase font-mono">Status do App</span>
            <span className="text-emerald-400 font-mono text-xs font-semibold">Execução Local</span>
          </div>
          <div className="w-[1px] bg-zinc-800 h-8 hidden sm:block"></div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 uppercase font-mono">Modo de Saída</span>
            <span className="text-zinc-400 font-mono text-xs">PowerShell / Batch</span>
          </div>
        </div>
      </header>

      {/* Main Stats Summary Strip */}
      <section className="bg-[#080808] border-b border-[#222222]/40 px-6 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Cataloged */}
          <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider font-mono">Process Registry</span>
              <p className="text-xl font-bold text-white font-mono mt-0.5">{stats.totalPrograms}</p>
            </div>
            <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-zinc-400">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>

          {/* Selected for Cleanup */}
          <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider font-mono">Marked for Purge</span>
              <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{stats.selectedPrograms}</p>
            </div>
            <div className="w-8 h-8 bg-emerald-950/20 border border-emerald-900/30 rounded flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* RAM saved estimated */}
          <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider font-mono">Memory Relief</span>
              <p className="text-xl font-bold text-sky-400 font-mono mt-0.5">
                {stats.estimatedRamSaved >= 1000 
                  ? `${(stats.estimatedRamSaved / 1000).toFixed(1)} GB` 
                  : `${stats.estimatedRamSaved} MB`}
              </p>
            </div>
            <div className="w-8 h-8 bg-sky-950/20 border border-sky-900/30 rounded flex items-center justify-center text-sky-400">
              <Database className="w-4 h-4" />
            </div>
          </div>

          {/* CPU Saved estimated */}
          <div className="bg-[#111111] border border-[#222222] p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider font-mono">CPU Cycle Savings</span>
              <p className="text-xl font-bold text-amber-400 font-mono mt-0.5">~{stats.estimatedCpuSaved}%</p>
            </div>
            <div className="w-8 h-8 bg-amber-950/20 border border-amber-900/30 rounded flex items-center justify-center text-amber-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>

        </div>
      </section>

      {/* Main Dashboard Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Side: Program Catalog Table / Cards (Span 7) */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[500px] gap-4">
          
          {/* Tab Selector for Left Pane */}
          <div className="bg-[#111111] border border-[#222222] p-1 rounded-xl flex grid grid-cols-2 gap-1">
            <button
              onClick={() => setCurrentLeftTab('bloatware')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                currentLeftTab === 'bloatware'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-inner'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Bloatwares & Otimização
            </button>
            <button
              onClick={() => setCurrentLeftTab('installers')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                currentLeftTab === 'installers'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-inner'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Wrench className="w-4 h-4 text-sky-400" />
              Instalação de Programas
            </button>
          </div>

          {currentLeftTab === 'bloatware' ? (
            <ProgramList
              programs={programs}
              onToggleActive={handleToggleActive}
              onToggleAll={handleToggleAll}
              onEdit={(p) => {
                setEditingProgram(p);
                setIsAddingNew(false);
              }}
              onDelete={handleDeleteProgram}
              onResetDefaults={handleResetDefaults}
              onAddNew={() => {
                setEditingProgram(null);
                setIsAddingNew(true);
              }}
            />
          ) : (
            <InstallerList
              installers={installers}
              onToggleActive={handleToggleInstallerActive}
              onToggleAll={handleToggleAllInstallers}
              onEdit={(p) => {
                setEditingInstaller(p);
                setIsAddingInstaller(false);
              }}
              onDelete={handleDeleteInstaller}
              onResetDefaults={handleResetInstallers}
              onAddNew={() => {
                setEditingInstaller(null);
                setIsAddingInstaller(true);
              }}
              installersPath={installersPath}
              onChangeInstallersPath={handleChangeInstallersPath}
            />
          )}
        </div>

        {/* Right Side: Tabbed toolbox (Span 5) */}
        <div className="lg:col-span-5 flex flex-col h-full gap-4 min-h-[500px]">
          
          {/* Tabs header selector */}
          <div className="bg-[#111111] border border-[#222222] p-1 rounded-xl flex grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveRightTab('script')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeRightTab === 'script'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-inner'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              Script de Saída
            </button>
            <button
              onClick={() => setActiveRightTab('simulator')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeRightTab === 'simulator'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-inner'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Terminal className="w-4 h-4 text-sky-400" />
              Simular Lote
            </button>
            <button
              onClick={() => setActiveRightTab('guide')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                activeRightTab === 'guide'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-inner'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              Manual Técnico
            </button>
          </div>

          {/* Active Tab Component Container */}
          <div className="flex-1 flex flex-col">
            {activeRightTab === 'script' && (
              <ScriptGenerator 
                programs={programs} 
                installers={installers}
                installersPath={installersPath}
              />
            )}
            {activeRightTab === 'simulator' && (
              <TerminalSimulator 
                programs={programs} 
                installers={installers}
                installersPath={installersPath}
              />
            )}
            {activeRightTab === 'guide' && (
              <TechnicalGuide />
            )}
          </div>

        </div>

      </main>

      {/* Overlay modal backdrop for Form (Add/Edit Bloatware) */}
      {(isAddingNew || editingProgram) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8">
            <ProgramForm
              program={editingProgram}
              onSave={handleSaveProgram}
              onCancel={() => {
                setEditingProgram(null);
                setIsAddingNew(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Overlay modal backdrop for Installer Form (Add/Edit Installer) */}
      {(isAddingInstaller || editingInstaller) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8">
            <InstallerForm
              installer={editingInstaller}
              onSave={handleSaveInstaller}
              onCancel={() => {
                setEditingInstaller(null);
                setIsAddingInstaller(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Humble Footer with instructions */}
      <footer className="bg-[#111111] border-t border-[#222222] px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 font-mono">
          <div className="flex gap-4 text-[10px]">
            <span>BLOATWARES: {stats.totalPrograms}</span>
            <span>INSTALADORES: {installers.length}</span>
            <span>PERSISTÊNCIA: LOCALSTORAGE</span>
          </div>
          <div className="text-[10px] text-zinc-500 uppercase">
            Ferramenta de Apoio ao Técnico de TI // Otimização de Processos em Segundo Plano
          </div>
        </div>
      </footer>
    </div>
  );
}
