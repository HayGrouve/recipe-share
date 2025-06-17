import { db } from './db';
import {
  users,
  recipes,
  ingredients,
  recipeIngredients,
  instructions,
  recipeImages,
  categories,
  recipeCategories,
  tags,
  recipeTags,
  nutrition,
  ratings,
  comments,
  savedRecipes,
  collections,
  collectionRecipes,
  follows,
} from './db';

export interface BackupData {
  timestamp: string;
  version: string;
  tables: Record<string, unknown[]>;
  metadata: {
    totalRecords: number;
    backupSize: string;
    environment: string;
  };
}

export const createDatabaseBackup = async (): Promise<BackupData> => {
  console.log('Starting database backup...');
  const startTime = Date.now();

  try {
    // Function to safely backup a table
    async function safeBackupTable(
      tableName: string,
      table: any
    ): Promise<unknown[]> {
      try {
        const data = await db.select().from(table);
        console.log(`✓ Backed up ${data.length} records from ${tableName}`);
        return data;
      } catch (error: unknown) {
        if (error.code === '42P01') {
          console.log(`⚠ Table ${tableName} doesn't exist, skipping...`);
          return [];
        }
        console.error(`✗ Failed to backup ${tableName}:`, error.message);
        throw error;
      }
    }

    // Backup all tables
    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      tables: {
        users: await safeBackupTable('users', users),
        recipes: await safeBackupTable('recipes', recipes),
        ingredients: await safeBackupTable('ingredients', ingredients),
        recipeIngredients: await safeBackupTable(
          'recipeIngredients',
          recipeIngredients
        ),
        instructions: await safeBackupTable('instructions', instructions),
        recipeImages: await safeBackupTable('recipeImages', recipeImages),
        categories: await safeBackupTable('categories', categories),
        recipeCategories: await safeBackupTable(
          'recipeCategories',
          recipeCategories
        ),
        tags: await safeBackupTable('tags', tags),
        recipeTags: await safeBackupTable('recipeTags', recipeTags),
        nutrition: await safeBackupTable('nutrition', nutrition),
        ratings: await safeBackupTable('ratings', ratings),
        comments: await safeBackupTable('comments', comments),
        savedRecipes: await safeBackupTable('savedRecipes', savedRecipes),
        collections: await safeBackupTable('collections', collections),
        collectionRecipes: await safeBackupTable(
          'collectionRecipes',
          collectionRecipes
        ),
        follows: await safeBackupTable('follows', follows),
      },
      metadata: {
        totalRecords: 0,
        backupSize: '0KB',
        environment: process.env.NODE_ENV || 'unknown',
      },
    };

    // Calculate metadata
    const totalRecords = Object.values(backupData.tables).reduce(
      (sum, table) => sum + table.length,
      0
    );

    const backupJson = JSON.stringify(backupData, null, 2);
    const backupSize = `${Math.round(backupJson.length / 1024)}KB`;

    backupData.metadata = {
      totalRecords,
      backupSize,
      environment: process.env.NODE_ENV || 'unknown',
    };

    const duration = Date.now() - startTime;
    console.log(`✓ Backup completed in ${duration}ms`);
    console.log(`📊 Total records: ${totalRecords}`);
    console.log(`💾 Backup size: ${backupSize}`);

    return backupData;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw new Error(
      `Database backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const saveDatabaseBackup = async (
  backupData: BackupData,
  filePath?: string
): Promise<string> => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    // Generate backup file path if not provided
    if (!filePath) {
      const timestamp = backupData.timestamp.replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups');
      filePath = path.join(backupDir, `recipe-backup-${timestamp}.json`);

      // Create backups directory if it doesn't exist
      await fs.mkdir(backupDir, { recursive: true });
    }

    // Save backup to file
    const backupJson = JSON.stringify(backupData, null, 2);
    await fs.writeFile(filePath, backupJson, 'utf-8');

    console.log(`✓ Backup saved to: ${filePath}`);
    return filePath;
  } catch (error) {
    throw new Error(
      `Failed to save backup: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const verifyDatabaseBackup = async (
  filePath: string
): Promise<{
  isValid: boolean;
  errors: string[];
  stats: {
    totalTables: number;
    totalRecords: number;
    backupAge: string;
    fileSize: string;
  };
}> => {
  const errors: string[] = [];

  try {
    const fs = await import('fs/promises');

    // Check if file exists
    const stats = await fs.stat(filePath);
    const backupContent = await fs.readFile(filePath, 'utf-8');
    const backup = JSON.parse(backupContent) as BackupData;

    // Verify backup structure
    const requiredFields = ['timestamp', 'version', 'tables', 'metadata'];
    for (const field of requiredFields) {
      if (!(field in backup)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Verify essential tables exist
    const essentialTables = ['recipes', 'users'];
    for (const table of essentialTables) {
      if (!backup.tables[table]) {
        errors.push(`Missing essential table: ${table}`);
      }
    }

    // Check if backup has data
    const totalRecords = Object.values(backup.tables).reduce(
      (sum, table) => sum + table.length,
      0
    );

    if (totalRecords === 0) {
      errors.push('Backup contains no data');
    }

    // Check backup age
    const backupDate = new Date(backup.timestamp);
    const ageInDays = Math.floor(
      (Date.now() - backupDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (ageInDays > 30) {
      errors.push(
        `Backup is ${ageInDays} days old - consider creating a fresh backup`
      );
    }

    const fileSize = `${Math.round(stats.size / 1024)}KB`;

    return {
      isValid: errors.length === 0,
      errors,
      stats: {
        totalTables: Object.keys(backup.tables).length,
        totalRecords,
        backupAge: `${ageInDays} days`,
        fileSize,
      },
    };
  } catch (error) {
    errors.push(
      `Failed to verify backup: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return {
      isValid: false,
      errors,
      stats: {
        totalTables: 0,
        totalRecords: 0,
        backupAge: 'unknown',
        fileSize: 'unknown',
      },
    };
  }
};

export const listBackups = async (
  backupDir?: string
): Promise<
  Array<{
    fileName: string;
    filePath: string;
    timestamp: string;
    size: string;
    age: string;
  }>
> => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const dir = backupDir || path.join(process.cwd(), 'backups');

    try {
      await fs.access(dir);
    } catch {
      // Directory doesn't exist
      return [];
    }

    const files = await fs.readdir(dir);
    const backupFiles = files.filter(
      (file) => file.startsWith('recipe-backup-') && file.endsWith('.json')
    );

    const backups = await Promise.all(
      backupFiles.map(async (fileName) => {
        const filePath = path.join(dir, fileName);
        const stats = await fs.stat(filePath);

        // Extract timestamp from filename
        const timestampMatch = fileName.match(/recipe-backup-(.+)\.json$/);
        const timestamp = timestampMatch
          ? timestampMatch[1].replace(/-/g, ':')
          : 'unknown';

        const ageInDays = Math.floor(
          (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          fileName,
          filePath,
          timestamp,
          size: `${Math.round(stats.size / 1024)}KB`,
          age: `${ageInDays} days`,
        };
      })
    );

    // Sort by creation time (newest first)
    return backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch (error) {
    console.error('Failed to list backups:', error);
    return [];
  }
};

export const cleanupOldBackups = async (
  retentionDays: number = 30,
  maxBackups: number = 10,
  backupDir?: string
): Promise<{
  deletedCount: number;
  retainedCount: number;
  freedSpace: string;
}> => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const dir = backupDir || path.join(process.cwd(), 'backups');
    const backups = await listBackups(dir);

    if (backups.length === 0) {
      return { deletedCount: 0, retainedCount: 0, freedSpace: '0KB' };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    let deletedCount = 0;
    let freedSpace = 0;

    // Delete old backups beyond retention period
    for (const backup of backups) {
      const backupDate = new Date(backup.timestamp);
      const shouldDelete =
        backupDate < cutoffDate || deletedCount >= maxBackups;

      if (shouldDelete && backups.length - deletedCount > 1) {
        // Always keep at least 1 backup
        try {
          const stats = await fs.stat(backup.filePath);
          await fs.unlink(backup.filePath);
          deletedCount++;
          freedSpace += stats.size;
          console.log(`🗑️ Deleted old backup: ${backup.fileName}`);
        } catch (error) {
          console.error(`Failed to delete backup ${backup.fileName}:`, error);
        }
      }
    }

    return {
      deletedCount,
      retainedCount: backups.length - deletedCount,
      freedSpace: `${Math.round(freedSpace / 1024)}KB`,
    };
  } catch (error) {
    console.error('Failed to cleanup old backups:', error);
    return { deletedCount: 0, retainedCount: 0, freedSpace: '0KB' };
  }
};
