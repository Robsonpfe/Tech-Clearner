import { Program } from '../types';

export const DEFAULT_PROGRAMS: Program[] = [
  {
    id: '1',
    name: 'McAfee Safe Connect & WebAdvisor',
    executable: 'mcshield.exe',
    category: 'antivirus',
    impact: 'alto',
    description: 'Suíte antivírus pesada que roda vários processos em segundo plano, consome muita memória RAM e realiza varreduras constantes no disco rígido.',
    uninstallMethod: 'powershell',
    uninstallCommand: 'Get-WmiObject -Class Win32_Product | Where-Object {$_.Name -like "*McAfee*"} | ForEach-Object { $_.Uninstall() }',
    serviceName: 'McShield',
    registryPath: 'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
    isActive: true
  },
  {
    id: '2',
    name: 'CCleaner Background Monitor',
    executable: 'CCleaner64.exe',
    category: 'utilitarios',
    impact: 'medio',
    description: 'Serviço de monitoramento constante que coleta dados e exibe pop-ups comerciais. O CCleaner moderno consome recursos desnecessários após a compra pela Avast.',
    uninstallMethod: 'powershell',
    uninstallCommand: '# Remove CCleaner se instalado via Windows Installer ou Silent Switch\nif (Test-Path "C:\\Program Files\\CCleaner\\uninst.exe") {\n    Start-Process -FilePath "C:\\Program Files\\CCleaner\\uninst.exe" -ArgumentList "/S" -Wait\n}',
    serviceName: 'CCleanerPerformanceService',
    isActive: true
  },
  {
    id: '3',
    name: 'Microsoft OneDrive (Se não utilizado)',
    executable: 'OneDrive.exe',
    category: 'utilitarios',
    impact: 'alto',
    description: 'Inicia com o Windows e fica sincronizando pastas em tempo real. Se o cliente não usa armazenamento em nuvem da Microsoft, consome disco e CPU continuamente.',
    uninstallMethod: 'powershell',
    uninstallCommand: 'Stop-Process -Name "OneDrive" -Force -ErrorAction SilentlyContinue\nStart-Process "$env:SystemRoot\\System32\\OneDriveSetup.exe" -ArgumentList "/uninstall" -Wait\nStart-Process "$env:SystemRoot\\SysWOW64\\OneDriveSetup.exe" -ArgumentList "/uninstall" -Wait -ErrorAction SilentlyContinue',
    isActive: false
  },
  {
    id: '4',
    name: 'Microsoft Teams Personal (Auto-Launch)',
    executable: 'Teams.exe',
    category: 'inicializacao',
    impact: 'alto',
    description: 'Aplicativo baseado em Electron que consome mais de 300MB de RAM parado em segundo plano e retarda o boot do sistema.',
    uninstallMethod: 'powershell',
    uninstallCommand: '# Remove do auto-run do registro e desinstala app Teams\nRemove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "com.squirrel.Teams.Teams" -ErrorAction SilentlyContinue\nGet-AppxPackage -Name "*Teams*" | Remove-AppxPackage -ErrorAction SilentlyContinue',
    isActive: true
  },
  {
    id: '5',
    name: 'HP Touchpoint Analytics Service',
    executable: 'TouchpointService.exe',
    category: 'telemetria',
    impact: 'alto',
    description: 'Serviço de telemetria da HP instalado de fábrica que envia dados de diagnóstico. Conhecido por causar gargalos extremos de disco e CPU de forma intermitente.',
    uninstallMethod: 'powershell',
    uninstallCommand: '# Para, desabilita o serviço e remove aplicativo de telemetria\nStop-Service -Name "TouchpointService" -Force -ErrorAction SilentlyContinue\nSet-Service -Name "TouchpointService" -StartupType Disabled\nGet-WmiObject -Class Win32_Product | Where-Object {$_.Name -like "*HP Touchpoint*"} | ForEach-Object { $_.Uninstall() }',
    serviceName: 'TouchpointService',
    isActive: true
  },
  {
    id: '6',
    name: 'Dell SupportAssist',
    executable: 'SupportAssistAppWire.exe',
    category: 'utilitarios',
    impact: 'alto',
    description: 'Utilitário OEM que agenda verificações automáticas pesadas de hardware em segundo plano, causando picos de uso de CPU de 100%.',
    uninstallMethod: 'powershell',
    uninstallCommand: 'Stop-Service -Name "SupportAssistAgent" -Force -ErrorAction SilentlyContinue\nGet-WmiObject -Class Win32_Product | Where-Object {$_.Name -like "*Dell SupportAssist*"} | ForEach-Object { $_.Uninstall() }',
    serviceName: 'SupportAssistAgent',
    isActive: true
  },
  {
    id: '7',
    name: 'Avast Free Antivirus',
    executable: 'AvastSvc.exe',
    category: 'antivirus',
    impact: 'alto',
    description: 'Consome recursos do processador para publicidade de upgrade e monitoramento agressivo em computadores modestos.',
    uninstallMethod: 'cmd',
    uninstallCommand: ':: Avast exige o desinstalador oficial, mas podemos parar os serviços no boot\nsc config "AvastWscReporter" start= disabled\nsc stop "AvastWscReporter"\nwmic product where "name like \'%%Avast%%\'" call uninstall /nointeractive',
    serviceName: 'AvastWscReporter',
    isActive: false
  },
  {
    id: '8',
    name: 'Windows Telemetry & Customer Experience (Diagsrack)',
    executable: 'CompatTelRunner.exe',
    category: 'telemetria',
    impact: 'medio',
    description: 'Serviço nativo do Windows que reúne informações de uso e envia para a Microsoft. Causa alto uso de disco rígido (HDD) com frequência.',
    uninstallMethod: 'powershell',
    uninstallCommand: '# Desabilita tarefas agendadas de telemetria\nDisable-ScheduledTask -TaskName "\\Microsoft\\Windows\\Application Experience\\Microsoft Compatibility Appraiser" -ErrorAction SilentlyContinue\nDisable-ScheduledTask -TaskName "\\Microsoft\\Windows\\Application Experience\\ProgramDataUpdater" -ErrorAction SilentlyContinue\nDisable-ScheduledTask -TaskName "\\Microsoft\\Windows\\Autochk\\Proxy" -ErrorAction SilentlyContinue\nStop-Service -Name "DiagTrack" -Force -ErrorAction SilentlyContinue\nSet-Service -Name "DiagTrack" -StartupType Disabled',
    serviceName: 'DiagTrack',
    isActive: true
  },
  {
    id: '9',
    name: 'Adobe Creative Cloud Background Helper',
    executable: 'Creative Cloud Helper.exe',
    category: 'inicializacao',
    impact: 'medio',
    description: 'Serviço secundário instalado junto com produtos Adobe que se mantém rodando o tempo todo para gerenciar atualizações e sincronização de fontes.',
    uninstallMethod: 'powershell',
    uninstallCommand: '# Desabilita os serviços da Adobe de inicialização automática\nStop-Service -Name "AdobeUpdateService" -Force -ErrorAction SilentlyContinue\nSet-Service -Name "AdobeUpdateService" -StartupType Disabled\nStop-Service -Name "AGSService" -Force -ErrorAction SilentlyContinue\nSet-Service -Name "AGSService" -StartupType Disabled',
    serviceName: 'AdobeUpdateService',
    isActive: false
  },
  {
    id: '10',
    name: 'Cortana Background Search',
    executable: 'Cortana.exe',
    category: 'telemetria',
    impact: 'baixo',
    description: 'Assistente virtual obsoleta que continua executando indexação e processos secundários de escuta ativa no sistema.',
    uninstallMethod: 'powershell',
    uninstallCommand: '# Desativa a Cortana via registro de política de grupo\nif (!(Test-Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search")) {\n    New-Item -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows" -Name "Windows Search" -Force\n}\nSet-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search" -Name "AllowCortana" -Value 0\nGet-AppxPackage -Name "*Microsoft.Windows.Cortana*" | Remove-AppxPackage -ErrorAction SilentlyContinue',
    isActive: true
  }
];
