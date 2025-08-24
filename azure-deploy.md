# 🚀 Azure Deployment Guide for Omniplex

## Prerequisites

- [Azure Free Account](https://azure.microsoft.com/en-us/free/) (Get $200 free credit)
- [Git](https://git-scm.com/) installed
- [Node.js 18+](https://nodejs.org/) installed
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed

## Step 1: Azure Account Setup

1. **Create Free Account**: Visit [Azure Free](https://azure.microsoft.com/en-us/free/)
2. **Sign up** with Microsoft account
3. **Verify identity** (credit card required, won't be charged during trial)
4. **Get $200 free credit** for 30 days + free services for 12 months

## Step 2: Install Azure CLI

```bash
# Windows (PowerShell as Administrator)
winget install -e --id Microsoft.AzureCLI

# macOS
brew install azure-cli

# Linux
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

## Step 3: Login to Azure

```bash
az login
# This will open browser for authentication
```

## Step 4: Create Resource Group

```bash
# Create resource group
az group create --name omniplex-rg --location eastus

# Verify creation
az group list --output table
```

## Step 5: Create App Service Plan

```bash
# Create free tier app service plan
az appservice plan create \
  --name omniplex-plan \
  --resource-group omniplex-rg \
  --sku F1 \
  --is-linux
```

## Step 6: Create Web App

```bash
# Create web app
az webapp create \
  --name omniplex-app \
  --resource-group omniplex-rg \
  --plan omniplex-plan \
  --runtime "NODE|18-lts"
```

## Step 7: Configure Environment Variables

```bash
# Set Stripe configuration
az webapp config appsettings set \
  --resource-group omniplex-rg \
  --name omniplex-app \
  --settings \
    STRIPE_SECRET_KEY="sk_test_your_key" \
    STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret" \
    STRIPE_PUBLISHABLE_KEY="pk_test_your_key"

# Set OpenAI configuration
az webapp config appsettings set \
  --resource-group omniplex-rg \
  --name omniplex-app \
  --settings \
    OPENAI_API_KEY="your_openai_key"

# Set Firebase configuration
az webapp config appsettings set \
  --resource-group omniplex-rg \
  --name omniplex-app \
  --settings \
    FIREBASE_API_KEY="your_firebase_key" \
    FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com" \
    FIREBASE_PROJECT_ID="your_project_id" \
    FIREBASE_STORAGE_BUCKET="your_project.appspot.com" \
    FIREBASE_MESSAGING_SENDER_ID="your_sender_id" \
    FIREBASE_APP_ID="your_app_id"

# Set NODE_ENV
az webapp config appsettings set \
  --resource-group omniplex-rg \
  --name omniplex-app \
  --settings \
    NODE_ENV="production"
```

## Step 8: Configure Web App Settings

```bash
# Enable continuous deployment
az webapp deployment source config \
  --resource-group omniplex-rg \
  --name omniplex-app \
  --repo-url "https://github.com/yourusername/omniplex.git" \
  --branch main \
  --manual-integration

# Set startup command
az webapp config set \
  --resource-group omniplex-rg \
  --name omniplex-app \
  --startup-file "npm start"
```

## Step 9: Deploy Application

### Option A: Deploy via Azure CLI
```bash
# Navigate to your project directory
cd path/to/omniplex

# Build the application
npm run build

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group omniplex-rg \
  --name omniplex-app \
  --src dist.zip
```

### Option B: Deploy via GitHub Actions
1. **Fork/Clone** your repository to GitHub
2. **Add Secrets** in GitHub repository settings:
   - `AZURE_WEBAPP_PUBLISH_PROFILE`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `OPENAI_API_KEY`
   - Firebase credentials
3. **Push** to main branch to trigger deployment

## Step 10: Get Publish Profile

```bash
# Get publish profile for GitHub Actions
az webapp deployment list-publishing-profiles \
  --resource-group omniplex-rg \
  --name omniplex-app \
  --xml
```

Copy the output and add it as `AZURE_WEBAPP_PUBLISH_PROFILE` secret in GitHub.

## Step 11: Verify Deployment

```bash
# Get web app URL
az webapp show \
  --resource-group omniplex-rg \
  --name omniplex-app \
  --query "defaultHostName" \
  --output tsv
```

Visit: `https://omniplex-app.azurewebsites.net`

## Step 12: Configure Custom Domain (Optional)

```bash
# Add custom domain
az webapp config hostname add \
  --webapp-name omniplex-app \
  --resource-group omniplex-rg \
  --hostname "yourdomain.com"
```

## Step 13: Monitor and Scale

```bash
# View logs
az webapp log tail \
  --resource-group omniplex-rg \
  --name omniplex-app

# Scale up if needed (after free tier)
az appservice plan update \
  --name omniplex-plan \
  --resource-group omniplex-rg \
  --sku B1
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `FIREBASE_API_KEY` | Firebase API key | `AIza...` |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `project.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `project-id` |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `project.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | `123456789` |
| `FIREBASE_APP_ID` | Firebase app ID | `1:123456789:web:abc123` |
| `NODE_ENV` | Node environment | `production` |

## Troubleshooting

### Common Issues:

1. **Build Failures**: Check Node.js version compatibility
2. **Environment Variables**: Ensure all required variables are set
3. **Stripe Webhooks**: Update webhook URL to Azure domain
4. **Firebase**: Verify Firebase project configuration
5. **CORS Issues**: Configure CORS in Azure App Service

### Useful Commands:

```bash
# Restart web app
az webapp restart --resource-group omniplex-rg --name omniplex-app

# View app settings
az webapp config appsettings list --resource-group omniplex-rg --name omniplex-app

# Delete resources (cleanup)
az group delete --name omniplex-rg --yes --no-wait
```

## Cost Optimization

- **Free Tier**: F1 plan (1 GB RAM, 1 CPU)
- **Scaling**: Only scale up when needed
- **Monitoring**: Use Azure Monitor to track usage
- **Cleanup**: Delete unused resources to avoid charges

## Next Steps

1. **Set up monitoring** with Azure Application Insights
2. **Configure SSL certificates** for HTTPS
3. **Set up backup and recovery** strategies
4. **Implement CI/CD pipeline** with GitHub Actions
5. **Add custom domain** and SSL certificate

## Support

- [Azure Documentation](https://docs.microsoft.com/en-us/azure/)
- [Azure Community](https://techcommunity.microsoft.com/t5/azure/ct-p/Azure)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/azure)
