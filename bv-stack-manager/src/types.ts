export interface BVService {
  name: string;
  displayName: string;
  port: number;
  path: string;
  hasNpm?: boolean; // Whether this service also runs npm dev
}

export interface ServiceStatus {
  name: string;
  running: boolean;
  pid?: number;
  port: number;
}

export interface ServiceProcess {
  name: string;
  phpPid?: number;
  npmPid?: number;
  tailPid?: number;
}