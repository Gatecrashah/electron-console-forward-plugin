import { contextBridge, ipcRenderer } from 'electron';
import { LogEntry } from './types';

// Expose safe API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  sendLogs: (logs: LogEntry[]) => {
    ipcRenderer.send('console-forward:logs', logs);
  }
});

export {};