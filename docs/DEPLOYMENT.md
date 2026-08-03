# Deployment Guide

> **Placeholders.** `<AWS_ACCOUNT_ID>` and `<deploy-user>` stand in for real values throughout this
> guide and in `infra/*.json`. Substitute your own when applying; account IDs and IAM principal names
> are deliberately not committed. The Lambda function URL and CloudFront domain below are public
> endpoints the shipped bundle already calls, so they are documented as-is.

## Local Build

```powershell
npm run build
```

The static build is generated in `dist/`.

For the CloudFront production build, set the hosted API URL before building:

```powershell
$env:VITE_API_BASE_URL="https://fvtqz3hs2ohvappyrcya2oats40sodrc.lambda-url.us-east-1.on.aws"
npm run build
```

For the primary GitHub Pages build, set both the Pages base path and hosted API URL:

```powershell
$env:GITHUB_PAGES="true"
$env:VITE_API_BASE_URL="https://fvtqz3hs2ohvappyrcya2oats40sodrc.lambda-url.us-east-1.on.aws"
npm run build
```

The repository workflow `.github/workflows/pages.yml` sets those variables automatically for pushes to `main`.

## AWS Static Hosting Target

For this prototype release, static hosting is preferred:

1. Create an S3 bucket.
2. Enable static website hosting.
3. Upload `dist/`.
4. Configure a public-read bucket policy for website assets if acceptable for the account.

## Current Hosted Deployment

Primary GitHub Pages frontend:

- https://xnasusx.github.io/u-dont-grc-me/

AWS CloudFront mirror:

- https://d1oxsqx3ua8bb7.cloudfront.net

## Current AWS Deployment

Deployment succeeded on 2026-07-30 against AWS account `<AWS_ACCOUNT_ID>` with IAM user `arn:aws:iam::<AWS_ACCOUNT_ID>:user/<deploy-user>`.

CloudFront distribution:

- `E2HL6YY0F2B5OW`

Origin Access Control:

- `E20XLJHCKV4NR`

Legacy S3 website endpoint:

- http://u-dont-grc-me-<AWS_ACCOUNT_ID>-us-east-1.s3-website-us-east-1.amazonaws.com

S3 bucket:

- `u-dont-grc-me-<AWS_ACCOUNT_ID>-us-east-1`

Hosted Governance API:

- Lambda Function URL: https://fvtqz3hs2ohvappyrcya2oats40sodrc.lambda-url.us-east-1.on.aws
- Lambda function: `u-dont-grc-me-governance-api`
- DynamoDB table: `u-dont-grc-me-governance`
- IAM role: `u-dont-grc-me-governance-api-role`
- API mode: public read-only `/api/health` and `/api/governance`; public mutations disabled until auth is added

Validation:

- CloudFront deployment uses HTTPS and redirects HTTP to HTTPS.
- S3 direct website endpoint returns HTTP `403` after the bucket was made private.
- Bucket policy allows `s3:GetObject` only from CloudFront distribution `E2HL6YY0F2B5OW`.
- S3 public access block is fully enabled.
- CloudFront build calls the hosted Governance API instead of the seeded browser fallback.
- GitHub Pages build calls the hosted Governance API instead of the seeded browser fallback.
- Lambda Function URL CORS allows `https://xnasusx.github.io`, `https://d1oxsqx3ua8bb7.cloudfront.net`, and local development origins.
- Hosted `/api/governance` returns 12 controls, 7 frameworks, 16 mappings, and 87% average evidence health from DynamoDB.

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

## Hosted Governance API

The hosted API is intentionally small and low-cost:

1. `npm run package:lambda` regenerates `server/governance-seed-snapshot.json` and packages `server/lambda.js`.
2. DynamoDB table `u-dont-grc-me-governance` stores the Governance snapshot under `TENANT#tenant-acme-us` / `SNAPSHOT#governance`.
3. Lambda Function URL serves the snapshot to CloudFront and local development origins.
4. Public `POST /api/controls` returns `405` until authentication, authorization, validation, and audit logging are implemented.

The resource policy requires both `lambda:InvokeFunctionUrl` and `lambda:InvokeFunction` for public Function URL access, matching AWS's post-October-2025 Function URL authorization behavior.

## GitHub Pages Frontend

GitHub Pages is configured as the primary static frontend through `.github/workflows/pages.yml`.

Expected mirror URL:

- https://xnasusx.github.io/u-dont-grc-me/

The workflow:

1. Runs on pushes to `main` and manual dispatches.
2. Installs dependencies with `npm ci`.
3. Builds with `GITHUB_PAGES=true npm run build`.
4. Uploads `dist/` with `actions/upload-pages-artifact`.
5. Deploys through `actions/deploy-pages`.

The workflow requests GitHub Pages enablement through `actions/configure-pages`. If GitHub blocks first-run enablement, set this manually:

- Settings -> Pages -> Build and deployment -> Source -> GitHub Actions

The Pages frontend is static only. It does not host `server/api.js`, SQLite, background jobs, or production auth. It calls the hosted Lambda/DynamoDB Governance read API because `VITE_API_BASE_URL` is set during the Pages build.

## Production Upgrade Path

Before handling real GRC data, move to:

- CloudFront in front of S3.
- AWS WAF for public edge protection.
- Cognito or enterprise SSO for authentication.
- Backend API for graph mutations.
- Server-side evidence storage with S3 Object Lock.
- Structured audit logging.
