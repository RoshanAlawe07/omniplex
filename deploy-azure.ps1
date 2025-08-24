# 🚀 Azure Deployment Script for Omniplex
# Run this script in PowerShell as Administrator

param(
    [string]$ResourceGroupName = "omniplex-rg",
    [string]$Location = "eastus",
    [string]$AppServicePlanName = "omniplex-plan",
    [string]$WebAppName = "omniplex-app"
)

Write-Host "🚀 Starting Azure Deployment for Omniplex..." -ForegroundColor Green

# Check if Azure CLI is installed
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✅ Azure CLI found: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Installing..." -ForegroundColor Red
    winget install -e --id Microsoft.AzureCLI
    Write-Host "✅ Azure CLI installed. Please restart PowerShell and run this script again." -ForegroundColor Green
    exit
}

# Check if logged in to Azure
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Azure..." -ForegroundColor Yellow
    az login
}

# Create Resource Group
Write-Host "📦 Creating Resource Group: $ResourceGroupName" -ForegroundColor Blue
az group create --name $ResourceGroupName --location $Location

# Create App Service Plan (Free Tier)
Write-Host "📋 Creating App Service Plan: $AppServicePlanName" -ForegroundColor Blue
az appservice plan create `
    --name $AppServicePlanName `
    --resource-group $ResourceGroupName `
    --sku F1 `
    --is-linux

# Create Web App
Write-Host "🌐 Creating Web App: $WebAppName" -ForegroundColor Blue
az webapp create `
    --name $WebAppName `
    --resource-group $ResourceGroupName `
    --plan $AppServicePlanName `
    --runtime "NODE|18-lts"

# Configure Environment Variables
Write-Host "⚙️ Configuring Environment Variables..." -ForegroundColor Blue

# Stripe Configuration
az webapp config appsettings set `
    --resource-group $ResourceGroupName `
    --name $WebAppName `
    --settings `
        STRIPE_SECRET_KEY="sk_test_your_key" `
        STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret" `
        STRIPE_PUBLISHABLE_KEY="pk_test_your_key"

# OpenAI Configuration
az webapp config appsettings set `
    --resource-group $ResourceGroupName `
    --name $WebAppName `
    --settings `
        OPENAI_API_KEY="your_openai_key"

# Firebase Configuration
az webapp config appsettings set `
    --resource-group $ResourceGroupName `
    --name $WebAppName `
    --settings `
        FIREBASE_API_KEY="your_firebase_key" `
        FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com" `
        FIREBASE_PROJECT_ID="your_project_id" `
        FIREBASE_STORAGE_BUCKET="your_project.appspot.com" `
        FIREBASE_MESSAGING_SENDER_ID="your_sender_id" `
        FIREBASE_APP_ID="your_app_id"

# Production Environment
az webapp config appsettings set `
    --resource-group $ResourceGroupName `
    --name $WebAppName `
    --settings `
        NODE_ENV="production"

# Set startup command
Write-Host "🔧 Configuring startup command..." -ForegroundColor Blue
az webapp config set `
    --resource-group $ResourceGroupName `
    --name $WebAppName `
    --startup-file "npm start"

# Get web app URL
$webAppUrl = az webapp show `
    --resource-group $ResourceGroupName `
    --name $WebAppName `
    --query "defaultHostName" `
    --output tsv

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "🌐 Your app is available at: https://$webAppUrl" -ForegroundColor Cyan

# Get publish profile for GitHub Actions
Write-Host "📋 Getting publish profile for GitHub Actions..." -ForegroundColor Blue
az webapp deployment list-publishing-profiles `
    --resource-group $ResourceGroupName `
    --name $WebAppName `
    --xml > publish-profile.xml

Write-Host "📄 Publish profile saved to: publish-profile.xml" -ForegroundColor Green
Write-Host "🔑 Add this as AZURE_WEBAPP_PUBLISH_PROFILE secret in GitHub" -ForegroundColor Yellow

# Show resource group info
Write-Host "📊 Resource Group Information:" -ForegroundColor Blue
az group show --name $ResourceGroupName --output table

Write-Host "🎉 Setup complete! Next steps:" -ForegroundColor Green
Write-Host "1. Update environment variables with your actual API keys" -ForegroundColor White
Write-Host "2. Push your code to GitHub" -ForegroundColor White
Write-Host "3. Add the publish profile as a GitHub secret" -ForegroundColor White
Write-Host "4. Update Stripe webhook URL to: https://$webAppUrl/api/stripe/webhook" -ForegroundColor White
