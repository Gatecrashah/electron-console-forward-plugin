import { ipcMain } from 'electron';
import { LogEntry, ConsoleForwardOptions } from './types';

export class ElectronConsoleForwardMain {
  private options: Required<ConsoleForwardOptions>;

  constructor(options: ConsoleForwardOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      endpoint: options.endpoint ?? '/api/debug/client-logs',
      levels: options.levels ?? ['log', 'warn', 'error', 'info', 'debug'],
      devServerUrl: options.devServerUrl ?? 'http://localhost:3000',
      batchSize: options.batchSize ?? 10,
      batchTimeout: options.batchTimeout ?? 1000,
    };

    if (this.options.enabled) {
      this.setupIpcHandlers();
    }
  }

  private setupIpcHandlers(): void {
    ipcMain.on('console-forward:logs', (event, logs: LogEntry[]) => {
      this.forwardLogsToDevServer(logs);
    });
  }

  private async forwardLogsToDevServer(logs: LogEntry[]): Promise<void> {
    if (!this.options.enabled || logs.length === 0) {
      return;
    }

    const url = `${this.options.devServerUrl}${this.options.endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs,
          timestamp: Date.now(),
          source: 'electron-renderer'
        }),
      });

      if (!response.ok) {
        console.warn(`ElectronConsoleForward: Failed to send logs (${response.status})`);
      }
    } catch (error) {
      // Silently fail - dev server might not be running
      // Could optionally log to main process console if needed
    }
  }

  public destroy(): void {
    ipcMain.removeAllListeners('console-forward:logs');
  }
}