import React, { useState, useEffect } from 'react';
import { Program, ProgramCategory, ImpactLevel, UninstallMethod } from '../types';
import { X, Plus, Save, RotateCcw } from 'lucide-react';

interface ProgramFormProps {
  program: Program | null; // null if adding new
  onSave: (program: Program) => void;
  onCancel: () => void;
}

export default function ProgramForm({ program, onSave, onCancel }: ProgramFormProps) {
  const [name, setName] = useState('');
  const [executable, setExecutable] = useState('');
  const [category, setCategory] = useState<ProgramCategory>('utilitarios');
  const [impact, setImpact] = useState<ImpactLevel>('medio');
  const [description, setDescription] = useState('');
  const [uninstallMethod, setUninstallMethod] = useState<UninstallMethod>('powershell');
  const [uninstallCommand, setUninstallCommand] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [registryPath, setRegistryPath] = useState('');

  // Prefill if editing
  useEffect(() => {
    if (program) {
      setName(program.name);
      setExecutable(program.executable);
      setCategory(program.category);
      setImpact(program.impact);
      setDescription(program.description);
      setUninstallMethod(program.uninstallMethod);
      setUninstallCommand(program.uninstallCommand);
      setServiceName(program.serviceName || '');
      setRegistryPath(program.registryPath || '');
    } else {
      // Clear fields
      setName('');
      setExecutable('');
      setCategory('utilitarios');
      setImpact('medio');
      setDescription('');
      setUninstallMethod('powershell');
      setUninstallCommand('');
      setServiceName('');
      setRegistryPath('');
    }
  }, [program]);

  // Handle command templates based on method & service
  const applyTemplate = () => {
    if (!name) return;
    const cleanName = name.replace(/['"]/g, '');
    const cleanExec = executable ? executable.replace('.exe', '') : 'processo';

    if (uninstallMethod === 'powershell') {
      let cmd = `# Desinstalação silenciosa de ${cleanName}\n`;
      if (serviceName) {
        cmd += `Stop-Service -Name "${serviceName}" -Force -ErrorAction SilentlyContinue\n`;
        cmd += `Set-Service -Name "${serviceName}" -StartupType Disabled\n`;
      }
      if (executable) {
        cmd += `Stop-Process -Name "${cleanExec}" -Force -ErrorAction SilentlyContinue\n`;
      }
      cmd += `Get-WmiObject -Class Win32_Product | Where-Object {$_.Name -like "*${cleanName}*"} | ForEach-Object {\n`;
      cmd += `    Write-Host "Removendo: $($_.Name)" -ForegroundColor Yellow\n`;
      cmd += `    $_.Uninstall()\n`;
      cmd += `}`;
      setUninstallCommand(cmd);
    } else if (uninstallMethod === 'cmd') {
      let cmd = `:: Desinstalação de ${cleanName}\n`;
      if (serviceName) {
        cmd += `sc stop "${serviceName}"\n`;
        cmd += `sc config "${serviceName}" start= disabled\n`;
      }
      if (executable) {
        cmd += `taskkill /f /im "${executable}" /t\n`;
      }
      cmd += `wmic product where "name like '%%${cleanName}%%'" call uninstall /nointeractive\n`;
      setUninstallCommand(cmd);
    } else if (uninstallMethod === 'registry') {
      let cmd = `# Desinstalar através do registro\n`;
      if (executable) {
        cmd += `Stop-Process -Name "${cleanExec}" -Force -ErrorAction SilentlyContinue\n`;
      }
      cmd += `$regPath = "HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*"\n`;
      cmd += `$app = Get-ItemProperty $regPath | Where-Object { $_.DisplayName -like "*${cleanName}*" } | Select-Object -First 1\n`;
      cmd += `if ($app.UninstallString) {\n`;
      cmd += `    Write-Host "Executando: $($app.UninstallString)"\n`;
      cmd += `    $uninst = $app.UninstallString -replace '/I', '/X' -replace 'MsiExec.exe', ''\n`;
      cmd += `    Start-Process msiexec.exe -ArgumentList "/x $($uninst.Trim()) /qn /norestart" -Wait\n`;
      cmd += `}`;
      setUninstallCommand(cmd);
    } else {
      setUninstallCommand(`# Desinstalação Manual\n# Instrua o técnico para orientar o cliente\nWrite-Host "Acesse o Painel de Controle e desinstale ${cleanName} manualmente."`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedProgram: Program = {
      id: program?.id || Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      executable: executable.trim(),
      category,
      impact,
      description: description.trim(),
      uninstallMethod,
      uninstallCommand: uninstallCommand.trim() || `# Desinstalar ${name}`,
      serviceName: serviceName.trim() || undefined,
      registryPath: registryPath.trim() || undefined,
      isActive: program ? program.isActive : true,
    };

    onSave(savedProgram);
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-2xl overflow-hidden relative" id="program-form-container">
      <div className="flex items-center justify-between mb-6 border-b border-[#222222] pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 font-sans">
            <Plus className="w-5 h-5 text-emerald-400" />
            {program ? 'Editar Programa Bloatware' : 'Cadastrar Novo Programa/Serviço'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Configure comandos personalizados para remoção automática em lotes.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800 p-2 rounded-lg transition-colors cursor-pointer"
          title="Cancelar"
          type="button"
          id="btn-close-form"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
              Nome do Programa / Suíte *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: McAfee Safe Connect, CCleaner Monitor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#080808] border border-[#333333] focus:border-emerald-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-650 focus:outline-none transition-colors"
            />
          </div>

          {/* Executável principal */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
              Nome do Executável (.exe)
            </label>
            <input
              type="text"
              placeholder="Ex: mcshield.exe, ccleaner64.exe"
              value={executable}
              onChange={(e) => setExecutable(e.target.value)}
              className="w-full bg-[#080808] border border-[#333333] focus:border-emerald-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-650 focus:outline-none transition-colors font-mono"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
              Categoria do Software
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProgramCategory)}
              className="w-full bg-[#080808] border border-[#333333] focus:border-emerald-500 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
            >
              <option value="antivirus">🛡️ Antivírus / Bloatware Pesado</option>
              <option value="telemetria">📊 Telemetria e Coleta de Dados</option>
              <option value="utilitarios">🛠️ Utilitários Desnecessários</option>
              <option value="inicializacao">⚡ Inicialização Lenta / Startup</option>
              <option value="outros">📦 Outros Programas</option>
            </select>
          </div>

          {/* Impacto */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
              Nível de Impacto no Hardware
            </label>
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value as ImpactLevel)}
              className="w-full bg-[#080808] border border-[#333333] focus:border-emerald-500 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
            >
              <option value="baixo">🟢 Baixo Impacto (CPU/RAM leve)</option>
              <option value="medio">🟡 Médio Impacto (Consumo moderado persistente)</option>
              <option value="alto">🔴 Alto Impacto (Gargalos de disco/processamento)</option>
            </select>
          </div>

          {/* Nome do Serviço */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
              Nome do Serviço Windows (Se houver)
            </label>
            <input
              type="text"
              placeholder="Ex: DiagTrack, McShield"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full bg-[#080808] border border-[#333333] focus:border-emerald-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-650 focus:outline-none transition-colors font-mono"
            />
          </div>

          {/* Caminho do Registro */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
              Chave de Registro para Busca (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: HKLM:\Software\Microsoft\Windows\..."
              value={registryPath}
              onChange={(e) => setRegistryPath(e.target.value)}
              className="w-full bg-[#080808] border border-[#333333] focus:border-emerald-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-650 focus:outline-none transition-colors font-mono"
            />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
            Descrição do Impacto / Motivo de Remoção
          </label>
          <textarea
            rows={2}
            placeholder="Descreva por que esse aplicativo prejudica a performance e como ele se comporta em segundo plano..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#080808] border border-[#333333] focus:border-emerald-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-650 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Método de Desinstalação e Botão de Modelo */}
        <div className="border-t border-[#222222] pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                  Método de Execução
                </label>
                <select
                  value={uninstallMethod}
                  onChange={(e) => setUninstallMethod(e.target.value as UninstallMethod)}
                  className="bg-[#080808] border border-[#333333] focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none transition-colors"
                >
                  <option value="powershell">PowerShell (.ps1)</option>
                  <option value="cmd">CMD / Batch (.bat)</option>
                  <option value="registry">Pesquisa de Registro</option>
                  <option value="manual">Instruções Manuais</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={applyTemplate}
              disabled={!name}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                name 
                  ? 'bg-zinc-800 border-zinc-700 text-sky-400 hover:bg-zinc-750' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
              title="Gera um script inteligente com base nos dados preenchidos acima"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Preencher Modelo Automático
            </button>
          </div>

          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
            Comando de Remoção Personalizado
          </label>
          <textarea
            rows={5}
            placeholder={`# Digite os comandos de remoção silenciosos.\n# Exemplo:\nStop-Process -Name "processo" -Force`}
            value={uninstallCommand}
            onChange={(e) => setUninstallCommand(e.target.value)}
            className="w-full bg-[#080808] border border-[#333333] focus:border-emerald-500 rounded-lg p-3 text-xs text-emerald-400 placeholder-zinc-600 focus:outline-none transition-colors font-mono whitespace-pre resize-y"
          />
          <p className="text-[10px] text-zinc-500 mt-1 font-mono">
            Dica: Use opções silenciosas (Silent switches como /S, /quiet, /qn, /norestart) para que a desinstalação não exija cliques na tela do usuário final.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 border-t border-[#222222] pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-zinc-300 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold px-5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-md hover:shadow-emerald-950/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {program ? 'Salvar Alterações' : 'Adicionar ao Catálogo'}
          </button>
        </div>
      </form>
    </div>
  );
}
