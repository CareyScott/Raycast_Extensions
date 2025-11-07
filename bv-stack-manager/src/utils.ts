import { exec, spawn } from "child_process";
import { promisify } from "util";
import { BVService, ServiceStatus } from "./types";
import { XDEBUG_ENV } from "./config";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

const PID_DIR = path.join(os.homedir(), ".raycast-bv-stack");

// Ensure PID directory exists
if (!fs.existsSync(PID_DIR)) {
  fs.mkdirSync(PID_DIR, { recursive: true });
}

// Cache for executable paths
let phpPath: string | null = null;
let npmPath: string | null = null;

/**
 * Find PHP executable path
 */
async function findPhpPath(): Promise<string> {
  if (phpPath) return phpPath;

  try {
    const { stdout } = await execAsync("which php");
    phpPath = stdout.trim();
    return phpPath;
  } catch {
    // Try common paths
    const commonPaths = [
      "/opt/homebrew/bin/php",
      "/usr/local/bin/php",
      "/usr/bin/php",
    ];

    for (const testPath of commonPaths) {
      if (fs.existsSync(testPath)) {
        phpPath = testPath;
        return phpPath;
      }
    }

    throw new Error(
      "PHP not found. Please ensure PHP is installed and in your PATH.",
    );
  }
}

/**
 * Find npm executable path
 */
async function findNpmPath(): Promise<string> {
  if (npmPath) return npmPath;

  try {
    const { stdout } = await execAsync("which npm");
    npmPath = stdout.trim();
    return npmPath;
  } catch {
    // Try common paths
    const commonPaths = [
      "/opt/homebrew/bin/npm",
      "/usr/local/bin/npm",
      "/usr/bin/npm",
    ];

    for (const testPath of commonPaths) {
      if (fs.existsSync(testPath)) {
        npmPath = testPath;
        return npmPath;
      }
    }

    throw new Error(
      "npm not found. Please ensure npm is installed and in your PATH.",
    );
  }
}

/**
 * Get the path to store PIDs for a service
 */
function getPidFilePath(serviceName: string): string {
  return path.join(PID_DIR, `${serviceName}.json`);
}

/**
 * Save PIDs for a service
 */
function savePids(
  serviceName: string,
  phpPid: number,
  tailPid?: number,
  npmPid?: number,
): void {
  const pidFile = getPidFilePath(serviceName);
  fs.writeFileSync(pidFile, JSON.stringify({ phpPid, tailPid, npmPid }));
}

/**
 * Load PIDs for a service
 */
function loadPids(
  serviceName: string,
): { phpPid?: number; tailPid?: number; npmPid?: number } | null {
  const pidFile = getPidFilePath(serviceName);
  if (!fs.existsSync(pidFile)) {
    return null;
  }
  try {
    const content = fs.readFileSync(pidFile, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Delete PID file for a service
 */
function deletePidFile(serviceName: string): void {
  const pidFile = getPidFilePath(serviceName);
  if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile);
  }
}

/**
 * Check if a process is running by PID
 */
async function isProcessRunning(pid: number): Promise<boolean> {
  try {
    // Sending signal 0 doesn't kill the process, just checks if it exists
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a port is in use
 */
export async function isPortInUse(port: number): Promise<boolean> {
  try {
    // Use full path to lsof and add common paths to PATH
    const { stdout } = await execAsync(`/usr/sbin/lsof -i :${port} -sTCP:LISTEN -t`, {
      env: {
        ...process.env,
        PATH: process.env.PATH + ":/usr/sbin:/sbin",
      },
    });
    return stdout.trim().length > 0;
  } catch (error) {
    // Try fallback with netstat
    try {
      const { stdout } = await execAsync(`netstat -an | grep -E "\\.${port}.*LISTEN"`, {
        env: {
          ...process.env,
          PATH: process.env.PATH + ":/usr/sbin:/sbin",
        },
      });
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  }
}

/**
 * Get PID of process using a port
 */
async function getPidOnPort(port: number): Promise<number | null> {
  try {
    const { stdout } = await execAsync(`/usr/sbin/lsof -i :${port} -sTCP:LISTEN -t`, {
      env: {
        ...process.env,
        PATH: process.env.PATH + ":/usr/sbin:/sbin",
      },
    });
    const pids = stdout.trim().split("\n");
    // Return first PID (usually the parent process)
    const pid = parseInt(pids[0]);
    return isNaN(pid) ? null : pid;
  } catch {
    return null;
  }
}

/**
 * Kill a process by PID (immediately with SIGKILL)
 */
async function killProcess(pid: number, forceful = true): Promise<void> {
  try {
    if (forceful) {
      // Use SIGKILL directly for immediate termination
      process.kill(pid, "SIGKILL");
    } else {
      // Try graceful shutdown first
      process.kill(pid, "SIGTERM");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Force kill if still running
      if (await isProcessRunning(pid)) {
        process.kill(pid, "SIGKILL");
      }
    }
  } catch (error) {
    // Process might already be dead, ignore errors
  }
}

/**
 * Get all PIDs listening on a port
 */
async function getAllPidsOnPort(port: number): Promise<number[]> {
  try {
    const { stdout } = await execAsync(`/usr/sbin/lsof -i :${port} -sTCP:LISTEN -t`, {
      env: {
        ...process.env,
        PATH: process.env.PATH + ":/usr/sbin:/sbin",
      },
    });
    const pids = stdout
      .trim()
      .split("\n")
      .map((pid) => parseInt(pid))
      .filter((pid) => !isNaN(pid));
    return pids;
  } catch {
    return [];
  }
}

/**
 * Get status of a service
 */
export async function getServiceStatus(
  service: BVService,
): Promise<ServiceStatus> {
  const running = await isPortInUse(service.port);
  const pid = running ? await getPidOnPort(service.port) : undefined;

  return {
    name: service.name,
    running,
    pid: pid || undefined,
    port: service.port,
  };
}

/**
 * Get status of all services
 */
export async function getAllServiceStatuses(
  services: BVService[],
): Promise<ServiceStatus[]> {
  return Promise.all(services.map((service) => getServiceStatus(service)));
}

/**
 * Start a service
 */
export async function startService(service: BVService): Promise<void> {
  // Check if already running
  if (await isPortInUse(service.port)) {
    throw new Error(
      `Service ${service.displayName} is already running on port ${service.port}`,
    );
  }

  // Check if directory exists
  if (!fs.existsSync(service.path)) {
    throw new Error(`Directory not found: ${service.path}`);
  }

  // Get executable paths
  const php = await findPhpPath();
  const npm = service.hasNpm ? await findNpmPath() : null;

  // Start tail process for logs
  const tailProcess = spawn("tail", ["-f", "storage/logs/laravel.log"], {
    cwd: service.path,
    detached: true,
    stdio: "ignore",
  });
  tailProcess.unref();

  // Build PHP command
  const phpArgs = [
    "-S",
    `0.0.0.0:${service.port}`,
    "-t",
    "./public",
    "-dxdebug.mode=debug",
    "-dxdebug.start_with_request=trigger",
    "-dxdebug.client_port=9003",
    "-dxdebug.client_host=0.0.0.0",
  ];

  // Start PHP server
  const phpProcess = spawn(php, phpArgs, {
    cwd: service.path,
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
      ...XDEBUG_ENV,
      PHP_CLI_SERVER_WORKERS: "3",
      PATH: process.env.PATH + ":/opt/homebrew/bin:/usr/local/bin",
    },
  });
  phpProcess.unref();

  let npmPid: number | undefined;

  // Start npm dev if needed
  if (service.hasNpm && npm) {
    const npmProcess = spawn(npm, ["run", "dev"], {
      cwd: service.path,
      detached: true,
      stdio: "ignore",
      shell: true,
      env: {
        ...process.env,
        PATH: process.env.PATH + ":/opt/homebrew/bin:/usr/local/bin",
      },
    });
    npmProcess.unref();
    npmPid = npmProcess.pid;
  }

  // Save PIDs
  savePids(service.name, phpProcess.pid!, tailProcess.pid, npmPid);

  // Wait for the service to start with retries
  const maxRetries = 10;
  const retryDelay = 500;
  let started = false;

  for (let i = 0; i < maxRetries; i++) {
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
    if (await isPortInUse(service.port)) {
      started = true;
      break;
    }
  }

  // Verify it started
  if (!started) {
    throw new Error(
      `Failed to start ${service.displayName} - port ${service.port} is not listening after ${maxRetries * retryDelay}ms`,
    );
  }
}

/**
 * Stop a service
 */
export async function stopService(service: BVService): Promise<void> {
  // Get all PIDs using the port
  const portPids = await getAllPidsOnPort(service.port);

  // Kill all processes on the port immediately with SIGKILL
  for (const pid of portPids) {
    await killProcess(pid, true);
  }

  // Also kill stored PIDs if available
  const pids = loadPids(service.name);
  if (pids) {
    if (pids.phpPid && (await isProcessRunning(pids.phpPid))) {
      await killProcess(pids.phpPid, true);
    }
    if (pids.tailPid && (await isProcessRunning(pids.tailPid))) {
      await killProcess(pids.tailPid, true);
    }
    if (pids.npmPid && (await isProcessRunning(pids.npmPid))) {
      await killProcess(pids.npmPid, true);
    }
  }

  // Clean up PID file
  deletePidFile(service.name);

  // Wait a moment for cleanup and verify
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Double-check: if port is still in use, try one more time with killall
  if (await isPortInUse(service.port)) {
    const remainingPids = await getAllPidsOnPort(service.port);
    for (const pid of remainingPids) {
      try {
        // Force kill with system call as last resort
        await execAsync(`kill -9 ${pid}`, {
          env: {
            ...process.env,
            PATH: process.env.PATH + ":/usr/sbin:/sbin:/bin:/usr/bin",
          },
        });
      } catch {
        // Ignore errors
      }
    }
  }
}

/**
 * Restart a service
 */
export async function restartService(service: BVService): Promise<void> {
  await stopService(service);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await startService(service);
}

/**
 * Start all services
 */
export async function startAllServices(services: BVService[]): Promise<void> {
  for (const service of services) {
    try {
      await startService(service);
    } catch (error) {
      console.error(`Failed to start ${service.displayName}:`, error);
      throw error;
    }
  }
}

/**
 * Stop all services
 */
export async function stopAllServices(services: BVService[]): Promise<void> {
  await Promise.all(services.map((service) => stopService(service)));
}
