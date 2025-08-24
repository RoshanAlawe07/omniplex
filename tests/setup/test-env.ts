// Test environment utilities for managing Redux state
export const TestUtils = {
  // Set Pro status in Redux store and localStorage
  setProStatus: (isPro: boolean) => {
    // Update localStorage
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    userDetails.isPro = isPro;
    localStorage.setItem('userDetails', JSON.stringify(userDetails));
    
    // Dispatch Redux action if store is available
    if (typeof window !== 'undefined' && (window as any).__REDUX_STORE__) {
      (window as any).__REDUX_STORE__.dispatch({
        type: 'auth/setProStatus',
        payload: isPro
      });
    }
    
    // Dispatch custom event for components to listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('proStatusChanged', { 
        detail: { isPro } 
      }));
    }
  },
  
  // Get current Pro status
  getProStatus: (): boolean => {
    if (typeof window === 'undefined') return false;
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    return userDetails.isPro || false;
  },
  
  // Reset to free user
  resetToFree: () => {
    TestUtils.setProStatus(false);
  },
  
  // Set up Pro user
  setupProUser: () => {
    TestUtils.setProStatus(true);
  },
  
  // Mock Stripe API responses
  mockStripeAPI: {
    success: () => ({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        sessionId: 'cs_test_mock_session_123'
      })
    }),
    
    failure: () => ({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Payment failed'
      })
    })
  }
};

// Make TestUtils available globally for tests
if (typeof window !== 'undefined') {
  (window as any).__TEST_UTILS__ = TestUtils;
}
