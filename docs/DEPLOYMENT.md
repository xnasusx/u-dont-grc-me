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

### Snapshot drift

`server/lambda.js` seeds DynamoDB with
`ConditionExpression: attribute_not_exists(pk) AND attribute_not_exists(sk)`, so it
writes the bundled snapshot **only when the table has no item**. Once the row exists it
is returned unchanged forever, and redeploying the function with a newer bundle does not
update it.

That is how the hosted snapshot fell behind the schema far enough to blank the deployed
site: it predated the FAIR persistence work and had no `fairScenarios`, which
`src/App.tsx` reads directly. The client now normalizes missing collections
(`normalizeSnapshot` in `src/governanceApi.ts`), so drift degrades to empty panels
rather than a crash, but the data still has to be pushed deliberately.

`npm run push:snapshot` overwrites the item unconditionally. Add `-- --dry-run` to
compare local and remote without writing.

### Automated snapshot refresh (GitHub OIDC)

`.github/workflows/refresh-snapshot.yml` regenerates and pushes the snapshot whenever
anything that shapes it changes on `main`. It uses short-lived OIDC role assumption, so
there are no AWS keys in the repository or in Actions secrets. The job also fails if
`server/governance-seed-snapshot.json` is stale in git, since the Lambda bundles that
file.

Both files in `infra/` carry an `<AWS_ACCOUNT_ID>` placeholder and contain no comments,
because IAM rejects a policy document with any top-level key other than `Version`, `Id`,
and `Statement`. Render them to a temporary copy rather than editing in place, so the
account ID stays out of git.

One-time setup, all in your own account:

1. Register the GitHub OIDC provider, if the account does not already have one:

   ```bash
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --client-id-list sts.amazonaws.com
   ```

2. Create the role, substituting your account ID into both policy files:

   ```bash
   aws iam create-role --role-name grc-snapshot-push \
     --assume-role-policy-document file://infra/snapshot-push-trust-policy.json

   aws iam put-role-policy --role-name grc-snapshot-push \
     --policy-name grc-snapshot-push --policy-document file://infra/snapshot-push-policy.json
   ```

   The trust policy pins `sub` to
   `repo:xnasusx@14799095/u-dont-grc-me@1322080391:ref:refs/heads/main`, so no other
   branch, fork, or pull request can assume it. The permission policy grants only
   `GetItem` and `PutItem` on the one table.

   Note the `@<id>` segments. GitHub now issues **immutable** subject claims carrying the
   numeric owner and repository IDs, so renaming or transferring the repo cannot silently
   carry the AWS trust with it. Nearly every published example still shows the older
   `repo:owner/name:ref:...` form, which fails with
   `Not authorized to perform sts:AssumeRoleWithWebIdentity` and no indication of why. If
   you fork this into a differently-named repo, read the real claim out of CloudTrail
   rather than guessing:

   ```bash
   aws cloudtrail lookup-events \
     --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRoleWithWebIdentity \
     --max-results 1 --query 'Events[0].CloudTrailEvent' --output text
   ```

   The rejected `sub` appears in `userIdentity.userName`.

3. Publish the role ARN as a **repository variable** named `AWS_SNAPSHOT_ROLE_ARN`
   (Settings > Secrets and variables > Actions > Variables). It is a variable rather than
   a secret because a role ARN is not sensitive on its own and is useless without a
   matching trust policy. The workflow skips itself until the variable exists.

4. Verify with a no-write run: Actions > Refresh hosted governance snapshot > Run
   workflow, with **Compare local and remote without writing** ticked. It prints both
   collection counts so you can confirm the drift before correcting it.

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
