import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { CleanerData } from "./types";

const DATA_DIR = join(homedir(), ".raycast-cleaner-tracker");
const DATA_FILE = join(DATA_DIR, "cleaner-data.json");

// Ensure data directory exists
function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Get default empty data structure
function getDefaultData(): CleanerData {
  return {
    workEntries: [],
    payments: [],
    currentRemainder: 0,
  };
}

// Load data from file
export function loadData(): CleanerData {
  ensureDataDir();

  if (!existsSync(DATA_FILE)) {
    const defaultData = getDefaultData();
    saveData(defaultData);
    return defaultData;
  }

  try {
    const fileContent = readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(fileContent) as CleanerData;
  } catch (error) {
    console.error("Error loading data:", error);
    return getDefaultData();
  }
}

// Save data to file
export function saveData(data: CleanerData): void {
  ensureDataDir();

  try {
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving data:", error);
    throw new Error("Failed to save data");
  }
}

// Get the data file path for export/backup
export function getDataFilePath(): string {
  return DATA_FILE;
}