import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('Missing Stripe signature or webhook secret');
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Payment successful:', {
          sessionId: session.id,
          customerId: session.customer,
          amount: session.amount_total,
          status: session.payment_status,
          timestamp: new Date().toISOString()
        });
        
        // Here you would typically:
        // 1. Update user's Pro status in your database
        // 2. Send confirmation email
        // 3. Log the successful payment
        // 4. Update billing history
        
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        console.log('✅ Recurring payment successful:', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          amount: invoice.amount_paid,
          status: invoice.status,
          timestamp: new Date().toISOString()
        });
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log('❌ Payment failed:', {
          invoiceId: failedInvoice.id,
          customerId: failedInvoice.customer,
          amount: failedInvoice.amount_due,
          status: failedInvoice.status,
          timestamp: new Date().toISOString()
        });
        
        // Here you would typically:
        // 1. Send payment failure notification
        // 2. Update user's subscription status
        // 3. Trigger retry logic
        break;

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Subscription updated:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          timestamp: new Date().toISOString()
        });
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log('🗑️ Subscription cancelled:', {
          subscriptionId: deletedSubscription.id,
          customerId: deletedSubscription.customer,
          status: deletedSubscription.status,
          timestamp: new Date().toISOString()
        });
        
        // Here you would typically:
        // 1. Downgrade user to free plan
        // 2. Send cancellation confirmation
        // 3. Update user permissions
        break;

      default:
        console.log(`📝 Unhandled event type: ${event.type}`);
    }

    // Log all webhook events for debugging
    console.log('📊 Webhook received:', {
      type: event.type,
      id: event.id,
      timestamp: new Date().toISOString(),
      data: event.data.object
    });

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
