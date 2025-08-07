# GitHub Actions Deployment Configuration

## Overview
This repository uses GitHub Actions to automatically deploy to two environments:
- **Production** (master branch) → https://deterministic-key-generator.com
- **Development** (develop branch) → https://dev.deterministic-key-generator.com

## Required GitHub Secrets

To enable automated deployments, the following secrets must be configured in the repository settings:

### Production Environment (master → deterministic-key-generator.com)
- `PRD_HOST` - FTP server hostname/IP for production
- `PRD_USER` - FTP username for production
- `PRD_PASSWORD` - FTP password for production

### Development Environment (develop → dev.deterministic-key-generator.com)
- `DEV_HOST` - FTP server hostname/IP for development
- `DEV_USER` - FTP username for development  
- `DEV_PASSWORD` - FTP password for development

## How to Configure Secrets

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with the appropriate name and value
4. Ensure the FTP credentials have write access to the target directories

## Deployment Process

- **Automatic**: Pushes to `master` or `develop` branches trigger automatic deployments
- **Manual**: Use "Actions" tab → Select workflow → "Run workflow" for manual deployments
- **Content**: The `./src/` directory contents are deployed to the server root

## Troubleshooting

If deployments fail:
1. Check that all required secrets are configured
2. Verify FTP credentials are correct
3. Ensure the FTP user has write permissions
4. Check the Actions tab for detailed error logs