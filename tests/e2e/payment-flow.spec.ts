import { test, expect } from '@playwright/test';

test.describe('Complete Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Inject test utilities directly into the page
    await page.addInitScript(() => {
      console.log('🔧 Injecting test utilities directly into payment flow test page...');
      
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
      
      console.log('🔧 Test utilities injected successfully for payment flow tests');
    });
    
    // Navigate to the home page
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should complete full payment flow and unlock Pro features', async ({ page }) => {
    // Step 1: Verify initial state (Free user)
    await expect(page.locator('text=🚀 Upgrade to Pro')).toBeVisible();
    
    // Verify Pro features are not accessible
    await expect(page.locator('text=✨ Pro Member')).not.toBeVisible();
    
    // Step 2: Navigate to pricing page - use direct navigation instead of clicking button
    await page.goto('/pricing');
    await expect(page).toHaveURL('/pricing');
    
    // Verify pricing page loads correctly
    await expect(page.locator('text=Choose Your Plan')).toBeVisible();
    await expect(page.locator('text=Pro Plan')).toBeVisible();
    await expect(page.locator('text=$10')).toBeVisible();
    
    // Step 3: Mock Stripe API BEFORE clicking the button
    await page.route('**/api/stripe', async route => {
      console.log('🔧 Mocking Stripe API call');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: 'cs_test_mock_session_123'
        })
      });
    });
    
    // Step 4: Click Upgrade to Pro button
    const upgradeButton = page.locator('button:has-text("Upgrade to Pro")');
    await expect(upgradeButton).toBeEnabled();
    await upgradeButton.click();
    
    // Step 5: Wait for the mocked response (should be immediate)
    await page.waitForTimeout(1000); // Give time for the mock to process
    
    // Step 6: Simulate successful payment by going to success page
    await page.goto('/payment/success?session_id=cs_test_mock_session_123');
    
    // Verify success page
    await expect(page.locator('text=Payment Successful!')).toBeVisible();
    await expect(page.locator('text=Your Pro Plan has been activated successfully')).toBeVisible();
    
    // Step 7: Return to home page and verify Pro status
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify Pro status is now active
    await expect(page.locator('text=✨ Pro Member')).toBeVisible();
    await expect(page.locator('text=🚀 Upgrade to Pro')).not.toBeVisible();
    
    // Verify Pro features are accessible
    await expect(page.locator('text=📋 Manage Plan')).toBeVisible();
  });

  test('should handle payment cancellation gracefully', async ({ page }) => {
    // Navigate to pricing page directly
    await page.goto('/pricing');
    await expect(page).toHaveURL('/pricing');
    
    // Mock Stripe API with cancellation response
    await page.route('**/api/stripe', async route => {
      console.log('🔧 Mocking Stripe API call for cancellation');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionId: 'cs_test_cancelled_session_123'
        })
      });
    });
    
    // Click upgrade button
    const upgradeButton = page.locator('button:has-text("Upgrade to Pro")');
    await upgradeButton.click();
    
    // Wait for the mock to process
    await page.waitForTimeout(1000);
    
    // Simulate cancellation by going to cancel page
    await page.goto('/payment/cancel');
    
    // Verify cancellation page
    await expect(page.locator('text=Payment Cancelled')).toBeVisible();
    await expect(page.locator('text=No charges were made to your account')).toBeVisible();
    
    // Return to home and verify still Free user
    await page.goto('/');
    await expect(page.locator('text=🚀 Upgrade to Pro')).toBeVisible();
    await expect(page.locator('text=✨ Pro Member')).not.toBeVisible();
  });

  test('should maintain Pro status across page refreshes', async ({ page }) => {
    // Set Pro status using test utilities
    await page.evaluate(() => {
      (window as any).__TEST_UTILS__.setupProUser();
    });
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify Pro status persists
    await expect(page.locator('text=✨ Pro Member')).toBeVisible();
    await expect(page.locator('text=🚀 Upgrade to Pro')).not.toBeVisible();
    
    // Navigate to Pro features
    await page.goto('/billing');
    await expect(page.locator('text=Billing & Payments')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Navigate to pricing page directly
    await page.goto('/pricing');
    await expect(page).toHaveURL('/pricing');
    
    // Mock network error
    await page.route('**/api/stripe', async route => {
      console.log('🔧 Mocking network error');
      await route.abort('failed');
    });
    
    // Click upgrade button
    const upgradeButton = page.locator('button:has-text("Upgrade to Pro")');
    await upgradeButton.click();
    
    // Wait for error handling
    await page.waitForTimeout(2000);
    
    // Verify error is handled gracefully (no crash)
    await expect(page.locator('text=Choose Your Plan')).toBeVisible();
  });
});

test.describe('Pro Feature Access', () => {
  test.beforeEach(async ({ page }) => {
    // Inject test utilities directly into the page
    await page.addInitScript(() => {
      console.log('🔧 Injecting test utilities directly into Pro feature access test page...');
      
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
      
      console.log('🔧 Test utilities injected successfully for Pro feature access tests');
    });
    
    // Set Pro status for these tests
    await page.goto('/');
    
    // Set Pro status using test utilities
    await page.evaluate(() => {
      (window as any).__TEST_UTILS__.setupProUser();
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should access all Pro features', async ({ page }) => {
    // Test billing access
    await page.goto('/billing');
    await expect(page.locator('text=Billing & Payments')).toBeVisible();
    await expect(page.locator('h3:has-text("Payment History")')).toBeVisible();
    
    // Test pricing page as Pro user
    await page.goto('/pricing');
    // Use a more specific selector to avoid duplicate text issues
    await expect(page.locator('button:has-text("Current Plan")').first()).toBeVisible();
    
    // Test Pro-only features in main prompt
    await page.goto('/');
    await expect(page.locator('text=✨ Pro Member')).toBeVisible();
    await expect(page.locator('text=📋 Manage Plan')).toBeVisible();
  });

  test('should be able to reset to Free status', async ({ page }) => {
    // Verify Pro status
    await expect(page.locator('text=✨ Pro Member')).toBeVisible();
    
    // Click reset button
    await page.click('text=🔄 Reset to Free (Testing)');
    
    // Verify status changed to Free
    await expect(page.locator('text=🚀 Upgrade to Pro')).toBeVisible();
    await expect(page.locator('text=✨ Pro Member')).not.toBeVisible();
    
    // Verify Pro features are no longer accessible
    await page.goto('/billing');
    await expect(page.locator('text=Upgrade to Pro to access your billing history')).toBeVisible();
  });
});
