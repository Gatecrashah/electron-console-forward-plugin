export interface ConsoleForwardOptions {
  enabled?: boolean;
  endpoint?: string;
  levels?: ConsoleLevel[];
  devServerUrl?: string;
  batchSize?: number;
  batchTimeout?: number;
}

export type ConsoleLevel = 'log' | 'warn' | 'error' | 'info' | 'debug' | 'trace';

export interface LogEntry {
  level: ConsoleLevel;
  message: string;
  args: any[];
  timestamp: number;
  source?: string;
  stack?: string;
}

export interface LogBatch {
  logs: LogEntry[];
  timestamp: number;
}