export interface ConsoleForwardOptions {
  enabled?: boolean;
  endpoint?: string;
  levels?: ConsoleLevel[];
  devServerUrl?: string;
  batchSize?: number;
  batchTimeout?: number;
}

export type ConsoleLevel = 'log' | 'warn' | 'error' | 'info' | 'debug' | 'trace';

// Default configuration values
export const DEFAULT_CONSOLE_FORWARD_OPTIONS: Required<ConsoleForwardOptions> = {
  enabled: true,
  endpoint: '/api/debug/client-logs',
  levels: ['log', 'warn', 'error', 'info', 'debug'],
  devServerUrl: 'http://localhost:3000',
  batchSize: 10,
  batchTimeout: 1000,
};

// Helper function to merge user options with defaults
export function mergeConsoleForwardOptions(userOptions: ConsoleForwardOptions = {}): Required<ConsoleForwardOptions> {
  return {
    enabled: userOptions.enabled ?? DEFAULT_CONSOLE_FORWARD_OPTIONS.enabled,
    endpoint: userOptions.endpoint ?? DEFAULT_CONSOLE_FORWARD_OPTIONS.endpoint,
    levels: userOptions.levels ?? DEFAULT_CONSOLE_FORWARD_OPTIONS.levels,
    devServerUrl: userOptions.devServerUrl ?? DEFAULT_CONSOLE_FORWARD_OPTIONS.devServerUrl,
    batchSize: userOptions.batchSize ?? DEFAULT_CONSOLE_FORWARD_OPTIONS.batchSize,
    batchTimeout: userOptions.batchTimeout ?? DEFAULT_CONSOLE_FORWARD_OPTIONS.batchTimeout,
  };
}

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