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
        const files = fs.readdirSync(migrationsPath).filter((file) => file.endsWith('.js'));

        expect(files.length).toBeGreaterThan(0);

        for (const file of files) {
            const content = fs.readFileSync(path.join(migrationsPath, file), 'utf8');
            expect(content).toContain('module.exports');
            expect(content).toMatch(/async\s+up\s*\(/);
            expect(content).toMatch(/async\s+down\s*\(/);
        }
    });
});
