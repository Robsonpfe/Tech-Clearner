import React, { useState, useEffect, useRef } from 'react';
import { Program, InstallerProgram } from '../types';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, Cpu, Database, Flame, CheckCircle, Terminal } from 'lucide-react';

interface TerminalSimulatorProps {
  programs: Program[];
  installers?: InstallerProgram[];
  installersPath?: string;
}

export default function TerminalSimulator({ 
  programs, 
  installers = [], 
  installersPath = 'C:\\Instaladores' 
}: TerminalSimulatorProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [simulatedCpu, setSimulatedCpu] = useState(82);
  const [simulatedRam, setSimulatedRam] = useState(74);
  const [simulatedTemp, setSimulatedTemp] = useState(65);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const activePrograms = programs.filter((p) => p.isActive);
  const activeInstallers = installers.filter((p) => p.isActive);

  // Auto-scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    setProgress(0);
    setSimulatedCpu(82);
    setSimulatedRam(74);
    setSimulatedTemp(65);

    const logSteps: string[] = [];
    
    // Phase 1: Checks
    logSteps.push('Windows PowerShell v7.4.2');
    logSteps.push('Copyright (C) Microsoft Corporation. Todos os direitos reservados.');
    logSteps.push('');
    logSteps.push('[INICIALIZAÇÃO] Verificando permissões administrativas...');
    logSteps.push('[ADMIN] Privilégios de Administrador CONFIRMADOS (In role BuiltIn\\Administrator).');
    logSteps.push('[SISTEMA] Iniciando preparação de rotinas de TI...');
    logSteps.push('[SEGURANÇA] Criando ponto de restauração "OtimizacaoHardwareTI"...');

    let currentLogIndex = 0;
    
    // Simulate initial steps
    const initialInterval = setInterval(() => {
      if (currentLogIndex < logSteps.length) {
        setLogs((prev) => [...prev, logSteps[currentLogIndex]]);
        setProgress((currentLogIndex + 1) * 3);
        currentLogIndex++;
      } else {
        clearInterval(initialInterval);
        // Start processing programs removal first
        runProgramsSimulation();
      }
    }, 450);

    const runProgramsSimulation = () => {
      if (activePrograms.length === 0) {
        setLogs((prev) => [...prev, '', '[SISTEMA] Nenhum bloatware marcado para remoção.', '[SISTEMA] Pulando para a fase de instalação...']);
        setTimeout(runInstallersSimulation, 800);
        return;
      }

      let progIndex = 0;
      
      const nextProgram = () => {
        if (progIndex < activePrograms.length) {
          const p = activePrograms[progIndex];
          const stepPercent = 20 + Math.floor((progIndex / activePrograms.length) * 40);
          setProgress(stepPercent);

          // Update stats gradually
          setSimulatedCpu((prev) => Math.max(15, prev - Math.floor(Math.random() * 12 + 4)));
          setSimulatedRam((prev) => Math.max(30, prev - Math.floor(Math.random() * 8 + 3)));
          setSimulatedTemp((prev) => Math.max(42, prev - Math.floor(Math.random() * 4 + 1)));

          setLogs((prev) => [
            ...prev,
            '',
            `>>> REMOVENDO RECURSO [${progIndex + 1}/${activePrograms.length}]: ${p.name}`,
            `[KILL] Interrompendo processos de "${p.executable || 'programa'}"...`
          ]);

          setTimeout(() => {
            setLogs((prev) => [...prev, `[KILL] Processo finalizado com sucesso.`]);
            
            if (p.serviceName) {
              setLogs((prev) => [
                ...prev,
                `[SERVICE] Parando serviço correspondente: "${p.serviceName}"...`,
                `[SERVICE] Serviço parado e definido para INICIALIZAÇÃO DESABILITADA.`
              ]);
            }

            setTimeout(() => {
              setLogs((prev) => [
                ...prev,
                `[UNINSTALL] Buscando desinstalador silencioso no registro do Windows...`,
                `[UNINSTALL] Executando comando de remoção silenciosa...`,
                `[SUCCESS] ${p.name} desinstalado com sucesso.`
              ]);

              progIndex++;
              setTimeout(nextProgram, 400);
            }, 500);

          }, 400);
        } else {
          // Finished removal, proceed to installers
          setLogs((prev) => [...prev, '', '[SISTEMA] Remoção de bloatwares concluída. Iniciando instalações...']);
          setTimeout(runInstallersSimulation, 800);
        }
      };

      nextProgram();
    };

    const runInstallersSimulation = () => {
      if (activeInstallers.length === 0) {
        finishSimulation();
        return;
      }

      let instIndex = 0;

      const nextInstaller = () => {
        if (instIndex < activeInstallers.length) {
          const inst = activeInstallers[instIndex];
          const stepPercent = 60 + Math.floor((instIndex / activeInstallers.length) * 35);
          setProgress(stepPercent);

          // Update stats to show installer decompression workload
          setSimulatedCpu((prev) => Math.min(95, prev + Math.floor(Math.random() * 20 + 15)));
          setSimulatedRam((prev) => Math.min(88, prev + Math.floor(Math.random() * 10 + 5)));
          setSimulatedTemp((prev) => Math.min(72, prev + Math.floor(Math.random() * 6 + 2)));

          setLogs((prev) => [
            ...prev,
            '',
            `>>> EXECUTANDO INSTALADOR [${instIndex + 1}/${activeInstallers.length}]: ${inst.name}`,
            `[FILE] Verificando existência de "${inst.installerFileName}" na pasta "${installersPath}"...`,
            `[FILE] Arquivo verificado com sucesso. Iniciando em segundo plano...`,
            `[EXEC] Chamando instalador com parâmetros silenciosos: "${inst.silentArgs}"`
          ]);

          setTimeout(() => {
            setLogs((prev) => [
              ...prev,
              `[EXEC] Descompactando binários e gerando arquivos em Program Files...`,
              `[SUCCESS] ${inst.name} instalado com sucesso.`
            ]);

            // CPU stabilizes slightly before next
            setSimulatedCpu((prev) => Math.max(30, prev - 20));

            instIndex++;
            setTimeout(nextInstaller, 600);
          }, 850);
        } else {
          finishSimulation();
        }
      };

      nextInstaller();
    };

    const finishSimulation = () => {
      // Final cleanup phase
      setProgress(98);
      setLogs((prev) => [
        ...prev,
        '',
        `[SISTEMA] Executando limpeza complementar de cache (%TEMP%)...`,
        `[SISTEMA] Arquivos temporários de instalação e logs removidos. Lixeira esvaziada.`,
        `[SUCESSO] Relatório de atividades salvo em "C:\\Temp\\Otimizacao_Hardware_TI.log"`,
        `=============================================================`,
        `   PROCESSO DE TI FINALIZADO COM SUCESSO!`,
        `=============================================================`,
        `CPU livre de remoções: ~${Math.max(10, 82 - simulatedCpu)}% de folga`,
        `RAM liberada estimada: ~${Math.max(250, (74 - simulatedRam) * 80)} MB`,
        `Bloatwares removidos: ${activePrograms.length}`,
        `Softwares instalados: ${activeInstallers.length}`,
        `Sistema operacional pronto para uso do cliente.`,
        ''
      ]);
      setProgress(100);
      
      // Force perfect idle levels
      setSimulatedCpu(14);
      setSimulatedRam(36);
      setSimulatedTemp(43);
      setIsRunning(false);
    };
  };

  const handleResetSimulation = () => {
    setIsRunning(false);
    setLogs([]);
    setProgress(0);
    setSimulatedCpu(82);
    setSimulatedRam(74);
    setSimulatedTemp(65);
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 shadow-lg flex flex-col h-full" id="terminal-simulator-component">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#222222] pb-4 mb-4 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 font-sans">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Simulador de Execução de TI
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Visualize os efeitos da otimização e instalação de programas na máquina do cliente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button
              onClick={handleResetSimulation}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-zinc-300 text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <RotateCcw className="w-4 h-4" />
              Resetar
            </button>
          )}
          <button
            onClick={runSimulation}
            disabled={isRunning || (activePrograms.length === 0 && activeInstallers.length === 0)}
            className={`text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isRunning || (activePrograms.length === 0 && activeInstallers.length === 0)
                ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-emerald-950/20'
            }`}
            type="button"
            id="btn-run-simulation"
          >
            <Play className="w-4 h-4 fill-current" />
            {isRunning ? 'Executando...' : 'Simular Execução'}
          </button>
        </div>
      </div>

      {/* Simulated Hardware Telemetry Panel */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* CPU */}
        <div className="bg-[#080808] border border-[#222222] rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 font-mono">CPU</span>
            <Cpu className={`w-4 h-4 ${simulatedCpu > 50 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold text-white tracking-tight font-mono">{simulatedCpu}%</span>
            <div className="w-full bg-zinc-900 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${simulatedCpu > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${simulatedCpu}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* RAM */}
        <div className="bg-[#080808] border border-[#222222] rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 font-mono">RAM</span>
            <Database className={`w-4 h-4 ${simulatedRam > 60 ? 'text-amber-400' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold text-white tracking-tight font-mono">{simulatedRam}%</span>
            <div className="w-full bg-zinc-900 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${simulatedRam > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${simulatedRam}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Temperatura */}
        <div className="bg-[#080808] border border-[#222222] rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 font-mono">Temp</span>
            <Flame className={`w-4 h-4 ${simulatedTemp > 55 ? 'text-orange-400' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold text-white tracking-tight font-mono">{simulatedTemp}°C</span>
            <div className="w-full bg-zinc-900 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${simulatedTemp > 55 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                style={{ width: `${(simulatedTemp / 100) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal View Panel */}
      <div className="flex-1 bg-[#080808] border border-[#222222] rounded-xl overflow-hidden p-4 font-mono text-[11px] text-sky-400 flex flex-col min-h-[220px]">
        <div className="flex-1 overflow-y-auto max-h-[300px] space-y-1 custom-scrollbar select-text">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-650">
              <Terminal className="w-8 h-8 mb-2 text-zinc-750" />
              <p className="font-semibold text-zinc-500">Pronto para iniciar simulação...</p>
              <p className="text-[10px] mt-1 max-w-xs text-zinc-600">Selecione alguns programas bloatwares na lista esquerda e clique em "Simular Execução".</p>
            </div>
          ) : (
            logs.map((log, index) => {
              let colorClass = 'text-sky-450';
              if (log.startsWith('[ERRO]')) colorClass = 'text-rose-400 font-semibold';
              else if (log.startsWith('[SUCCESS]') || log.includes('CONCLUÍDA COM SUCESSO')) colorClass = 'text-emerald-400 font-semibold';
              else if (log.startsWith('[AVISO]')) colorClass = 'text-amber-300';
              else if (log.startsWith('[ADMIN]') || log.startsWith('[SISTEMA]')) colorClass = 'text-cyan-400';
              else if (log.startsWith('>>>')) colorClass = 'text-white font-semibold bg-[#111111] px-2 py-1 rounded border border-[#222222] block my-2';

              return (
                <div key={index} className={`${colorClass} whitespace-pre-wrap leading-relaxed`}>
                  {log}
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Bottom progress loading bar */}
        {isRunning && (
          <div className="border-t border-[#222222] pt-3 mt-2 flex items-center gap-3">
            <span className="text-[10px] text-zinc-500 select-none uppercase font-bold tracking-wider font-mono">Progresso:</span>
            <div className="flex-1 bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-[10px] text-zinc-400 select-none font-bold w-8 text-right font-mono">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
