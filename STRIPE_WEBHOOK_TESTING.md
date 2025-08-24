# 🚀 Stripe Webhook Testing Guide

## 📋 **Prerequisites**

1. **Install Stripe CLI**: [Download here](https://stripe.com/docs/stripe-cli)
2. **Stripe Account**: Test mode enabled
3. **Local Development Server**: Running on `localhost:3000`

## 🔑 **Setup Stripe CLI**

### **1. Login to Stripe**
```bash
stripe login
```

### **2. Forward Webhooks to Local Server**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Output Example:**
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

### **3. Set Environment Variable**
Add the webhook secret to your `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

## 🧪 **Testing Different Webhook Events**

### **1. Test Successful Payment**
```bash
stripe trigger payment_intent.succeeded
```

### **2. Test Payment Failure**
```bash
stripe trigger payment_intent.payment_failed
```

### **3. Test Customer Subscription**
```bash
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

### **4. Test Checkout Session**
```bash
stripe trigger checkout.session.completed
stripe trigger checkout.session.expired
```

### **5. Test Invoice Events**
```bash
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

## 🔄 **Complete Testing Workflow**

### **Step 1: Start Webhook Listener**
```bash
# Terminal 1: Start webhook listener
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### **Step 2: Start Your App**
```bash
# Terminal 2: Start Next.js dev server
npm run dev
```

### **Step 3: Test Payment Flow**
1. Go to your pricing page
2. Click "Upgrade to Pro"
3. Complete Stripe Checkout with test card `4242 4242 4242 4242`
4. Watch webhook events in Terminal 1

### **Step 4: Verify Webhook Processing**
Check your app logs and database for webhook processing.

## 📊 **Webhook Event Types for Testing**

### **Payment Events**
```bash
# Successful payment
stripe trigger payment_intent.succeeded

# Failed payment
stripe trigger payment_intent.payment_failed

# Payment requires action
stripe trigger payment_intent.requires_action
```

### **Subscription Events**
```bash
# New subscription
stripe trigger customer.subscription.created

# Subscription updated
stripe trigger customer.subscription.updated

# Subscription canceled
stripe trigger customer.subscription.deleted
```

### **Customer Events**
```bash
# New customer
stripe trigger customer.created

# Customer updated
stripe trigger customer.updated

# Customer deleted
stripe trigger customer.deleted
```

### **Invoice Events**
```bash
# Invoice paid
stripe trigger invoice.payment_succeeded

# Invoice failed
stripe trigger invoice.payment_failed

# Invoice created
stripe trigger invoice.created
```

## 🎯 **Custom Webhook Testing**

### **1. Test with Custom Data**
```bash
stripe trigger checkout.session.completed \
  --add checkout_session:metadata.source=omniplex_test \
  --add checkout_session:customer_email=test@example.com
```

### **2. Test Error Scenarios**
```bash
# Simulate webhook signature verification failure
stripe trigger payment_intent.succeeded --skip-verify
```

### **3. Test Rate Limiting**
```bash
# Send multiple events quickly
for i in {1..10}; do
  stripe trigger payment_intent.succeeded
  sleep 0.1
done
```

## 🐛 **Debugging Webhooks**

### **1. Enable Verbose Logging**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook --print-secret
```

### **2. Check Webhook Delivery**
```bash
stripe events list --limit 10
```

### **3. View Event Details**
```bash
stripe events retrieve evt_1234567890
```

### **4. Test Webhook Endpoint**
```bash
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test_signature" \
  -d '{"test": "data"}'
```

## 🔒 **Security Testing**

### **1. Test Invalid Signatures**
```bash
# Send webhook without proper signature
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "payment_intent.succeeded"}'
```

### **2. Test Replay Attacks**
```bash
# Send the same webhook multiple times
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.succeeded
```

### **3. Test Malformed Data**
```bash
# Send invalid JSON
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"invalid": json}'
```

## 📝 **Integration with Tests**

### **1. E2E Tests with Real Webhooks**
```typescript
// In your Playwright tests
test('should process webhook events', async ({ page }) => {
  // Start webhook listener
  const stripeProcess = spawn('stripe', [
    'listen',
    '--forward-to',
    'localhost:3000/api/stripe/webhook'
  ]);
  
  // Trigger webhook event
  await exec('stripe trigger payment_intent.succeeded');
  
  // Verify webhook processing
  // ... your assertions
});
```

### **2. Unit Tests with Mocked Webhooks**
```typescript
// Mock webhook signature verification
vi.mock('stripe', () => ({
  webhooks: {
    constructEvent: vi.fn().mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test' } }
    })
  }
}));
```

## 🚨 **Common Issues & Solutions**

### **1. Webhook Not Received**
- Check Stripe CLI is running
- Verify webhook endpoint URL is correct
- Check firewall/network settings

### **2. Signature Verification Failed**
- Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify webhook secret matches CLI output
- Check webhook endpoint implementation

### **3. Events Not Processing**
- Check webhook endpoint logs
- Verify event type handling
- Check database connections

## 📚 **Additional Resources**

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Webhook Testing Guide](https://stripe.com/docs/webhooks/test)
- [Event Types Reference](https://stripe.com/docs/api/events/types)
- [Webhook Security](https://stripe.com/docs/webhooks/signatures)

## 🎉 **Pro Tips**

1. **Use Different Webhook Secrets** for development/staging/production
2. **Test All Event Types** your app handles
3. **Monitor Webhook Delivery** in Stripe Dashboard
4. **Implement Retry Logic** for failed webhook deliveries
5. **Log All Webhook Events** for debugging
6. **Test Error Scenarios** thoroughly
7. **Use Webhook Testing** in CI/CD pipeline
