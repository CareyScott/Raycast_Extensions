# BV Stack Manager

A Raycast extension to manage BV stack services (Laravel PHP servers with XDebug).

## Features

- **Service Management**: Start, stop, and restart individual services
- **Bulk Operations**: Start or stop all services at once
- **Status Monitoring**: Real-time status of all services with port information
- **Background Execution**: Services run in the background independently of Raycast
- **XDebug Support**: All services run with XDebug enabled for debugging

## Services

The extension manages the following BV services:

- **Admin** (port 3001) - `/Users/scottcarey/Developer/bv-admin`
- **Users** (port 3002) - `/Users/scottcarey/Developer/bv-users` (with npm dev)
- **CMS** (port 3004) - `/Users/scottcarey/Developer/bv-cms`
- **Education** (port 3005) - `/Users/scottcarey/Developer/bv-education`
- **Assistant** (port 3007) - `/Users/scottcarey/Developer/bv-assistant`
- **Investment** (port 3008) - `/Users/scottcarey/Developer/bv-investment`
- **Subscription** (port 3009) - `/Users/scottcarey/Developer/bv-subscription`

## Commands

### Manage BV Services
The main interface showing all services with their status. You can:
- View running/stopped status
- Start/stop/restart individual services
- Open services in browser
- Show service directory in Finder

### Start All BV Services
Quick command to start all services at once (HUD notification).

### Stop All BV Services
Quick command to stop all services at once (HUD notification).

### BV Stack Status
Quick status check showing which services are running (HUD notification).

## Installation

1. Install dependencies:
```bash
npm install
```

2. Add an icon:
   - Place a PNG icon file at `assets/command-icon.png` (512x512px recommended)

3. Run in development mode:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## How It Works

### Background Processes

Services are spawned as detached processes that continue running after Raycast closes. Each service runs:

1. **PHP Server**: Built-in PHP server with 3 workers
2. **Log Tail**: Tails Laravel logs for monitoring
3. **NPM Dev** (Users service only): Frontend development server

### Process Management

PIDs are stored in `~/.raycast-bv-stack/` for reliable process management. The extension:

- Tracks PHP, tail, and npm processes separately
- Can stop services by stored PIDs or by port lookup
- Verifies services started successfully by checking port listeners

### XDebug Configuration

All services run with:
- `XDEBUG_SESSION=1`
- `XDEBUG_CONFIG='log_level=0'`
- XDebug mode: debug
- Start with request: trigger
- Client port: 9003
- Client host: 0.0.0.0

## Customization

To modify services, edit `src/config.ts`:

```typescript
export const BV_SERVICES: BVService[] = [
  {
    name: "admin",
    displayName: "Admin",
    port: 3001,
    path: "/Users/scottcarey/Developer/bv-admin",
  },
  // Add more services...
];
```

## Development

- `npm run dev` - Development mode with hot reload
- `npm run build` - Build the extension
- `npm run lint` - Lint the code
- `npm run fix-lint` - Auto-fix linting issues

## Requirements

- Node.js 20+
- PHP (with XDebug extension)
- npm
- Raycast

## License

MIT
