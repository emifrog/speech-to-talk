import { signUp, signIn, signOut, getCurrentUser, resetPassword, updatePassword } from '@/services/auth';

// Mock Supabase client
const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();
const mockGetUser = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      getUser: mockGetUser,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
    },
  })),
}));

// Mock sentry
jest.mock('@/lib/sentry', () => ({
  captureError: jest.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('returns user on successful signup', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: {
          user: { id: '123', email: 'test@test.com', created_at: '2026-01-01T00:00:00Z' },
        },
        error: null,
      });

      const result = await signUp({ email: 'test@test.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe('test@test.com');
    });

    it('returns error on signup failure', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Email already exists' },
      });

      const result = await signUp({ email: 'test@test.com', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SIGNUP_ERROR');
    });
  });

  describe('signIn', () => {
    it('returns user on successful signin', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: '123', email: 'test@test.com', created_at: '2026-01-01T00:00:00Z' },
        },
        error: null,
      });

      const result = await signIn({ email: 'test@test.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe('test@test.com');
    });

    it('returns validation error for empty email', async () => {
      const result = await signIn({ email: '', password: 'password123' });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });

    it('returns error on signin failure', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      });

      const result = await signIn({ email: 'test@test.com', password: 'wrong' });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SIGNIN_ERROR');
    });
  });

  describe('signOut', () => {
    it('signs out successfully', async () => {
      mockSignOut.mockResolvedValueOnce({ error: null });

      const result = await signOut();

      expect(result.success).toBe(true);
    });

    it('returns error on signout failure', async () => {
      mockSignOut.mockResolvedValueOnce({ error: { message: 'Session expired' } });

      const result = await signOut();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SIGNOUT_ERROR');
    });
  });

  describe('getCurrentUser', () => {
    it('returns user when authenticated', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: {
          user: { id: '123', email: 'test@test.com', created_at: '2026-01-01T00:00:00Z' },
        },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data?.user?.email).toBe('test@test.com');
    });

    it('returns null user when session missing', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Auth session missing!' },
      });

      const result = await getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data?.user).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('sends reset email successfully', async () => {
      mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });

      const result = await resetPassword('test@test.com');

      expect(result.success).toBe(true);
    });

    it('returns validation error for invalid email', async () => {
      const result = await resetPassword('not-an-email');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('updatePassword', () => {
    it('updates password successfully', async () => {
      mockUpdateUser.mockResolvedValueOnce({ error: null });

      const result = await updatePassword('newStrongPassword123!');

      expect(result.success).toBe(true);
    });

    it('returns error on update failure', async () => {
      mockUpdateUser.mockResolvedValueOnce({ error: { message: 'Weak password' } });

      const result = await updatePassword('newStrongPassword123!');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('UPDATE_PASSWORD_ERROR');
    });
  });
});
