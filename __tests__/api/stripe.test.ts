import { NextRequest } from 'next/server';
import { POST } from '@/app/api/stripe/route';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      list: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'cus_existing123',
            email: 'test@example.com',
            metadata: { source: 'omniplex_web' },
            created: 1640995200,
          },
        ],
      }),
      create: jest.fn().mockResolvedValue({
        id: 'cus_new123',
        email: 'new@example.com',
        metadata: { source: 'omniplex_web' },
        created: 1640995200,
      }),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_session123',
          url: 'https://checkout.stripe.com/test',
        }),
      },
    },
  }));
});

// Mock environment variables
const originalEnv = process.env;

describe('/api/stripe', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.STRIPE_SECRET_KEY = 'sk_test_key';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('POST', () => {
    it('should create checkout session with existing customer', async () => {
      const requestBody = {
        priceId: 'price_test123',
        customerEmail: 'test@example.com',
      };

      const request = new NextRequest('http://localhost:3000/api/stripe', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('sessionId');
      expect(data.sessionId).toBe('cs_test_session123');
    });

    it('should create checkout session with new customer', async () => {
      const requestBody = {
        priceId: 'price_test123',
        customerEmail: 'new@example.com',
      };

      const request = new NextRequest('http://localhost:3000/api/stripe', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('sessionId');
      expect(data.sessionId).toBe('cs_test_session123');
    });

    it('should handle missing priceId', async () => {
      const requestBody = {
        customerEmail: 'test@example.com',
      };

      const request = new NextRequest('http://localhost:3000/api/stripe', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });

    it('should handle Stripe errors gracefully', async () => {
      // Mock Stripe to throw an error
      jest.doMock('stripe', () => {
        return jest.fn().mockImplementation(() => ({
          customers: {
            list: jest.fn().mockRejectedValue(new Error('Stripe API error')),
          },
        }));
      });

      const requestBody = {
        priceId: 'price_test123',
        customerEmail: 'test@example.com',
      };

      const request = new NextRequest('http://localhost:3000/api/stripe', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Failed to create checkout session');
    });

    it('should work without customer email', async () => {
      const requestBody = {
        priceId: 'price_test123',
      };

      const request = new NextRequest('http://localhost:3000/api/stripe', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('sessionId');
    });
  });
});
