import { DeerStalkingRecord } from '../types';

class StalkToForkDatabase {
  private storageKey = 'stalk-to-fork-records';
  private nextIdKey = 'stalk-to-fork-next-id';

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Initialize localStorage if not exists
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.nextIdKey)) {
      localStorage.setItem(this.nextIdKey, '1');
    }
  }

  private getNextId(): number {
    const currentId = parseInt(localStorage.getItem(this.nextIdKey) || '1');
    localStorage.setItem(this.nextIdKey, (currentId + 1).toString());
    return currentId;
  }

  private getRecords(): DeerStalkingRecord[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error parsing records from localStorage:', error);
      return [];
    }
  }

  private saveRecords(records: DeerStalkingRecord[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving records to localStorage:', error);
    }
  }

  // Insert a new record
  insertRecord(record: Omit<DeerStalkingRecord, 'id' | 'createdAt' | 'updatedAt'>): number {
    const records = this.getRecords();
    const id = this.getNextId();
    const now = new Date().toISOString();

    const newRecord: DeerStalkingRecord = {
      ...record,
      id,
      createdAt: now,
      updatedAt: now,
    };

    records.push(newRecord);
    this.saveRecords(records);

    return id;
  }

  // Get all records
  getAllRecords(): DeerStalkingRecord[] {
    const records = this.getRecords();
    return records.sort((a, b) => {
      // Sort by date descending, then by createdAt descending
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;

      const aCreated = new Date(a.createdAt || 0).getTime();
      const bCreated = new Date(b.createdAt || 0).getTime();
      return bCreated - aCreated;
    });
  }

  // Get record by ID
  getRecordById(id: number): DeerStalkingRecord | null {
    const records = this.getRecords();
    return records.find(record => record.id === id) || null;
  }

  // Update a record
  updateRecord(id: number, updates: Partial<Omit<DeerStalkingRecord, 'id' | 'createdAt' | 'updatedAt'>>): boolean {
    const records = this.getRecords();
    const index = records.findIndex(record => record.id === id);

    if (index === -1) return false;

    records[index] = {
      ...records[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveRecords(records);
    return true;
  }

  // Delete a record
  deleteRecord(id: number): boolean {
    const records = this.getRecords();
    const initialLength = records.length;
    const filteredRecords = records.filter(record => record.id !== id);

    if (filteredRecords.length === initialLength) return false;

    this.saveRecords(filteredRecords);
    return true;
  }

  // Search records
  searchRecords(query: string): DeerStalkingRecord[] {
    const records = this.getRecords();
    const searchTerm = query.toLowerCase();

    return records.filter(record =>
      record.species.toLowerCase().includes(searchTerm) ||
      record.location.toLowerCase().includes(searchTerm) ||
      record.shooter.toLowerCase().includes(searchTerm) ||
      (record.remarks && record.remarks.toLowerCase().includes(searchTerm))
    ).sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;

      const aCreated = new Date(a.createdAt || 0).getTime();
      const bCreated = new Date(b.createdAt || 0).getTime();
      return bCreated - aCreated;
    });
  }

  // Get records by date range
  getRecordsByDateRange(startDate: string, endDate: string): DeerStalkingRecord[] {
    const records = this.getRecords();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= start && recordDate <= end;
    }).sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;

      const aCreated = new Date(a.createdAt || 0).getTime();
      const bCreated = new Date(b.createdAt || 0).getTime();
      return bCreated - aCreated;
    });
  }

  // Clear all records (for testing)
  clearAllRecords(): void {
    localStorage.setItem(this.storageKey, JSON.stringify([]));
    localStorage.setItem(this.nextIdKey, '1');
  }

  // Close database connection (no-op for localStorage)
  close() {
    // No-op for localStorage implementation
  }
}

// Singleton instance
let dbInstance: StalkToForkDatabase | null = null;

export const getDatabase = (): StalkToForkDatabase => {
  if (!dbInstance) {
    dbInstance = new StalkToForkDatabase();
  }
  return dbInstance;
};

export default StalkToForkDatabase;
