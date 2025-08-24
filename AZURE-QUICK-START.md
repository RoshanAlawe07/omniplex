# 🚀 Azure Quick Start - Deploy Omniplex in 10 Minutes!

## ⚡ Super Quick Deployment

### 1. **Get Azure Free Account** (2 min)
- Visit: https://azure.microsoft.com/en-us/free/
- Sign up with Microsoft account
- Get $200 free credit + free services for 12 months

### 2. **Install Azure CLI** (1 min)
```powershell
# Run in PowerShell as Administrator
winget install -e --id Microsoft.AzureCLI
```

### 3. **Run Deployment Script** (5 min)
```powershell
# Run in PowerShell as Administrator
.\deploy-azure.ps1
```

### 4. **Update API Keys** (2 min)
- Go to Azure Portal → Your Web App → Configuration
- Update these variables with your real keys:
  - `STRIPE_SECRET_KEY`
  - `OPENAI_API_KEY`
  - Firebase credentials

## 🎯 What You Get

- ✅ **Free Hosting** for 12 months
- ✅ **HTTPS** enabled automatically
- ✅ **Auto-scaling** ready
- ✅ **GitHub Actions** deployment
- ✅ **Monitoring** and logging
- ✅ **Custom domain** support

## 🌐 Your App URL

After deployment, your app will be available at:
```
https://omniplex-app.azurewebsites.net
```

## 🔧 Update Stripe Webhook

Go to Stripe Dashboard → Webhooks → Update endpoint to:
```
https://omniplex-app.azurewebsites.net/api/stripe/webhook
```

## 📱 Test Your Deployment

1. **Visit your app URL**
2. **Test Pro membership flow**
3. **Verify Stripe integration**
4. **Check Firebase authentication**

## 🆘 Need Help?

- **Documentation**: See `azure-deploy.md`
- **Script Issues**: Check PowerShell execution policy
- **Azure Issues**: Use Azure Portal support

## 💰 Cost Breakdown

- **Free Tier**: $0/month (12 months)
- **After Free**: ~$13/month (B1 plan)
- **Scaling**: Pay only when you need more power

## 🚀 Next Steps

1. **Custom Domain**: Add your own domain
2. **SSL Certificate**: Free with Azure
3. **Monitoring**: Set up Application Insights
4. **Backup**: Configure automated backups

---

**🎉 You're all set! Your Omniplex app is now running on Azure!**
