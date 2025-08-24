import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Stripe before importing the route
const mockConstructEvent = vi.fn();
const mockStripe = {
  webhooks: {
    constructEvent: mockConstructEvent
  }
};

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe)
}));

// Mock Next.js headers
const mockHeaders = vi.fn();
vi.mock('next/headers', () => ({
  headers: mockHeaders
}));

// Mock environment variables
const originalEnv = process.env;

describe('/api/stripe/webhook - Webhook Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_webhook_secret';
    
    // Reset mock headers to default
    mockHeaders.mockReturnValue(new Map([
      ['stripe-signature', 't=1234567890,v1=test_signature']
    ]));
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('POST /api/stripe/webhook', () => {
    it('should handle checkout.session.completed event', async () => {
      // Mock successful webhook verification
      mockConstructEvent.mockReturnValue({
        id: 'evt_test_webhook_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_session_123',
            customer: 'cus_test_customer_123',
            customer_email: 'test@example.com'
          }
        }
      });

      // Import the route after mocking
      const { POST } = await import('@/app/api/stripe/webhook/route');

      const mockBody = JSON.stringify({
        id: 'evt_test_webhook_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_session_123',
            customer: 'cus_test_customer_123',
            customer_email: 'test@example.com'
          }
        }
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: mockBody,
        headers: {
          'stripe-signature': 't=1234567890,v1=test_signature'
        }
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.received).toBe(true);
    });

    it('should handle invoice.payment_succeeded event', async () => {
      mockConstructEvent.mockReturnValue({
        id: 'evt_test_webhook_456',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_test_invoice_456',
            customer: 'cus_test_customer_456',
            amount_paid: 1000,
            status: 'paid'
          }
        }
      });

      const { POST } = await import('@/app/api/stripe/webhook/route');

      const mockBody = JSON.stringify({
        id: 'evt_test_webhook_456',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_test_invoice_456',
            customer: 'cus_test_customer_456',
            amount_paid: 1000,
            status: 'paid'
          }
        }
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: mockBody,
        headers: {
          'stripe-signature': 't=1234567890,v1=test_signature'
        }
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.received).toBe(true);
    });

    it('should handle missing stripe-signature header', async () => {
      // Mock headers to return no signature
      mockHeaders.mockReturnValueOnce(new Map());

      const { POST } = await import('@/app/api/stripe/webhook/route');

      const mockBody = JSON.stringify({
        id: 'evt_test_webhook_123',
        type: 'checkout.session.completed',
        data: { object: {} }
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: mockBody
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Webhook signature verification failed');
    });

    it('should handle invalid webhook signature', async () => {
      // Mock webhook signature verification to fail
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const { POST } = await import('@/app/api/stripe/webhook/route');

      const mockBody = JSON.stringify({
        id: 'evt_test_webhook_123',
        type: 'checkout.session.completed',
        data: { object: {} }
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: mockBody,
        headers: {
          'stripe-signature': 'invalid_signature'
        }
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Webhook signature verification failed');
    });

    it('should handle unknown event types gracefully', async () => {
      mockConstructEvent.mockReturnValue({
        id: 'evt_test_webhook_999',
        type: 'unknown.event.type',
        data: { object: {} }
      });

      const { POST } = await import('@/app/api/stripe/webhook/route');

      const mockBody = JSON.stringify({
        id: 'evt_test_webhook_999',
        type: 'unknown.event.type',
        data: { object: {} }
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: mockBody,
        headers: {
          'stripe-signature': 't=1234567890,v1=test_signature'
        }
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.received).toBe(true);
    });
  });
});
