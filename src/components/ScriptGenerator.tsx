import React, { useState, useEffect } from 'react';
import { Program, InstallerProgram } from '../types';
import { Copy, Check, Download, ShieldAlert, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

interface ScriptGeneratorProps {
  programs: Program[];
  installers?: InstallerProgram[];
  installersPath?: string;
}

export default function ScriptGenerator({ 
  programs, 
  installers = [], 
  installersPath = 'C:\\Instaladores' 
}: ScriptGeneratorProps) {
  const [scriptType, setScriptType] = useState<'powershell' | 'cmd' | 'python'>('powershell');
  const [createRestorePoint, setCreateRestorePoint] = useState(true);
  const [logResults, setLogResults] = useState(true);
  const [logFilePath, setLogFilePath] = useState('C:\\Temp\\Otimizacao_Hardware_TI.log');
  const [forceClose, setForceClose] = useState(true);
  const [rebootPrompt, setRebootPrompt] = useState(false);
  const [includeInstallers, setIncludeInstallers] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');

  const activePrograms = programs.filter((p) => p.isActive);

  // Compile the script whenever selection or settings change
  useEffect(() => {
    let script = '';

    if (scriptType === 'powershell') {
      script += `# =========================================================================\n`;
      script += `# SCRIPT DE LIMPEZA E DESINSTALAÇÃO DE BLOATWARE EM SEGUNDO PLANO\n`;
      script += `# Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}\n`;
      script += `# Destinado para otimização de hardware e liberação de memória RAM/CPU.\n`;
      script += `# =========================================================================\n\n`;

      // Check Administrator privileges
      script += `# Garante privilégios de Administrador\n`;
      script += `if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {\n`;
      script += `    Write-Error "Por favor, execute este script como ADMINISTRADOR do sistema."\n`;
      script += `    Exit\n`;
      script += `}\n\n`;

      // Create Restore Point
      if (createRestorePoint) {
        script += `# 1. Criação de Ponto de Restauração de Segurança\n`;
        script += `Write-Host "[SEGURANÇA] Criando Ponto de Restauração do Sistema..." -ForegroundColor Cyan\n`;
        script += `Enable-ComputerRestore -Drive "C:" -ErrorAction SilentlyContinue\n`;
        script += `Checkpoint-Computer -Description "OtimizacaoBloatwareTI" -RestorePointType MODIFY_SETTINGS -ErrorAction SilentlyContinue\n\n`;
      }

      // Logging setup
      if (logResults) {
        script += `# Configuração de Arquivo de Log\n`;
        script += `$logFile = "${logFilePath.replace(/\\/g, '\\\\')}"\n`;
        script += `$logFolder = Split-Path -Parent $logFile\n`;
        script += `if ($logFolder -and !(Test-Path $logFolder)) { New-Item -ItemType Directory -Force -Path $logFolder | Out-Null }\n`;
        script += `Add-Content -Path $logFile -Value "--- Início da Limpeza: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss') ---"\n\n`;
      }

      script += `Write-Host "==========================================================" -ForegroundColor Green\n`;
      script += `Write-Host "    INICIANDO REMOÇÃO DE PROGRAMAS EM SEGUNDO PLANO     " -ForegroundColor Green\n`;
      script += `Write-Host "==========================================================" -ForegroundColor Green\n\n`;

      if (activePrograms.length === 0) {
        script += `Write-Host "Nenhum programa foi selecionado para remoção no painel do técnico." -ForegroundColor Yellow\n`;
      } else {
        activePrograms.forEach((p, idx) => {
          script += `# --- [${idx + 1}/${activePrograms.length}] REMOVENDO: ${p.name} ---\n`;
          script += `Write-Host "[${idx + 1}/${activePrograms.length}] Removendo ${p.name}..." -ForegroundColor Yellow\n`;
          
          if (logResults) {
            script += `Add-Content -Path $logFile -Value "[REMOÇÃO] [$(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')] Iniciando desinstalação de ${p.name}..."\n`;
          }

          // Force kill process if enabled
          if (forceClose && p.executable) {
            const processName = p.executable.replace('.exe', '');
            script += `Write-Host "Parando processo active: ${p.executable}..." -ForegroundColor DarkYellow\n`;
            script += `Stop-Process -Name "${processName}" -Force -ErrorAction SilentlyContinue\n`;
          }

          // Stop and disable windows service if defined
          if (p.serviceName) {
            script += `Write-Host "Desabilitando serviço correspondente: ${p.serviceName}..." -ForegroundColor DarkYellow\n`;
            script += `Stop-Service -Name "${p.serviceName}" -Force -ErrorAction SilentlyContinue\n`;
            script += `Set-Service -Name "${p.serviceName}" -StartupType Disabled -ErrorAction SilentlyContinue\n`;
          }

          // Run actual command
          script += `# Executa o comando de desinstalação\n`;
          script += `try {\n`;
          script += `    ${p.uninstallCommand}\n`;
          if (logResults) {
            script += `    Add-Content -Path $logFile -Value "[SUCESSO] [$(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')] ${p.name} removido com sucesso."\n`;
          }
          script += `    Write-Host "[OK] Remoção de ${p.name} concluída com sucesso." -ForegroundColor Green\n`;
          script += `} catch {\n`;
          if (logResults) {
            script += `    Add-Content -Path $logFile -Value "[FALHA] [$(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')] Erro ao desinstalar ${p.name}. Detalhes: $_"\n`;
          }
          script += `    Write-Host "[FALHA] Erro ao remover ${p.name}." -ForegroundColor Rose\n`;
          script += `}\n\n`;
        });
      }

      // Clean cache / telemetry logs
      script += `# Limpezas adicionais de sistema\n`;
      script += `Write-Host "Limpando arquivos temporários e logs inúteis..." -ForegroundColor Cyan\n`;
      script += `Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue\n`;
      script += `Clear-RecycleBin -Force -ErrorAction SilentlyContinue\n\n`;

      // Instalação de Programas (Instaladores Locais)
      const activeInstallers = installers.filter((p) => p.isActive);
      if (includeInstallers && activeInstallers.length > 0) {
        script += `# Instalação de Programas (Instaladores Locais)\n`;
        script += `$installersFolder = "${installersPath.replace(/\\/g, '\\\\')}"\n`;
        script += `Write-Host "==========================================================" -ForegroundColor Cyan\n`;
        script += `Write-Host "    INICIANDO INSTALAÇÃO DE PROGRAMAS SELECIONADOS     " -ForegroundColor Cyan\n`;
        script += `Write-Host "==========================================================" -ForegroundColor Cyan\n\n`;
        script += `if (Test-Path $installersFolder) {\n`;
        script += `    Write-Host "[INFO] Usando diretório de instaladores: $installersFolder" -ForegroundColor Gray\n`;
        
        activeInstallers.forEach((p, idx) => {
          script += `    # --- [${idx + 1}/${activeInstallers.length}] INSTALANDO: ${p.name} ---\n`;
          script += `    $installerPath = Join-Path $installersFolder "${p.installerFileName}"\n`;
          script += `    if (Test-Path $installerPath) {\n`;
          script += `        Write-Host "[${idx + 1}/${activeInstallers.length}] Instalando ${p.name}..." -ForegroundColor Yellow\n`;
          if (logResults) {
            script += `        Add-Content -Path $logFile -Value "[INSTALAÇÃO] [$(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')] Iniciando instalação de ${p.name}..."\n`;
          }
          script += `        try {\n`;
          script += `            $proc = Start-Process -FilePath $installerPath -ArgumentList "${p.silentArgs}" -Wait -NoNewWindow -PassThru -ErrorAction Stop\n`;
          script += `            if ($proc.ExitCode -eq 0) {\n`;
          script += `                Write-Host "[OK] ${p.name} instalado com sucesso!" -ForegroundColor Green\n`;
          if (logResults) {
            script += `                Add-Content -Path $logFile -Value "[SUCESSO] [$(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')] ${p.name} instalado com sucesso."\n`;
          }
          script += `            } else {\n`;
          script += `                Write-Host "[AVISO] ${p.name} finalizou com código: $($proc.ExitCode)" -ForegroundColor Orange\n`;
          if (logResults) {
            script += `                Add-Content -Path $logFile -Value "[AVISO] [$(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')] ${p.name} concluído com código de saída $($proc.ExitCode)"\n`;
          }
          script += `            }\n`;
          script += `        } catch {\n`;
          script += `            Write-Host "[FALHA] Erro ao instalar ${p.name}. Detalhes: $_" -ForegroundColor Rose\n`;
          if (logResults) {
            script += `            Add-Content -Path $logFile -Value "[FALHA] [$(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')] Erro ao instalar ${p.name}. Detalhes: $_"\n`;
          }
          script += `        }\n`;
          script += `    } else {\n`;
          script += `        Write-Host "[ERRO] Instalador para ${p.name} não encontrado em: $installerPath" -ForegroundColor Red\n`;
          if (logResults) {
            script += `        Add-Content -Path $logFile -Value "[ERRO] [$(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')] Arquivo não encontrado: $installerPath"\n`;
          }
          script += `    }\n\n`;
        });
        
        script += `} else {\n`;
        script += `    Write-Host "[ERRO] Pasta de instaladores não encontrada: $installersFolder" -ForegroundColor Red\n`;
        if (logResults) {
          script += `    Add-Content -Path $logFile -Value "[ERRO] [$(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')] Pasta de instaladores não encontrada: $installersFolder"\n`;
        }
        script += `}\n\n`;
      }

      if (logResults) {
        script += `Add-Content -Path $logFile -Value "--- Concluído em: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss') ---"\n`;
        script += `Write-Host "[LOG] Relatório salvo em: ${logFilePath}" -ForegroundColor Gray\n`;
      }

      script += `Write-Host "==========================================================" -ForegroundColor Green\n`;
      script += `Write-Host "    OTIMIZAÇÃO FINALIZADA COM SUCESSO! REINICIE O PC     " -ForegroundColor Green\n`;
      script += `Write-Host "==========================================================" -ForegroundColor Green\n`;

      if (rebootPrompt) {
        script += `\n# Prompt para reiniciar\n`;
        script += `$reboot = Read-Host "Deseja reiniciar o computador agora para aplicar as mudanças? (S/N)"\n`;
        script += `if ($reboot -eq "S" -or $reboot -eq "s") {\n`;
        script += `    Restart-Computer -Force\n`;
        script += `}\n`;
      }
    } else if (scriptType === 'cmd') {
      // CMD / Batch version
      script += `@echo off\n`;
      script += `chcp 65001 > nul\n`;
      script += `:: =========================================================================\n`;
      script += `:: SCRIPT BATCH DE LIMPEZA DE BLOATWARE E PROGRAMAS INÚTEIS\n`;
      script += `:: Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}\n`;
      script += `:: =========================================================================\n\n`;

      // Check Administrator privileges
      script += `:: Verifica se está rodando como Administrador\n`;
      script += `NET SESSION >nul 2>&1\n`;
      script += `IF %ERRORLEVEL% NEQ 0 (\n`;
      script += `    echo [ERRO] ESTE SCRIPT DEVE SER EXECUTADO COMO ADMINISTRADOR!\n`;
      script += `    echo Clique com o botão direito e selecione "Executar como Administrador".\n`;
      script += `    pause\n`;
      script += `    exit /b\n`;
      script += `)\n\n`;

      // Logging setup for CMD
      if (logResults) {
        script += `:: Configuração do Arquivo de Log\n`;
        script += `set "logFile=${logFilePath}"\n`;
        script += `for %%I in ("%logFile%") do set "logDir=%%~dpI"\n`;
        script += `if not exist "%logDir%" mkdir "%logDir%" >nul 2>&1\n`;
        script += `echo --- Início da Limpeza: %date% %time% --- >> "%logFile%"\n\n`;
      }

      script += `echo ==========================================================\n`;
      script += `echo    INICIANDO LIMPEZA PARA MELHORIA DE PERFORMANCE\n`;
      script += `echo ==========================================================\n\n`;

      if (activePrograms.length === 0) {
        script += `echo Nenhum programa foi selecionado para remoção.\n`;
      } else {
        activePrograms.forEach((p, idx) => {
          script += `:: --- [${idx + 1}/${activePrograms.length}] REMOVENDO: ${p.name} ---\n`;
          script += `echo [${idx + 1}/${activePrograms.length}] Removendo ${p.name}...\n`;
          
          if (logResults) {
            script += `echo [REMOÇÃO] [%date% %time%] Iniciando desinstalação de ${p.name}... >> "%logFile%"\n`;
          }

          if (forceClose && p.executable) {
            script += `echo Parando processo: ${p.executable}...\n`;
            script += `taskkill /f /im "${p.executable}" /t >nul 2>&1\n`;
          }

          if (p.serviceName) {
            script += `echo Parando serviço: ${p.serviceName}...\n`;
            script += `net stop "${p.serviceName}" >nul 2>&1\n`;
            script += `sc config "${p.serviceName}" start= disabled >nul 2>&1\n`;
          }

          // Output the removal command
          if (p.uninstallMethod === 'powershell') {
            // Bridge powershell command into batch if necessary
            script += `powershell -NoProfile -Command "${p.uninstallCommand.replace(/"/g, '\\"')}"\n`;
          } else {
            script += `${p.uninstallCommand}\n`;
          }

          script += `if %errorlevel% equ 0 (\n`;
          script += `    echo [OK] Remoção de ${p.name} concluída com sucesso.\n`;
          if (logResults) {
            script += `    echo [SUCESSO] [%date% %time%] ${p.name} desinstalado com sucesso. >> "%logFile%"\n`;
          }
          script += `) else (\n`;
          script += `    echo [FALHA] Falha na remoção de ${p.name}.\n`;
          if (logResults) {
            script += `    echo [FALHA] [%date% %time%] Erro ao desinstalar ${p.name} (ErrorLevel: %errorlevel%). >> "%logFile%"\n`;
          }
          script += `)\n\n`;
        });
      }

      script += `:: Limpeza adicional de caches\n`;
      script += `echo Limpando arquivos temporários...\n`;
      script += `del /q /f /s "%TEMP%\\*.*" >nul 2>&1\n\n`;

      // Instalação de Programas (Instaladores Locais)
      const activeInstallersCMD = installers.filter((p) => p.isActive);
      if (includeInstallers && activeInstallersCMD.length > 0) {
        script += `:: Instalação de Programas (Instaladores Locais)\n`;
        script += `set "installersFolder=${installersPath}"\n`;
        script += `echo ==========================================================\n`;
        script += `echo    INICIANDO INSTALAÇÃO DE PROGRAMAS SELECIONADOS\n`;
        script += `echo ==========================================================\n\n`;
        script += `if exist "%installersFolder%" (\n`;
        script += `    echo [INFO] Usando diretório de instaladores: %installersFolder%\n`;
        
        activeInstallersCMD.forEach((p, idx) => {
          script += `    :: --- [${idx + 1}/${activeInstallersCMD.length}] INSTALANDO: ${p.name} ---\n`;
          script += `    if exist "%installersFolder%\\${p.installerFileName}" (\n`;
          script += `        echo [${idx + 1}/${activeInstallersCMD.length}] Instalando ${p.name}...\n`;
          if (logResults) {
            script += `        echo [INSTALAÇÃO] [%%date%% %%time%%] Iniciando instalação de ${p.name}... >> "%logFile%"\n`;
          }
          script += `        start /wait "" "%installersFolder%\\${p.installerFileName}" ${p.silentArgs}\n`;
          script += `        if %errorlevel% equ 0 (\n`;
          script += `            echo [OK] ${p.name} instalado com sucesso!\n`;
          if (logResults) {
            script += `            echo [SUCESSO] [%%date%% %%time%%] ${p.name} instalado com sucesso. >> "%logFile%"\n`;
          }
          script += `        ) else (\n`;
          script += `            echo [AVISO] ${p.name} finalizou com código: %%errorlevel%%\n`;
          if (logResults) {
            script += `            echo [AVISO] [%%date%% %%time%%] ${p.name} finalizou com código %%errorlevel%% >> "%logFile%"\n`;
          }
          script += `        )\n`;
          script += `    ) else (\n`;
          script += `        echo [ERRO] Instalador para ${p.name} não encontrado em: %%installersFolder%%\\${p.installerFileName}\n`;
          if (logResults) {
            script += `        echo [ERRO] [%%date%% %%time%%] Arquivo não encontrado: %%installersFolder%%\\${p.installerFileName} >> "%logFile%"\n`;
          }
          script += `    )\n\n`;
        });
        
        script += `) else (\n`;
        script += `    echo [ERRO] Pasta de instaladores não encontrada: %%installersFolder%%\n`;
        if (logResults) {
          script += `    echo [ERRO] [%%date%% %%time%%] Pasta de instaladores não encontrada: %%installersFolder%% >> "%logFile%"\n`;
        }
        script += `)\n\n`;
      }

      if (logResults) {
        script += `echo --- Concluído em: %date% %time% --- >> "%logFile%"\n`;
        script += `echo [LOG] Relatório salvo em: ${logFilePath}\n`;
      }

      script += `echo ==========================================================\n`;
      script += `echo    PROCESSO DE OTIMIZAÇÃO CONCLUÍDO COM SUCESSO!\n`;
      script += `echo ==========================================================\n`;

      if (rebootPrompt) {
        script += `set /p reboot="Deseja reiniciar a máquina agora? (S/N): "\n`;
        script += `if /i "%reboot%"=="S" shutdown /r /t 5\n`;
      } else {
        script += `pause\n`;
      }
    } else if (scriptType === 'python') {
      // Python version using Python's logging module
      script += `# -*- coding: utf-8 -*-\n`;
      script += `"""\n`;
      script += `SCRIPT DE LIMPEZA E DESINSTALAÇÃO DE BLOATWARE EM SEGUNDO PLANO (PYTHON)\n`;
      script += `Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}\n`;
      script += `Destinado para otimização de hardware e liberação de memória RAM/CPU.\n`;
      script += `"""\n\n`;
      script += `import os\n`;
      script += `import sys\n`;
      script += `import subprocess\n`;
      script += `import logging\n`;
      script += `from datetime import datetime\n\n`;

      script += `# Configuração do local do arquivo de log (Configurável)\n`;
      script += `LOG_FILE = r"${logFilePath}"\n\n`;

      script += `# Garante que o diretório de logs exista\n`;
      script += `log_dir = os.path.dirname(LOG_FILE)\n`;
      script += `if log_dir and not os.path.exists(log_dir):\n`;
      script += `    try:\n`;
      script += `        os.makedirs(log_dir, exist_ok=True)\n`;
      script += `    except Exception as e:\n`;
      script += `        print(f"Erro ao criar diretório de log: {e}", file=sys.stderr)\n\n`;

      script += `# Configura o módulo 'logging' do Python para registrar nome, data/hora e status\n`;
      script += `logging.basicConfig(\n`;
      script += `    level=logging.INFO,\n`;
      script += `    format='%(asctime)s - %(levelname)s - %(message)s',\n`;
      if (logResults) {
        script += `    handlers=[\n`;
        script += `        logging.FileHandler(LOG_FILE, encoding='utf-8', mode='a'),\n`;
        script += `        logging.StreamHandler(sys.stdout)\n`;
        script += `    ]\n`;
      } else {
        script += `    handlers=[\n`;
        script += `        logging.StreamHandler(sys.stdout)\n`;
        script += `    ]\n`;
      }
      script += `)\n\n`;

      script += `def check_admin():\n`;
      script += `    try:\n`;
      script += `        import ctypes\n`;
      script += `        return ctypes.windll.shell32.IsUserAnAdmin() != 0\n`;
      script += `    except:\n`;
      script += `        return False\n\n`;

      script += `if sys.platform == 'win32' and not check_admin():\n`;
      script += `    logging.error("ESTE SCRIPT DEVE SER EXECUTADO COMO ADMINISTRADOR DO SISTEMA!")\n`;
      script += `    print("Por favor, execute o terminal como Administrador antes de rodar o script.")\n`;
      script += `    input("Pressione Enter para sair...")\n`;
      script += `    sys.exit(1)\n\n`;

      script += `logging.info("==========================================================")\n`;
      script += `logging.info("    INICIANDO REMOÇÃO DE PROGRAMAS EM SEGUNDO PLANO     ")\n`;
      script += `logging.info("==========================================================")\n\n`;

      if (activePrograms.length === 0) {
        script += `logging.warning("Nenhum programa foi selecionado para remoção no painel do técnico.")\n`;
      } else {
        script += `programs = [\n`;
        activePrograms.forEach((p) => {
          script += `    {\n`;
          script += `        "name": ${JSON.stringify(p.name)},\n`;
          script += `        "executable": ${JSON.stringify(p.executable || '')},\n`;
          script += `        "serviceName": ${JSON.stringify(p.serviceName || '')},\n`;
          script += `        "uninstallCommand": ${JSON.stringify(p.uninstallCommand)},\n`;
          script += `        "uninstallMethod": ${JSON.stringify(p.uninstallMethod)}\n`;
          script += `    },\n`;
        });
        script += `]\n\n`;

        script += `for idx, p in enumerate(programs, 1):\n`;
        script += `    name = p["name"]\n`;
        script += `    exe = p["executable"]\n`;
        script += `    service = p["serviceName"]\n`;
        script += `    cmd = p["uninstallCommand"]\n`;
        script += `    method = p["uninstallMethod"]\n\n`;
        
        script += `    logging.info(f"[{idx}/{len(programs)}] Iniciando remoção de: {name}")\n`;
        
        if (forceClose) {
          script += `    if exe:\n`;
          script += `        logging.info(f"Parando processo ativo: {exe}")\n`;
          script += `        subprocess.run(f"taskkill /f /im \\"{exe}\\" /t", shell=True, capture_output=True)\n`;
        }
        
        script += `    if service:\n`;
        script += `        logging.info(f"Parando e desabilitando serviço: {service}")\n`;
        script += `        subprocess.run(f"net stop \\"{service}\\"", shell=True, capture_output=True)\n`;
        script += `        subprocess.run(f"sc config \\"{service}\\" start=disabled", shell=True, capture_output=True)\n`;

        script += `    # Comando de desinstalação\n`;
        script += `    logging.info(f"Executando comando de desinstalação para {name}...")\n`;
        script += `    try:\n`;
        script += `        if method == 'powershell':\n`;
        script += `            res = subprocess.run(["powershell", "-NoProfile", "-Command", cmd], capture_output=True, text=True, shell=True)\n`;
        script += `        else:\n`;
        script += `            res = subprocess.run(cmd, capture_output=True, text=True, shell=True)\n\n`;
        script += `        if res.returncode == 0:\n`;
        script += `            logging.info(f"STATUS [SUCESSO]: {name} desinstalado com sucesso.")\n`;
        script += `        else:\n`;
        script += `            logging.error(f"STATUS [FALHA]: Falha na desinstalação de {name}. Código de retorno: {res.returncode}. Erro: {res.stderr.strip() if res.stderr else 'Desconhecido'}")\n`;
        script += `    except Exception as e:\n`;
        script += `        logging.error(f"STATUS [FALHA]: Exceção ao tentar desinstalar {name}. Detalhes: {str(e)}")\n\n`;
      }

      script += `logging.info("Limpando arquivos temporários e caches...")\n`;
      script += `try:\n`;
      script += `    temp_dir = os.environ.get("TEMP", "")\n`;
      script += `    if temp_dir and os.path.exists(temp_dir):\n`;
      script += `        for item in os.listdir(temp_dir):\n`;
      script += `            try:\n`;
      script += `                path = os.path.join(temp_dir, item)\n`;
      script += `                if os.path.isfile(path):\n`;
      script += `                    os.remove(path)\n`;
      script += `            except:\n`;
      script += `                pass\n`;
      script += `except Exception as e:\n`;
      script += `    logging.warning(f"Erro ao limpar temporários: {e}")\n\n`;

      // Instalação de Programas (Instaladores Locais)
      const activeInstallersPy = installers.filter((p) => p.isActive);
      if (includeInstallers && activeInstallersPy.length > 0) {
        script += `logging.info("==========================================================")\n`;
        script += `logging.info("    INICIANDO INSTALAÇÃO DE PROGRAMAS SELECIONADOS     ")\n`;
        script += `logging.info("==========================================================")\n\n`;
        script += `installers_folder = r"${installersPath}"\n`;
        script += `if os.path.exists(installers_folder):\n`;
        script += `    logging.info(f"[INFO] Usando diretório de instaladores: {installers_folder}")\n`;
        script += `    installers_data = [\n`;
        activeInstallersPy.forEach((p) => {
          script += `        {\n`;
          script += `            "name": ${JSON.stringify(p.name)},\n`;
          script += `            "fileName": ${JSON.stringify(p.installerFileName)},\n`;
          script += `            "args": ${JSON.stringify(p.silentArgs)}\n`;
          script += `        },\n`;
        });
        script += `    ]\n\n`;
        script += `    for idx, inst in enumerate(installers_data, 1):\n`;
        script += `        name = inst["name"]\n`;
        script += `        file_name = inst["fileName"]\n`;
        script += `        args = inst["args"]\n`;
        script += `        path = os.path.join(installers_folder, file_name)\n\n`;
        script += `        if os.path.exists(path):\n`;
        script += `            logging.info(f"[{idx}/{len(installers_data)}] Instalando {name}...")\n`;
        script += `            try:\n`;
        script += `                # Executa o instalador\n`;
        script += `                res = subprocess.run(f'"{path}" {args}', shell=True, capture_output=True, text=True)\n`;
        script += `                if res.returncode == 0:\n`;
        script += `                    logging.info(f"STATUS [SUCESSO]: {name} instalado com sucesso.")\n`;
        script += `                else:\n`;
        script += `                    logging.warning(f"STATUS [AVISO]: {name} finalizou com código de retorno: {res.returncode}. Erro: {res.stderr.strip() if res.stderr else ''}")\n`;
        script += `            except Exception as e:\n`;
        script += `                logging.error(f"STATUS [FALHA]: Erro ao tentar instalar {name}. Detalhes: {str(e)}")\n`;
        script += `        else:\n`;
        script += `            logging.error(f"[ERRO]: Arquivo instalador de {name} não encontrado em: {path}")\n\n`;
        script += `else:\n`;
        script += `    logging.error(f"[ERRO]: Diretório de instaladores não existe: {installers_folder}")\n\n`;
      }

      script += `logging.info("==========================================================")\n`;
      script += `logging.info("    OTIMIZAÇÃO E REMOÇÃO FINALIZADAS COM SUCESSO!         ")\n`;
      script += `logging.info("==========================================================")\n\n`;

      if (rebootPrompt) {
        script += `reboot = input("Deseja reiniciar o computador agora? (S/N): ")\n`;
        script += `if reboot.upper() in ['S', 'SIM']:\n`;
        script += `    os.system("shutdown /r /t 5")\n`;
      }
    }

    setGeneratedScript(script);
  }, [scriptType, activePrograms, installers, installersPath, createRestorePoint, logResults, logFilePath, forceClose, rebootPrompt, includeInstallers]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extension = scriptType === 'powershell' ? 'ps1' : scriptType === 'cmd' ? 'bat' : 'py';
    const filename = `Otimizador_Background_TI.${extension}`;
    const blob = new Blob([generatedScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 shadow-lg flex flex-col h-full" id="script-generator-component">
      <div className="flex items-center justify-between border-b border-[#222222] pb-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 font-sans">
            <FileCode className="w-5 h-5 text-emerald-400" />
            Gerador de Scripts Automatizados
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gere scripts prontos para rodar no Windows do cliente e agilizar sua rotina.
          </p>
        </div>
      </div>

      {/* Script Selection & Customizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-3 bg-[#080808] border border-[#222222] p-4 rounded-xl">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
            Configurações do Script
          </h4>
          
          <div className="space-y-2.5">
            <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={createRestorePoint}
                onChange={(e) => setCreateRestorePoint(e.target.checked)}
                disabled={scriptType === 'cmd' || scriptType === 'python'}
                className="rounded bg-[#080808] border-[#333333] text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className={scriptType === 'cmd' || scriptType === 'python' ? 'opacity-50' : ''}>
                Criar Ponto de Restauração antes (PowerShell)
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={forceClose}
                onChange={(e) => setForceClose(e.target.checked)}
                className="rounded bg-[#080808] border-[#333333] text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span>Forçar encerramento dos processos ativos</span>
            </label>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={logResults}
                  onChange={(e) => setLogResults(e.target.checked)}
                  className="rounded bg-[#080808] border-[#333333] text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Registrar logs das desinstalações</span>
              </label>
              
              {logResults && (
                <div className="mt-1 pl-6 space-y-1">
                  <label className="block text-[10px] text-zinc-500 uppercase font-bold font-mono">
                    Caminho do Arquivo de Log:
                  </label>
                  <input
                    type="text"
                    value={logFilePath}
                    onChange={(e) => setLogFilePath(e.target.value)}
                    placeholder="Ex: C:\Temp\Otimizacao_Hardware_TI.log"
                    className="w-full bg-[#080808] border border-[#222222] focus:border-emerald-500 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-700 focus:outline-none transition-colors font-mono"
                  />
                </div>
              )}
            </div>

            <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={rebootPrompt}
                onChange={(e) => setRebootPrompt(e.target.checked)}
                className="rounded bg-[#080808] border-[#333333] text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span>Solicitar reinicialização do PC no final</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer bg-sky-950/5 border border-sky-900/10 p-2 rounded-lg hover:bg-sky-950/10 transition-colors">
              <input
                type="checkbox"
                checked={includeInstallers}
                onChange={(e) => setIncludeInstallers(e.target.checked)}
                className="rounded bg-[#080808] border-[#333333] text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-semibold text-sky-400">
                Gerar rotina de instalação de programas no script
              </span>
            </label>
          </div>
        </div>

        <div className="bg-[#080808] border border-[#222222] p-4 rounded-xl flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
              Tipo de Terminal / Formato
            </h4>
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              <button
                onClick={() => setScriptType('powershell')}
                className={`py-2 rounded-lg text-[10px] sm:text-xs font-semibold border flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                  scriptType === 'powershell'
                    ? 'bg-zinc-800 border-zinc-700 text-emerald-400 shadow-sm'
                    : 'bg-[#080808] border-[#222222] text-zinc-400 hover:text-white'
                }`}
                title="Gera script em PowerShell (.ps1)"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>PowerShell</span>
              </button>
              <button
                onClick={() => setScriptType('cmd')}
                className={`py-2 rounded-lg text-[10px] sm:text-xs font-semibold border flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                  scriptType === 'cmd'
                    ? 'bg-zinc-800 border-zinc-700 text-emerald-400 shadow-sm'
                    : 'bg-[#080808] border-[#222222] text-zinc-400 hover:text-white'
                }`}
                title="Gera script CMD/Batch (.bat)"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Batch CMD</span>
              </button>
              <button
                onClick={() => setScriptType('python')}
                className={`py-2 rounded-lg text-[10px] sm:text-xs font-semibold border flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                  scriptType === 'python'
                    ? 'bg-zinc-800 border-zinc-700 text-emerald-400 shadow-sm'
                    : 'bg-[#080808] border-[#222222] text-zinc-400 hover:text-white'
                }`}
                title="Gera script Python (.py) com logging"
              >
                <FileCode className="w-3.5 h-3.5 text-sky-400" />
                <span>Python</span>
              </button>
            </div>
          </div>

          <div className="mt-4 border-t border-[#222222] pt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>{activePrograms.length}</strong> de <strong>{programs.length}</strong> bloatwares marcados para remoção.
              </span>
            </div>
            {installers.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>
                  <strong>{installers.filter(i => i.isActive).length}</strong> de <strong>{installers.length}</strong> programas marcados para instalação.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Previewer Pane */}
      <div className="flex-1 flex flex-col bg-[#080808] border border-[#222222] rounded-xl overflow-hidden relative">
        <div className="bg-zinc-900/40 px-4 py-2 border-b border-[#222222] flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
            {scriptType === 'powershell' 
              ? 'PowerShell - Executável de TI' 
              : scriptType === 'cmd' 
                ? 'CMD Batch Script' 
                : 'Python uninstaller (módulo logging)'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              type="button"
              id="btn-copy-script"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Script</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-black border border-emerald-500/20 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              type="button"
              id="btn-download-script"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Arquivo</span>
            </button>
          </div>
        </div>

        {/* Script code codebox */}
        <div className="flex-1 p-4 overflow-y-auto max-h-[300px] text-xs font-mono text-emerald-400/90 whitespace-pre custom-scrollbar select-text bg-[#080808]">
          {generatedScript}
        </div>
      </div>

      {/* Safety Notice block */}
      <div className="mt-4 flex gap-3 bg-rose-950/10 border border-rose-900/20 p-3.5 rounded-lg">
        <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-semibold text-rose-300 font-sans">AVISO DE EXECUÇÃO DE TI:</h5>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Alguns aplicativos (como antivírus instalados pelo fabricante) usam mecanismos de autoproteção. Para uma desinstalação perfeita, o script tenta desabilitar serviços e processos preliminares, mas certifique-se de executar o arquivo sempre com permissão de administrador no cliente.
          </p>
        </div>
      </div>
    </div>
  );
}
