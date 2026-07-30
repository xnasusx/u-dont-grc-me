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

CloudFront hosted URL:

- https://d1oxsqx3ua8bb7.cloudfront.net

CloudFront distribution:

- `E2HL6YY0F2B5OW`

Origin Access Control:

- `E20XLJHCKV4NR`

Legacy S3 website endpoint:

- http://u-dont-grc-me-<AWS_ACCOUNT_ID>-us-east-1.s3-website-us-east-1.amazonaws.com

S3 bucket:

- `u-dont-grc-me-<AWS_ACCOUNT_ID>-us-east-1`

Validation:

- CloudFront deployment uses HTTPS and redirects HTTP to HTTPS.
- S3 direct website endpoint returns HTTP `403` after the bucket was made private.
- Bucket policy allows `s3:GetObject` only from CloudFront distribution `E2HL6YY0F2B5OW`.
- S3 public access block is fully enabled.

## Required IAM Permissions For Static CloudFront Hosting

Minimum permissions for the current deployment approach:

- `s3:CreateBucket`
- `s3:PutBucketWebsite`
- `s3:PutPublicAccessBlock`
- `s3:PutBucketPolicy`
- `s3:ListBucket`
- `s3:PutObject`
- `s3:DeleteObject`
- `s3:GetObject`
- `cloudfront:CreateDistribution`
- `cloudfront:GetDistribution`
- `cloudfront:CreateOriginAccessControl`

The S3 bucket should remain private. Public access should go through CloudFront.

## GitHub Pages Static Mirror

GitHub Pages is configured as a static demo mirror through `.github/workflows/pages.yml`.

Expected mirror URL:

- https://xnasusx.github.io/u-dont-grc-me/

The workflow:

1. Runs on pushes to `main` and manual dispatches.
2. Installs dependencies with `npm ci`.
3. Builds with `GITHUB_PAGES=true npm run build`.
4. Uploads `dist/` with `actions/upload-pages-artifact`.
5. Deploys through `actions/deploy-pages`.

Repository setting required after pushing the workflow:

- Settings -> Pages -> Build and deployment -> Source -> GitHub Actions

The Pages mirror is static only. It does not host `server/api.js`, SQLite, background jobs, or production auth. The app falls back to seeded browser data unless `VITE_API_BASE_URL` points to a reachable API.

## Production Upgrade Path

Before handling real GRC data, move to:

- CloudFront in front of S3.
- AWS WAF for public edge protection.
- Cognito or enterprise SSO for authentication.
- Backend API for graph mutations.
- Server-side evidence storage with S3 Object Lock.
- Structured audit logging.
