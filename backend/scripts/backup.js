// backend/scripts/backup.js

const fs = require('fs');
const path = require('path');
const { logOperacion } = require('../utils/logger');

const dbPath = path.join(__dirname, '../db/database.sqlite');
const backupsDir = path.join(__dirname, '../../backups');

if (!fs.existsSync(dbPath)) {
    console.error('No se encontró la base de datos');
    process.exit(1);
}
if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir);
}

const fecha = new Date().toISOString().replace(/[:.]/g, '-').slice(0,19);
const backupFile = path.join(backupsDir, `backup-${fecha}.sqlite`);

fs.copyFileSync(dbPath, backupFile);
logOperacion('BACKUP_CREADO', 'Backup de base de datos creado', { backupFile });
console.log(`Backup creado: ${backupFile}`);
