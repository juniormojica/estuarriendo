import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');

describe('PR3 migration bootstrap wiring', () => {
    it('declares sequelize-cli migration scripts', () => {
        const packageJsonPath = path.join(backendRoot, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        expect(pkg.scripts['db:migrate']).toContain('sequelize-cli db:migrate');
        expect(pkg.scripts['db:migrate:status']).toContain('sequelize-cli db:migrate:status');
        expect(pkg.scripts['db:smoke:migrations']).toBe('node scripts/dbSmokeMigrations.js');
    });

    it('keeps migration files in CommonJS format (sequelize-cli compatible)', () => {
        const migrationsPath = path.join(backendRoot, 'src', 'migrations');
        const files = fs.readdirSync(migrationsPath).filter((file) => file.endsWith('.cjs'));

        expect(files.length).toBeGreaterThan(0);

        for (const file of files) {
            const content = fs.readFileSync(path.join(migrationsPath, file), 'utf8');
            expect(content).toContain('module.exports');
            expect(content).toMatch(/async\s+up\s*\(/);
            expect(content).toMatch(/async\s+down\s*\(/);
        }
    });

    it('includes explicit enum-evolution migrations for report and verification workflows', () => {
        const reportMigrationPath = path.join(backendRoot, 'src', 'migrations', '1772587280294-add-report-activity-logs.cjs');
        const verificationMigrationPath = path.join(backendRoot, 'src', 'migrations', '1775450000000-add-document-statuses.cjs');

        const reportMigration = fs.readFileSync(reportMigrationPath, 'utf8');
        const verificationMigration = fs.readFileSync(verificationMigrationPath, 'utf8');

        expect(reportMigration).toContain('ADD VALUE IF NOT EXISTS \'investigating\'');
        expect(reportMigration).toContain("PostgreSQL doesn't allow removing values from an ENUM type easily");

        expect(verificationMigration).toContain('ALTER TYPE "enum_users_verification_status" ADD VALUE IF NOT EXISTS \'in_progress\'');
        expect(verificationMigration).toContain('ALTER TYPE "enum_user_verification_verification_status" ADD VALUE IF NOT EXISTS \'in_progress\'');
    });

    it('keeps report_activity_logs migration metadata aligned for admin_id relationship', () => {
        const reportMigrationPath = path.join(backendRoot, 'src', 'migrations', '1772587280294-add-report-activity-logs.cjs');
        const reportMigration = fs.readFileSync(reportMigrationPath, 'utf8');

        expect(reportMigration).toContain('admin_id');
        expect(reportMigration).toContain('type: Sequelize.STRING(255)');
        expect(reportMigration).toContain("model: 'users'");
        expect(reportMigration).toContain("key: 'id'");
        expect(reportMigration).toContain("onDelete: 'CASCADE'");
    });
});
