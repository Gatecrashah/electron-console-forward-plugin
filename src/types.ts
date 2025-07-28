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
  devServerUrl: 'http://localhost:3001',
  batchSize: 10,
  batchTimeout: 1000,
};

// Helper function to merge user options with defaults
export function mergeConsoleForwardOptions(userOptions: ConsoleForwardOptions = {}): Required<ConsoleForwardOptions> {
  // Auto-discover dev server URL from environment variables
  const autoDevServerUrl = getAutoDevServerUrl();
  
  return {
    enabled: userOptions.enabled ?? DEFAULT_CONSOLE_FORWARD_OPTIONS.enabled,
    endpoint: userOptions.endpoint ?? DEFAULT_CONSOLE_FORWARD_OPTIONS.endpoint,
    levels: userOptions.levels ?? DEFAULT_CONSOLE_FORWARD_OPTIONS.levels,
    devServerUrl: userOptions.devServerUrl ?? autoDevServerUrl ?? DEFAULT_CONSOLE_FORWARD_OPTIONS.devServerUrl,
    batchSize: userOptions.batchSize ?? DEFAULT_CONSOLE_FORWARD_OPTIONS.batchSize,
    batchTimeout: userOptions.batchTimeout ?? DEFAULT_CONSOLE_FORWARD_OPTIONS.batchTimeout,
  };
}

// Auto-discover development server URL from common environment variables
function getAutoDevServerUrl(): string | undefined {
  // Check for common dev server environment variables
  const envVars = [
    'DEV_SERVER_URL',           // Direct URL specification
    'VITE_DEV_SERVER_URL',      // Vite-specific
    'REACT_APP_DEV_SERVER_URL', // Create React App
    'DEV_SERVER_HOST',          // Host-based discovery
  ];
  
  for (const envVar of envVars) {
    const value = process.env[envVar];
    if (value) {
      // If it's a host variable, construct the URL
      if (envVar === 'DEV_SERVER_HOST') {
        const port = process.env.DEV_SERVER_PORT || '3001';
        return `http://${value}:${port}`;
      }
      return value;
    }
  }
  
  // Check for Vite dev server (common ports)
  const vitePort = process.env.VITE_PORT || process.env.PORT;
  if (vitePort && !isNaN(Number(vitePort))) {
    return `http://localhost:${vitePort}`;
  }
  
  return undefined;
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