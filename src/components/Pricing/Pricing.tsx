'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { setProStatus } from '@/store/authSlice';
import Link from 'next/link';

// Load Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const userDetails = useSelector((state: any) => state.auth.userDetails);

  const handleSubscribe = async (priceId: string) => {
    setLoading(true);
    
    try {
      // Create checkout session with customer email
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          priceId,
          customerEmail: userDetails?.email || 'guest@omniplex.com'
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe error:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Free Plan',
      price: '$0',
      features: [
        'Basic chat functionality',
        'Limited messages per day',
        'Standard support'
      ],
      buttonText: userDetails?.isPro ? 'Current Plan' : 'Current Plan',
      disabled: true
    },
    {
      name: 'Pro Plan',
      price: '$10',
      priceId: 'price_1Rz09tEr8AEdwwQI1uOjk1oN', // TODO: Replace with your actual Stripe price ID from the dashboard
      features: [
        'Unlimited messages',
        'Advanced AI models',
        'Priority support',
        'File uploads',
        'Custom integrations'
      ],
      buttonText: userDetails?.isPro ? 'Current Plan' : 'Upgrade to Pro',
      disabled: userDetails?.isPro
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          {userDetails?.isPro ? (
            <>
              <h1 className="text-4xl font-bold text-green-600 mb-4">
                ✨ Welcome, Pro Member!
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                You already have access to all premium features. Enjoy your enhanced experience!
              </p>
                             <div className="flex space-x-4 justify-center">
                 <button 
                   onClick={() => dispatch(setProStatus(false))}
                   className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                 >
                   🔄 Reset to Free (Testing)
                 </button>
                 <Link 
                   href="/billing"
                   className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                 >
                   📊 View Billing History
                 </Link>
               </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Choose Your Plan
              </h1>
              <p className="text-xl text-gray-600">
                Unlock the full potential of Omniplex with our premium features
              </p>
            </>
          )}
        </div>

                 <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
           {plans.map((plan, index) => (
             <div
               key={plan.name}
               className={`bg-white rounded-xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105 ${
                 index === 1 ? 'ring-2 ring-blue-500 ring-opacity-50 border-2 border-blue-200' : 'border border-gray-100'
               }`}
             >
                             <div className="text-center mb-8 relative">
                 {index === 1 && (
                   <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                     <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                       ⭐ Most Popular
                     </span>
                   </div>
                 )}
                 <h2 className="text-2xl font-bold text-black mb-2">
                   {plan.name}
                 </h2>
                 <div className="text-4xl font-bold text-blue-600 mb-1">
                   {plan.price}
                 </div>
                 <p className="text-black">
                   {plan.price === '$0' ? 'Forever' : 'One-time payment'}
                 </p>
               </div>

                             <ul className="space-y-4 mb-8">
                 {plan.features.map((feature) => (
                   <li key={feature} className="flex items-center text-black font-medium">
                     <svg
                       className="h-5 w-5 text-green-500 mr-3"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24"
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         strokeWidth="2"
                         d="M5 13l4 4L19 7"
                       />
                     </svg>
                     {feature}
                   </li>
                 ))}
               </ul>

              <button
                onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
                disabled={plan.disabled || loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.disabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Processing...' : plan.buttonText}
              </button>
            </div>
          ))}
        </div>

                 <div className="mt-12 text-center">
           <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
             <h3 className="text-lg font-semibold text-blue-900 mb-2">
               🧪 Test Mode
             </h3>
                           <p className="text-blue-800 text-sm">
                This is a test environment. Use Stripe test card <strong>4242 4242 4242 4242</strong> with any future expiry date and any 3-digit CVC to test payments.
              </p>
           </div>
         </div>
      </div>
    </div>
  );
}
