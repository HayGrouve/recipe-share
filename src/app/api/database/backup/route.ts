import { NextRequest, NextResponse } from 'next/server';
import {
  createDatabaseBackup,
  saveDatabaseBackup,
  verifyDatabaseBackup,
  listBackups,
} from '@/lib/db-backup';

// GET: List or verify backups
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const filePath = url.searchParams.get('filePath');

    // Check authorization
    const authHeader = request.headers.get('authorization');
    const backupSecret = process.env.BACKUP_SECRET || process.env.CRON_SECRET;

    if (backupSecret && authHeader !== `Bearer ${backupSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'verify' && filePath) {
      // Verify a specific backup
      const verification = await verifyDatabaseBackup(filePath);
      return NextResponse.json({
        action: 'verify',
        filePath,
        ...verification,
      });
    }

    // Default: List all backups
    const backups = await listBackups();
    return NextResponse.json({
      action: 'list',
      backups,
      total: backups.length,
    });
  } catch (error) {
    console.error('Backup API GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process backup request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST: Create a new backup
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    const backupSecret = process.env.BACKUP_SECRET || process.env.CRON_SECRET;

    if (backupSecret && authHeader !== `Bearer ${backupSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();
    console.log('🔄 Starting database backup...');

    // Create backup
    const backupData = await createDatabaseBackup();

    // Save backup to file
    const filePath = await saveDatabaseBackup(backupData);

    // Verify the backup was saved correctly
    const verification = await verifyDatabaseBackup(filePath);

    const duration = Date.now() - startTime;

    const response = {
      success: true,
      backup: {
        filePath,
        timestamp: backupData.timestamp,
        version: backupData.version,
        totalRecords: backupData.metadata.totalRecords,
        backupSize: backupData.metadata.backupSize,
        environment: backupData.metadata.environment,
      },
      verification,
      performance: {
        duration: `${duration}ms`,
        recordsPerSecond: Math.round(
          backupData.metadata.totalRecords / (duration / 1000)
        ),
      },
    };

    console.log('✅ Database backup completed successfully');
    console.log(`📁 File: ${filePath}`);
    console.log(`📊 Records: ${backupData.metadata.totalRecords}`);
    console.log(`⏱️ Duration: ${duration}ms`);

    return NextResponse.json(response, {
      headers: {
        'X-Backup-Duration': `${duration}ms`,
        'X-Backup-Records': backupData.metadata.totalRecords.toString(),
        'X-Backup-Size': backupData.metadata.backupSize,
      },
    });
  } catch (error) {
    console.error('❌ Database backup failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Backup creation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete old backups
export async function DELETE(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    const backupSecret = process.env.BACKUP_SECRET || process.env.CRON_SECRET;

    if (backupSecret && authHeader !== `Bearer ${backupSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const retentionDays = parseInt(
      url.searchParams.get('retentionDays') || '30'
    );
    const maxBackups = parseInt(url.searchParams.get('maxBackups') || '10');

    console.log(
      `🧹 Cleaning up backups older than ${retentionDays} days, keeping max ${maxBackups} backups`
    );

    // This would be implemented if we had the cleanupOldBackups function
    // For now, just return a placeholder response
    return NextResponse.json({
      success: true,
      message: 'Backup cleanup functionality would be implemented here',
      parameters: {
        retentionDays,
        maxBackups,
      },
    });
  } catch (error) {
    console.error('Backup cleanup failed:', error);
    return NextResponse.json(
      {
        error: 'Backup cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
