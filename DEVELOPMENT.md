# Development Guide

## 🚀 **Project Setup**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **Installation**
```bash
npm install
npm run dev
```

## 🔧 **Development Tools**

### **TypeScript**
The project uses TypeScript for type safety. Key types are defined in `src/utils/types.ts`:

- **Stripe Types**: `StripeCheckoutRequest`, `StripeCheckoutResponse`, `StripeCustomer`
- **Payment Types**: `StripePayment`, `PaymentMethod`, `BillingPeriod`
- **User Types**: `UserDetails` with Pro subscription status
- **Webhook Types**: `StripeWebhookEvent` for payment processing

### **Code Quality**

#### **ESLint Configuration**
Located in `.eslintrc.json` with:
- Next.js recommended rules
- TypeScript-specific rules
- Custom rules for code consistency
- Strict type checking

#### **Prettier Configuration**
Located in `.prettierrc` with:
- Single quotes
- 80 character line width
- Consistent formatting rules
- JSX-friendly settings

### **Testing**

#### **Jest Configuration**
- **Location**: `jest.config.js`
- **Setup**: `jest.setup.js`
- **Coverage**: Configured for comprehensive testing
- **Environment**: jsdom for DOM testing

#### **Test Commands**
```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ci       # Run tests for CI/CD
```

#### **Test Structure**
- **Location**: `__tests__/` directory
- **API Tests**: Comprehensive Stripe API testing
- **Component Tests**: React component testing
- **Mocking**: Full Next.js and Stripe mocking

## 📁 **Project Structure**

```
omniplex/
├── src/
│   ├── app/                 # Next.js 13+ app directory
│   │   ├── api/            # API routes (Stripe, etc.)
│   │   ├── billing/        # Billing history page
│   │   ├── payment/        # Payment success/cancel pages
│   │   └── pricing/        # Pricing page
│   ├── components/         # React components
│   ├── store/             # Redux store and slices
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utilities and types
├── __tests__/             # Test files
├── .eslintrc.json         # ESLint configuration
├── .prettierrc            # Prettier configuration
├── jest.config.js         # Jest configuration
└── jest.setup.js          # Jest setup and mocks
```

## 🧪 **Testing Examples**

### **Stripe API Testing**
```typescript
describe('/api/stripe', () => {
  it('should create checkout session with existing customer', async () => {
    // Test implementation
  });
  
  it('should handle Stripe errors gracefully', async () => {
    // Error handling test
  });
});
```

### **Component Testing**
```typescript
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';

// Test component with Redux store
```

## 🔍 **Code Quality Commands**

```bash
# Linting
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues

# Formatting
npm run format        # Format all files
npm run format:check  # Check formatting

# Testing
npm run test          # Run tests
npm run test:coverage # Coverage report
```

## 📊 **Type Safety**

### **Strict TypeScript Configuration**
- `tsconfig.json` with strict mode enabled
- No implicit `any` types
- Strict null checks
- Comprehensive type definitions

### **Key Type Definitions**
```typescript
// User subscription status
export type UserDetails = {
  email?: string;
  isPro: boolean;        // Pro subscription status
  uid?: string;
  displayName?: string;
  photoURL?: string;
};

// Stripe checkout request
export type StripeCheckoutRequest = {
  priceId: string;       // Stripe price ID
  customerEmail?: string; // Optional customer email
};
```

## 🚀 **Best Practices**

### **Code Organization**
- **Types**: Centralized in `src/utils/types.ts`
- **Components**: Modular, reusable components
- **API Routes**: RESTful, error-handled endpoints
- **State Management**: Redux with TypeScript

### **Testing Strategy**
- **Unit Tests**: API routes and utilities
- **Integration Tests**: Component interactions
- **Mocking**: External services (Stripe, Firebase)
- **Coverage**: Aim for 80%+ test coverage

### **Error Handling**
- **API Errors**: Graceful fallbacks
- **Type Errors**: Compile-time checking
- **Runtime Errors**: User-friendly messages
- **Logging**: Structured error logging

## 🔧 **Development Workflow**

1. **Setup**: Install dependencies with `npm install`
2. **Development**: Run `npm run dev` for local development
3. **Testing**: Run `npm run test` before committing
4. **Linting**: Ensure `npm run lint` passes
5. **Formatting**: Run `npm run format` for consistent code
6. **Build**: Test production build with `npm run build`

## 📚 **Additional Resources**

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
