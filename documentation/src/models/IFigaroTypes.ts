export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ITask {
  id: number;
  title: string;
  description: string;
  script: string;
  color?: string;
  autoRunOnConnect: boolean;
  autoRunPriority: number;
  autoLock: boolean;
  runLocked: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ITaskDraft {
  title: string;
  description: string;
  script: string;
  color?: string;
  autoRunOnConnect: boolean;
  autoRunPriority: number;
  autoLock: boolean;
  runLocked: boolean;
}

export interface ICommandLogEntry {
  at: number;
  input: string;
  level?: LogLevel;
  output?: string;
  error?: string;
}

export interface IExecutionRecord {
  id: string;
  taskId: number;
  startedAt: number;
  endedAt: number;
  level: LogLevel;
  success: boolean;
  failedCommand?: string;
  entries: ICommandLogEntry[];
}

export interface IAppSettings {
  nextTaskId: number;
  preferredPort?: string;
  logLevel?: LogLevel;
}

export interface IPersistedState {
  tasks: ITask[];
  logs: IExecutionRecord[];
  settings: IAppSettings;
}

export interface ISerialOptions {
  baudRate: 9600;
  dataBits: 8;
  stopBits: 1;
  parity: 'none';
  flowControl: 'none';
}
