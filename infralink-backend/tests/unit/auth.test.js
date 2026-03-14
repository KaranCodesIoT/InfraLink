import { hashPassword } from '../../src/utils/encryption.utils.js';
import { signAccessToken } from '../../src/utils/token.utils.js';

describe('Auth Utils', () => {
    test('hashPassword should return a bcrypt hash', async () => {
        const hash = await hashPassword('password123');
        expect(hash).not.toBe('password123');
        expect(hash.startsWith('$2')).toBe(true);
    });

    test('signAccessToken should return a JWT string', () => {
        const token = signAccessToken({ id: 'user123', role: 'client' });
        expect(typeof token).toBe('string');
        expect(token.split('.').length).toBe(3);
    });
});
