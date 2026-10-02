import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFilePath(collection: string): string {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection<T>(collection: string): T[] {
  ensureDataDir();
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf-8');
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T[];
}

function writeCollection<T>(collection: string, data: T[]): void {
  ensureDataDir();
  const filePath = getFilePath(collection);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export class JsonDatabase<T extends { id: string }> {
  private collection: string;

  constructor(collection: string) {
    this.collection = collection;
  }

  findAll(): T[] {
    return readCollection<T>(this.collection);
  }

  findById(id: string): T | null {
    const items = readCollection<T>(this.collection);
    return items.find((item) => item.id === id) || null;
  }

  findBy(key: keyof T, value: unknown): T | null {
    const items = readCollection<T>(this.collection);
    return items.find((item) => item[key] === value) || null;
  }

  create(data: Omit<T, 'id' | 'createdAt'>): T {
    const items = readCollection<T>(this.collection);
    const newItem = {
      id: randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
    } as unknown as T;
    items.push(newItem);
    writeCollection(this.collection, items);
    return newItem;
  }

  delete(id: string): boolean {
    const items = readCollection<T>(this.collection);
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    writeCollection(this.collection, filtered);
    return true;
  }
}
