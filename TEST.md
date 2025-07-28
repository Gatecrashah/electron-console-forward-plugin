# Testing the Electron Console Forward Plugin

## Quick Start

### 1. Build the Plugin
```bash
npm run build
```

### 2. Run the Test (All-in-One)
```bash
npm test
```
This will automatically:
- Install example dependencies
- Build the example app
- Start the development server
- Launch the Electron app

### 3. Manual Testing Steps

If you prefer to run components separately:

#### Terminal 1 - Development Server
```bash
npm run test:server
```
You should see:
```
🚀 Development server running at http://localhost:3001
📡 Ready to receive console logs from Electron app
🔗 Log endpoint: http://localhost:3001/api/debug/client-logs
```

#### Terminal 2 - Electron App
```bash
npm run test:electron
```

## What You Should See

### 1. Electron App Window
- A test page with various buttons for testing console forwarding
- DevTools should open automatically
- Click "🚀 Run Full Auto Test" for comprehensive testing

### 2. Development Server Terminal
You should see formatted console logs like:
```
🔍 Received logs from Electron renderer:
📅 Timestamp: 2024-01-15T10:30:45.123Z
📍 Source: electron-renderer
──────────────────────────────────────────────────
📝 [LOG] 🏁 Page loaded - Console forwarding should be active!
ℹ️ [INFO] 👀 Check your development server terminal to see this message
──────────────────────────────────────────────────
```

### 3. Electron DevTools Console
All logs will still appear in the Electron DevTools console as normal, plus be forwarded to your development server.

## Test Scenarios

The test page includes these scenarios:

### Basic Console Tests
- `console.log()`, `console.info()`, `console.warn()`
- Error logging with stack traces
- Object and array logging

### Batch Testing
- 10 logs at once (tests batching)
- 50 rapid logs (tests performance)

### Level Testing
- All console levels: log, info, warn, error, debug
- Complex object serialization
- Function and date object handling

## Troubleshooting

### Plugin Not Working?
1. Check that the development server is running on port 3001
2. Verify the plugin initialized (check the green status message)
3. Look for any errors in Electron DevTools console

### No Logs in Terminal?
1. Ensure `electronAPI` is available (preload script loaded correctly)
2. Check network tab in DevTools for failed POST requests
3. Verify the development server endpoint is responding

### Build Issues?
```bash
# Clean build
rm -rf dist example/dist
npm run build
cd example && npm run build
```

## Integration with Your App

Once tested, integrate into your Electron app:

1. **Install the plugin:**
   ```bash
   npm install git+https://github.com/Gatecrashah/electron-console-forward-plugin.git
   ```

2. **Main process:**
   ```typescript
   import { ElectronConsoleForwardMain } from 'electron-console-forward-plugin';
   
   const consoleForwarder = new ElectronConsoleForwardMain({
     enabled: process.env.NODE_ENV === 'development',
     devServerUrl: 'http://localhost:3000'
   });
   ```

3. **Preload script:**
   ```typescript
   import 'electron-console-forward-plugin/dist/preload';
   ```

4. **Renderer process:**
   ```typescript
   import { ElectronConsoleForwarder } from 'electron-console-forward-plugin';
   
   new ElectronConsoleForwarder({
     enabled: process.env.NODE_ENV === 'development'
   });
   ```

5. **Development server:**
   ```typescript
   app.post('/api/debug/client-logs', (req, res) => {
     const { logs } = req.body;
     logs.forEach(log => console.log(`[RENDERER] ${log.message}`));
     res.status(200).json({ success: true });
   });
   ```