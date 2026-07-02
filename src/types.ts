export type ProgramCategory = 'antivirus' | 'telemetria' | 'utilitarios' | 'inicializacao' | 'outros';
export type ImpactLevel = 'baixo' | 'medio' | 'alto';
export type UninstallMethod = 'powershell' | 'cmd' | 'registry' | 'manual';

export interface Program {
  id: string;
  name: string;
  executable: string;
  category: ProgramCategory;
  impact: ImpactLevel;
  description: string;
  uninstallMethod: UninstallMethod;
  uninstallCommand: string;
  serviceName?: string;
  registryPath?: string;
  isActive: boolean;
}

export interface InstallerProgram {
  id: string;
  name: string;
  category: string;
  installerFileName: string;
  silentArgs: string;
  description: string;
  isActive: boolean;
}

export interface DashboardStats {
  totalPrograms: number;
  selectedPrograms: number;
  estimatedCpuSaved: number; // in percentage
  estimatedRamSaved: number; // in MB
}

