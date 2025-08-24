import { test, expect } from '@playwright/test';

test.describe('Simple Test Setup', () => {
  test('should have test utilities available', async ({ page }) => {
    // Inject test utilities directly into the page
    await page.addInitScript(() => {
      console.log('🔧 Injecting test utilities directly into page...');
      
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
        }
      };
      
      console.log('🔧 Test utilities injected successfully');
    });
    
    await page.goto('/');
    
    // Check if test utilities are available
    const testUtilsAvailable = await page.evaluate(() => {
      console.log('🔧 Checking test utilities...');
      console.log('window.__TEST_UTILS__:', (window as any).__TEST_UTILS__);
      console.log('window.__REDUX_STORE__:', (window as any).__REDUX_STORE__);
      
      return {
        testUtils: !!(window as any).__TEST_UTILS__,
        reduxStore: !!(window as any).__REDUX_STORE__,
        testUtilsKeys: (window as any).__TEST_UTILS__ ? Object.keys((window as any).__TEST_UTILS__) : []
      };
    });
    
    console.log('🔧 Test utilities check result:', testUtilsAvailable);
    
    expect(testUtilsAvailable.testUtils).toBe(true);
    expect(testUtilsAvailable.reduxStore).toBe(true);
    expect(testUtilsAvailable.testUtilsKeys).toContain('setProStatus');
  });

  test('should be able to set Pro status', async ({ page }) => {
    // Inject test utilities directly into the page
    await page.addInitScript(() => {
      console.log('🔧 Injecting test utilities directly into page...');
      
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
        }
      };
      
      console.log('🔧 Test utilities injected successfully');
    });
    
    await page.goto('/');
    
    // Try to set Pro status
    const result = await page.evaluate(() => {
      try {
        if ((window as any).__TEST_UTILS__) {
          (window as any).__TEST_UTILS__.setupProUser();
          return { success: true, message: 'Pro status set successfully' };
        } else {
          return { success: false, message: 'Test utilities not available' };
        }
      } catch (error) {
        return { success: false, message: `Error: ${error.message}` };
      }
    });
    
    console.log('🔧 Set Pro status result:', result);
    expect(result.success).toBe(true);
  });
});
