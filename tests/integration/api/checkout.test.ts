import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Stripe before importing the route
const mockCustomersList = vi.fn();
const mockCustomersCreate = vi.fn();
const mockCheckoutSessionsCreate = vi.fn();

const mockStripe = {
  customers: {
    list: mockCustomersList,
    create: mockCustomersCreate,
  },
  checkout: {
    sessions: {
      create: mockCheckoutSessionsCreate,
    },
  },
};

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe)
}));

// Mock environment variables
const originalEnv = process.env;

describe('/api/stripe - Checkout Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('POST /api/stripe', () => {
    it('should create checkout session with existing customer', async () => {
      // Mock Stripe responses
      mockCustomersList.mockResolvedValue({
        data: [{
          id: 'cus_existing123',
          email: 'test@example.com',
          metadata: { source: 'omniplex_web' },
          created: 1640995200,
        }],
      });

      mockCheckoutSessionsCreate.mockResolvedValue({
        id: 'cs_test_session123',
        url: 'https://checkout.stripe.com/test',
        customer: 'cus_existing123',
      });

      // Import the route after mocking
      const { POST } = await import('@/app/api/stripe/route');

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

      // Verify response
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('sessionId');
      expect(data.sessionId).toBe('cs_test_session123');

      // Verify Stripe calls
      expect(mockCustomersList).toHaveBeenCalledWith({
        email: 'test@example.com',
        limit: 1,
      });
      expect(mockCustomersCreate).not.toHaveBeenCalled();
      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_existing123',
          line_items: [{ price: 'price_test123', quantity: 1 }],
          mode: 'payment',
        })
      );
    });

    it('should create checkout session with new customer', async () => {
      // Mock Stripe responses
      mockCustomersList.mockResolvedValue({ data: [] });
      mockCustomersCreate.mockResolvedValue({
        id: 'cus_new123',
        email: 'new@example.com',
        metadata: { source: 'omniplex_web' },
        created: 1640995200,
      });
      mockCheckoutSessionsCreate.mockResolvedValue({
        id: 'cs_test_session456',
        url: 'https://checkout.stripe.com/test',
        customer: 'cus_new123',
      });

      const { POST } = await import('@/app/api/stripe/route');

      const requestBody = {
        priceId: 'price_test456',
        customerEmail: 'new@example.com',
      };

      const request = new NextRequest('http://localhost:3000/api/stripe', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify response
      expect(response.status).toBe(200);
      expect(data.sessionId).toBe('cs_test_session456');

      // Verify Stripe calls
      expect(mockCustomersCreate).toHaveBeenCalledWith({
        email: 'new@example.com',
        metadata: expect.objectContaining({
          source: 'omniplex_web',
        }),
      });
    });

    it('should handle missing priceId gracefully', async () => {
      // Mock Stripe to fail when priceId is undefined
      mockCheckoutSessionsCreate.mockRejectedValue(new Error('Invalid price ID'));

      const { POST } = await import('@/app/api/stripe/route');

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
      expect(data.error).toBe('Failed to create checkout session');
    });

    it('should work without customer email', async () => {
      mockCheckoutSessionsCreate.mockResolvedValue({
        id: 'cs_test_session789',
        url: 'https://checkout.stripe.com/test',
      });

      const { POST } = await import('@/app/api/stripe/route');

      const requestBody = {
        priceId: 'price_test789',
      };

      const request = new NextRequest('http://localhost:3000/api/stripe', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBe('cs_test_session789');
    });

    it('should handle Stripe customer list errors', async () => {
      mockCustomersList.mockRejectedValue(new Error('Stripe API error'));

      const { POST } = await import('@/app/api/stripe/route');

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
      expect(data.error).toBe('Failed to create checkout session');
    });

    it('should handle Stripe customer creation errors', async () => {
      mockCustomersList.mockResolvedValue({ data: [] });
      mockCustomersCreate.mockRejectedValue(new Error('Customer creation failed'));

      const { POST } = await import('@/app/api/stripe/route');

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

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create checkout session');
    });

    it('should handle Stripe checkout session creation errors', async () => {
      mockCustomersList.mockResolvedValue({
        data: [{
          id: 'cus_existing123',
          email: 'test@example.com',
        }],
      });
      mockCheckoutSessionsCreate.mockRejectedValue(new Error('Session creation failed'));

      const { POST } = await import('@/app/api/stripe/route');

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
      expect(data.error).toBe('Failed to create checkout session');
    });

    it('should include proper metadata in checkout session', async () => {
      mockCustomersList.mockResolvedValue({
        data: [{
          id: 'cus_existing123',
          email: 'test@example.com',
        }],
      });
      mockCheckoutSessionsCreate.mockResolvedValue({
        id: 'cs_test_session123',
        url: 'https://checkout.stripe.com/test',
      });

      const { POST } = await import('@/app/api/stripe/route');

      const requestBody = {
        priceId: 'price_test123',
        customerEmail: 'test@example.com',
      };

      const request = new NextRequest('http://localhost:3000/api/stripe', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      await POST(request);

      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            source: 'omniplex_pricing_page',
            customer_email: 'test@example.com',
          }),
          customer_update: {
            address: 'auto',
            name: 'auto',
          },
          submit_type: 'pay',
          locale: 'auto',
        })
      );
    });
  });
});
