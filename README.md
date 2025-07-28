# Electron Console Forward Plugin

Forward frontend console logs from Electron renderer process to your Node.js development server during development. Inspired by [vite-console-forward-plugin](https://github.com/mitsuhiko/vite-console-forward-plugin).

## Features

- 🔍 Captures all console logs from Electron renderer process
- 📡 Forwards logs to your development server via HTTP
- ⚡ Batched log transmission for better performance
- 🎯 Configurable log levels and endpoints
- 🛡️ Secure IPC communication between processes
- 🔧 Easy integration with existing Electron apps

## Installation

Install directly from GitHub repository:

```bash
npm install git+https://github.com/Gatecrashah/electron-console-forward-plugin.git
```

Or if you prefer, you can clone and install locally:

```bash
git clone https://github.com/Gatecrashah/electron-console-forward-plugin.git
cd electron-console-forward-plugin
npm run build
cd your-electron-project
npm install /path/to/electron-console-forward-plugin
```

> **Why not npm?** This is a focused, lightweight plugin that's easier to install directly from the repository. No need for npm registry overhead for such a simple tool!

## Usage

### 1. Main Process Setup

In your Electron main process:

```typescript
import { ElectronConsoleForwardMain } from 'electron-console-forward-plugin';

const consoleForwarder = new ElectronConsoleForwardMain({
  enabled: process.env.NODE_ENV === 'development',
  devServerUrl: 'http://localhost:3000',
  endpoint: '/api/debug/client-logs'
});
```

### 2. Preload Script

You need to include the preload script or copy its contents to your existing preload script:

```typescript
// In your preload script
import './node_modules/electron-console-forward-plugin/dist/preload.js';

// OR copy the contents of preload.ts to your existing preload script
```

### 3. Renderer Process

In your renderer process (React app, etc.):

```typescript
import { ElectronConsoleForwarder } from 'electron-console-forward-plugin';

// Initialize console forwarding
const forwarder = new ElectronConsoleForwarder({
  enabled: process.env.NODE_ENV === 'development',
  levels: ['log', 'warn', 'error', 'info']
});
```

### 4. Development Server

Add an endpoint to your development server to receive logs:

```typescript
// Express.js example
app.post('/api/debug/client-logs', (req, res) => {
  const { logs } = req.body;
  
  logs.forEach((log) => {
    // Simple format: TIME [electron] [level] message  
    const time = new Date(log.timestamp).toLocaleTimeString('en-US', {
      hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit'
    });
    
    console.log(`${time} [electron] [${log.level}] ${log.message}`);
  });
  
  res.status(200).json({ success: true });
});
```

Example output:
```
12:26:31 PM [electron] [log] App initialized successfully
12:26:32 PM [electron] [warn] Deprecated API usage detected
12:26:34 PM [electron] [error] Failed to load user data Error: File not found
```

## Configuration Options

```typescript
interface ConsoleForwardOptions {
  enabled?: boolean;           // Default: true
  endpoint?: string;           // Default: '/api/debug/client-logs'
  levels?: ConsoleLevel[];     // Default: ['log', 'warn', 'error', 'info', 'debug']
  devServerUrl?: string;       // Default: 'http://localhost:3001' (auto-discovered from env vars)
  batchSize?: number;          // Default: 10
  batchTimeout?: number;       // Default: 1000ms
}
```

### Development Server URL Auto-Discovery

The plugin automatically discovers your development server URL from environment variables:

```bash
# Direct URL specification (highest priority)
DEV_SERVER_URL=http://localhost:4000

# Framework-specific variables
VITE_DEV_SERVER_URL=http://localhost:5173
REACT_APP_DEV_SERVER_URL=http://localhost:3000

# Host + port combination
DEV_SERVER_HOST=localhost
DEV_SERVER_PORT=3001

# Port-only discovery
VITE_PORT=5173
PORT=3000
```

If no environment variables are found, defaults to `http://localhost:3001`.

## Security Considerations

- Only enable in development mode
- The plugin uses Electron's contextBridge for secure IPC communication
- Logs are serialized safely to prevent XSS or code injection
- Network requests only go to your configured development server

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch mode for development
npm run dev

# Type checking
npm run typecheck
```

## License

MIT