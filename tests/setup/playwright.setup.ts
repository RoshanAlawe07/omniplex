import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🔧 Starting Playwright global setup...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Add test utilities to the global window object
  await page.addInitScript(() => {
    console.log('🔧 Injecting test utilities into page...');
    
    // Test utility for managing Redux state
    (window as any).__TEST_UTILS__ = {
      // Set Pro status in Redux store
      setProStatus: (isPro: boolean) => {
        // Update localStorage
        const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
        userDetails.isPro = isPro;
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        
        // Dispatch Redux action if store is available
        if ((window as any).__REDUX_STORE__) {
          (window as any).__REDUX_STORE__.dispatch({
            type: 'auth/setProStatus',
            payload: isPro
          });
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('proStatusChanged', { 
          detail: { isPro } 
        }));
        
        console.log('🔧 Test utility: Set Pro status to', isPro);
      },
      
      // Get current Pro status
      getProStatus: () => {
        const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
        return userDetails.isPro || false;
      },
      
      // Reset to free user
      resetToFree: () => {
        (window as any).__TEST_UTILS__.setProStatus(false);
      },
      
      // Set up Pro user
      setupProUser: () => {
        (window as any).__TEST_UTILS__.setProStatus(true);
      },
      
      // Mock API responses
      mockAPI: {
        stripe: (response: any) => {
          // This will be used by tests to mock API calls
          (window as any).__MOCKED_STRIPE_RESPONSE = response;
        }
      }
    };
    
    // Make Redux store accessible to tests
    if ((window as any).__REDUX_STORE__) {
      console.log('🔧 Redux store available in tests');
    } else {
      console.log('⚠️ Redux store not available in tests');
    }
    
    console.log('🔧 Test utilities injected successfully');
  });
  
  await browser.close();
  
  console.log('✅ Playwright global setup completed with test utilities');
}

export default globalSetup;
