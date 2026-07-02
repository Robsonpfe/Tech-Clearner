import React, { useState, useEffect } from 'react';
import { InstallerProgram } from '../types';
import { X, Save, Sparkles } from 'lucide-react';

interface InstallerFormProps {
  installer: InstallerProgram | null; // null if adding new
  onSave: (installer: InstallerProgram) => void;
  onCancel: () => void;
}

const PRESETS = [
  { name: 'Padrão MSI (Windows Installer)', args: '/qn /norestart' },
  { name: 'Inno Setup', args: '/VERYSILENT /SUPPRESSMSGBOXES /NORESTART' },
  { name: 'Nullsoft (NSIS)', args: '/S' },
  { name: 'Advanced Installer', args: '/qn' },
  { name: 'Google Chrome/Enterprise', args: '/silent /install' },
  { name: 'AnyDesk', args: '--install "C:\\Program Files (x86)\\AnyDesk" --silent' },
];

export default function InstallerForm({ installer, onSave, onCancel }: InstallerFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Navegadores');
  const [installerFileName, setInstallerFileName] = useState('');
  const [silentArgs, setSilentArgs] = useState('');
  const [description, setDescription] = useState('');

  // Prefill if editing
  useEffect(() => {
    if (installer) {
      setName(installer.name);
      setCategory(installer.category);
      setInstallerFileName(installer.installerFileName);
      setSilentArgs(installer.silentArgs);
      setDescription(installer.description);
    } else {
      // Clear fields
      setName('');
      setCategory('Navegadores');
      setInstallerFileName('');
      setSilentArgs('/S');
      setDescription('');
    }
  }, [installer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !installerFileName.trim()) return;

    const savedInstaller: InstallerProgram = {
      id: installer?.id || `inst-${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      category: category.trim(),
      installerFileName: installerFileName.trim(),
      silentArgs: silentArgs.trim() || '/S',
      description: description.trim(),
      isActive: installer ? installer.isActive : true,
    };

    onSave(savedInstaller);
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-2xl overflow-hidden relative" id="installer-form-container">
      <div className="flex items-center justify-between mb-6 border-b border-[#222222] pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 font-sans">
            <Sparkles className="w-5 h-5 text-sky-400" />
            {installer ? 'Editar Utilitário de Instalação' : 'Cadastrar Novo Instalador Automático'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Insira os parâmetros silenciosos de acordo com a tecnologia do instalador (.exe / .msi).
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800 p-2 rounded-lg transition-colors cursor-pointer"
          title="Cancelar"
          type="button"
          id="btn-close-installer-form"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
              Nome do Programa *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Google Chrome, WinRAR, AnyDesk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#080808] border border-[#333333] focus:border-sky-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-650 focus:outline-none transition-colors"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
              Categoria *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#080808] border border-[#333333] focus:border-sky-500 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
            >
              <option value="Navegadores">Navegadores</option>
              <option value="Compactadores">Compactadores</option>
              <option value="Acesso Remoto">Suporte / Acesso Remoto</option>
              <option value="Documentos">Documentos / Leitores PDF</option>
              <option value="Editores">Editores de Texto / Código</option>
              <option value="Multimídia">Multimídia / Vídeo</option>
              <option value="Utilitários">Utilitários do Sistema</option>
            </select>
          </div>

          {/* Nome do arquivo do instalador */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
              Nome do Arquivo Instalador *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: chrome_installer.exe, winrar-x64.exe"
              value={installerFileName}
              onChange={(e) => setInstallerFileName(e.target.value)}
              className="w-full bg-[#080808] border border-[#333333] focus:border-sky-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-650 focus:outline-none transition-colors font-mono"
            />
          </div>

          {/* Parâmetros silenciosos */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
              Parâmetros Silenciosos (Quiet/Silent) *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: /S ou /qn ou /silent"
              value={silentArgs}
              onChange={(e) => setSilentArgs(e.target.value)}
              className="w-full bg-[#080808] border border-[#333333] focus:border-sky-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-650 focus:outline-none transition-colors font-mono"
            />
          </div>
        </div>

        {/* Presets / Templates */}
        <div className="bg-[#080808] border border-[#222222] p-4 rounded-xl">
          <span className="text-[10px] text-zinc-500 uppercase font-bold font-mono block mb-2">
            Presets Úteis de Parâmetros de Instalação Silenciosa
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setSilentArgs(p.args)}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 px-2.5 py-1.5 rounded transition-all cursor-pointer"
                title={`Aplicar parâmetros: ${p.args}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
            Breve Descrição do Utilitário
          </label>
          <textarea
            rows={2}
            placeholder="Ex: Instala o compactador clássico WinRAR em português..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#080808] border border-[#333333] focus:border-sky-500 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-650 focus:outline-none transition-colors"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222222]">
          <button
            type="button"
            onClick={onCancel}
            className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-500 text-black font-bold text-xs px-5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-sky-950/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Instalador</span>
          </button>
        </div>
      </form>
    </div>
  );
}
