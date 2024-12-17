const authService = require('../services/authService'); // Adjust the path as necessary

jest.mock('../services/authService'); // Mock the auth service

describe('User Authentication', () => {
    it('should authenticate user with valid credentials', async () => {
        const mockUser = { username: 'testuser', password: 'testpass' };
        authService.login.mockResolvedValue({ token: 'valid-token' });

        const result = await authService.login(mockUser);
        expect(result.token).toBe('valid-token');
    });

    it('should fail authentication with invalid credentials', async () => {
        const mockUser = { username: 'testuser', password: 'wrongpass' };
        authService.login.mockResolvedValue(null);

        const result = await authService.login(mockUser);
        expect(result).toBeNull();
    });

    it('should validate token successfully', async () => {
        const token = 'valid-token';
        authService.validateToken.mockResolvedValue(true);

        const isValid = await authService.validateToken(token);
        expect(isValid).toBe(true);
    });

    it('should fail token validation with invalid token', async () => {
        const token = 'invalid-token';
        authService.validateToken.mockResolvedValue(false);

        const isValid = await authService.validateToken(token);
        expect(isValid).toBe(false);
    });
});
