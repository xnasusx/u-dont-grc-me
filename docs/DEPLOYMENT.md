# Deployment Guide

## Local Build

```powershell
npm run build
```

The static build is generated in `dist/`.

## AWS Static Hosting Target

For this prototype release, static hosting is preferred:

1. Create an S3 bucket.
2. Enable static website hosting.
3. Upload `dist/`.
4. Configure a public-read bucket policy for website assets if acceptable for the account.

## Current AWS Deployment

Deployment succeeded on 2026-07-30 against AWS account `<AWS_ACCOUNT_ID>` with IAM user `arn:aws:iam::<AWS_ACCOUNT_ID>:user/<deploy-user>`.

Hosted URL:

- http://u-dont-grc-me-<AWS_ACCOUNT_ID>-us-east-1.s3-website-us-east-1.amazonaws.com

S3 bucket:

- `u-dont-grc-me-<AWS_ACCOUNT_ID>-us-east-1`

Validation:

- Website endpoint returned HTTP `200`.
- Deployed HTML contains `u dont GRC me`.
- S3 website configuration uses `index.html` for index and error routing.

## Required IAM Permissions For Static S3 Hosting

Minimum permissions for the current deployment approach:

- `s3:CreateBucket`
- `s3:PutBucketWebsite`
- `s3:PutPublicAccessBlock`
- `s3:PutBucketPolicy`
- `s3:ListBucket`
- `s3:PutObject`
- `s3:DeleteObject`
- `s3:GetObject`

If public S3 website hosting is not acceptable, use CloudFront with Origin Access Control and keep the bucket private.

## Production Upgrade Path

Before handling real GRC data, move to:

- CloudFront in front of S3.
- AWS WAF for public edge protection.
- Cognito or enterprise SSO for authentication.
- Backend API for graph mutations.
- Server-side evidence storage with S3 Object Lock.
- Structured audit logging.
