import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, "../data/db.json");
const CONFIG_PATH = path.resolve(__dirname, "../config.json");

// Naive in-process write lock (good enough for a coding assignment)
let writeLock = Promise.resolve();

export async function readDb() {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

export async function writeDb(db) {
  writeLock = writeLock.then(async () => {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  });
  return writeLock;
}

export async function loadConfig() {
  const raw = await fs.readFile(CONFIG_PATH, "utf-8");
  return JSON.parse(raw);
}

/**
 * Balance derived from SUCCESS transactions only and not deleted.
 * credit: +amount
 * debit: -(amount + fee)
 */
export function computeBalance(transactions) {
  return transactions
    .filter(t => !t.deleted && t.status === "success")
    .reduce((sum, t) => {
      if (t.type === "credit") return sum + t.amount;
      if (t.type === "debit") return sum - (t.amount + (t.fee || 0));
      return sum;
    }, 0);
}
