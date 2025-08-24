import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { priceId, customerEmail } = await request.json();

    // Create or retrieve customer
    let customer;
    if (customerEmail) {
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });
      
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        console.log('🔍 Existing customer found:', customer.id);
      } else {
        customer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            source: 'omniplex_web',
            created_at: new Date().toISOString(),
          },
        });
        console.log('✨ New customer created:', customer.id);
      }
    }

    // Create Stripe checkout session with enhanced options
    const session = await stripe.checkout.sessions.create({
      customer: customer?.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/payment/cancel`,
      metadata: {
        source: 'omniplex_pricing_page',
        customer_email: customerEmail,
        timestamp: new Date().toISOString(),
      },
      // Enhanced customer experience
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      // Professional appearance
      submit_type: 'pay',
      locale: 'auto',
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
