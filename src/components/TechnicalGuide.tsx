import React from 'react';
import { ShieldAlert, BookOpen, Monitor, Terminal, FileCode, CheckSquare, Settings } from 'lucide-react';

export default function TechnicalGuide() {
  const shortCommands = [
    { cmd: 'services.msc', desc: 'Gerenciador de Serviços do Windows' },
    { cmd: 'taskschd.msc', desc: 'Agendador de Tarefas do Windows' },
    { cmd: 'regedit', desc: 'Editor do Registro (Remoções manuais profundas)' },
    { cmd: 'appwiz.cpl', desc: 'Programas e Recursos clássico (Desinstalar)' },
    { cmd: 'msconfig', desc: 'Configuração do Sistema (Modo de segurança)' },
    { cmd: 'perfmon', desc: 'Monitor de Desempenho do Hardware' }
  ];

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 shadow-lg space-y-5" id="technical-guide-component">
      <div className="flex items-center gap-2 border-b border-[#222222] pb-3">
        <BookOpen className="w-5 h-5 text-sky-400" />
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-sans">
          Guia de Boas Práticas do Técnico de TI
        </h3>
      </div>

      <div className="space-y-4">
        {/* Como Executar os Scripts */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-zinc-350 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            Como Executar os Scripts com Segurança:
          </h4>
          <ol className="list-decimal list-inside text-xs text-zinc-400 space-y-1 pl-1">
            <li>
              No computador do cliente, faça o download do script <strong className="text-emerald-400 font-mono">.ps1</strong> ou <strong className="text-emerald-400 font-mono">.bat</strong>.
            </li>
            <li>
              Se for o PowerShell, abra o console como <strong className="text-white">Administrador</strong> e execute o comando:
              <div className="my-1.5 bg-[#080808] border border-[#222222] px-3 py-1.5 rounded font-mono text-[10.5px] text-sky-400 select-all">
                Set-ExecutionPolicy Bypass -Scope Process -Force
              </div>
              Isto permite que o script rode apenas nesta seção do console, sem alterar a segurança permanente do Windows.
            </li>
            <li>
              Navegue até a pasta do arquivo e digite <code className="font-mono text-emerald-400 text-xs bg-[#080808] px-1 py-0.5 rounded border border-[#222222]/50">.\Otimizador_Background_TI.ps1</code> para iniciar o lote silencioso.
            </li>
            <li>
              Aguarde a conclusão e reinicie o computador para limpar as chaves de registro presas.
            </li>
          </ol>
        </div>

        {/* Atalhos do Windows */}
        <div className="border-t border-[#222222] pt-4 space-y-2">
          <h4 className="text-xs font-semibold text-zinc-350 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full"></span>
            Comandos Rápidos úteis de TI (Windows + R):
          </h4>
          <p className="text-[11px] text-zinc-500 font-sans">
            Copie e cole na caixa de diálogo de executar do Windows para abrir ferramentas úteis instantaneamente no cliente:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {shortCommands.map((item, index) => (
              <div key={index} className="bg-[#080808] border border-[#222222] p-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <code className="text-xs font-mono text-emerald-400 bg-black border border-[#222222]/80 px-1.5 py-0.5 rounded select-all">
                    {item.cmd}
                  </code>
                  <p className="text-[10px] text-zinc-500 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Entendendo o impacto no Hardware */}
        <div className="border-t border-[#222222] pt-4 space-y-2">
          <h4 className="text-xs font-semibold text-zinc-350 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 bg-rose-450 rounded-full"></span>
            Por que serviços em segundo plano prejudicam o hardware?
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Muitos programas de inicialização desnecessários usam <strong className="text-rose-450">Varreduras em Lote</strong> no HD/SSD e realizam <strong className="text-rose-450">Verificações Periódicas de Atualização</strong>. Em hardwares mais antigos ou notebooks, isso causa gargalos térmicos e saturação do uso de disco (Erro do disco 100%), resultando em travamentos que o usuário percebe como "computador lento".
          </p>
        </div>
      </div>
    </div>
  );
}
