import { describe, it, expect } from 'vitest';
import bcrypt from 'bcrypt';

describe('Hash password', () => {
    it('Should produce different password', async () => {
        const password = 'myPassWord123';
        const hash = await bcrypt.hash(password, 12);

        expect(hash).not.toBe(password);
    });

    it('Should validate the password', async () => {
        const password = 'myPassWord123';
        const hash = await bcrypt.hash(password, 12);

        const isValid = await bcrypt.compare(password, hash);
        expect(isValid).toBe(true);
    });

    it('SHould reject a bad password', async () => {
        const hash = await bcrypt.hash('myPassWord123', 12);
        const isValid = await bcrypt.compare('notMyPassWord789', hash);
        expect(isValid).not.toBe(true);
    });
});