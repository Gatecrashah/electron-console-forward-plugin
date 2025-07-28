export { ElectronConsoleForwarder } from './renderer';
export { ElectronConsoleForwardMain } from './main';
export * from './types';

// Convenience function for quick setup
export function setupConsoleForwarding(options?: import('./types').ConsoleForwardOptions) {
  // This should be called in the renderer process
  if (typeof window !== 'undefined') {
    return new (require('./renderer').ElectronConsoleForwarder)(options);
  }
  
  throw new Error('setupConsoleForwarding should only be called in the renderer process');
}