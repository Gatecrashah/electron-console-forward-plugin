import { ConsoleLevel, LogEntry, ConsoleForwardOptions } from './types';

export class ElectronConsoleForwarder {
  private originalConsole: { [K in ConsoleLevel]: any } = {} as any;
  private logBuffer: LogEntry[] = [];
  private options: Required<ConsoleForwardOptions>;
  private batchTimer?: NodeJS.Timeout;

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
      this.patchConsole();
    }
  }

  private patchConsole(): void {
    this.options.levels.forEach((level) => {
      if (typeof console[level] === 'function') {
        this.originalConsole[level] = console[level];
        console[level] = (...args: any[]) => {
          // Call original console method
          this.originalConsole[level].apply(console, args);
          
          // Capture and forward log
          this.captureLog(level, args);
        };
      }
    });
  }

  private captureLog(level: ConsoleLevel, args: any[]): void {
    const logEntry: LogEntry = {
      level,
      message: this.formatMessage(args),
      args: this.serializeArgs(args),
      timestamp: Date.now(),
      source: 'renderer',
      stack: level === 'error' ? new Error().stack : undefined,
    };

    this.logBuffer.push(logEntry);

    if (this.logBuffer.length >= this.options.batchSize) {
      this.flushLogs();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flushLogs(), this.options.batchTimeout);
    }
  }

  private formatMessage(args: any[]): string {
    return args
      .map(arg => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return arg.message;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
      .join(' ');
  }

  private serializeArgs(args: any[]): any[] {
    return args.map(arg => {
      if (arg instanceof Error) {
        return {
          name: arg.name,
          message: arg.message,
          stack: arg.stack,
        };
      }
      if (typeof arg === 'function') {
        return `[Function: ${arg.name || 'anonymous'}]`;
      }
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.parse(JSON.stringify(arg));
        } catch {
          return '[Circular or Non-Serializable]';
        }
      }
      return arg;
    });
  }

  private flushLogs(): void {
    if (this.logBuffer.length === 0) return;

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    // Send via IPC to main process
    if (window.electronAPI?.sendLogs) {
      window.electronAPI.sendLogs(logs);
    } else {
      console.warn('ElectronConsoleForwarder: electronAPI not available');
    }
  }

  public destroy(): void {
    // Restore original console methods
    this.options.levels.forEach((level) => {
      if (this.originalConsole[level]) {
        console[level] = this.originalConsole[level];
      }
    });

    this.flushLogs();
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
  }
}

// Global type declaration for electronAPI
declare global {
  interface Window {
    electronAPI?: {
      sendLogs: (logs: LogEntry[]) => void;
    };
  }
}