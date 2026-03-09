# AWS Bedrock Quick Start Guide

## 🚀 Deploy in 3 Steps (20 minutes total)

### Step 1: Enable Bedrock Model Access (5 minutes)

1. Open AWS Bedrock Console:
   ```powershell
   Start-Process "https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess"
   ```

2. Click "Manage model access"

3. Find and enable:
   - ✅ **Claude 3 Haiku** (anthropic.claude-3-haiku-20240307-v1:0)

4. Click "Save changes"

5. Wait 1-2 minutes for access to be granted

### Step 2: Deploy Lambda (5 minutes)

```powershell
.\deploy-lambda-bedrock.ps1
```

This will:
- Package the updated Lambda function
- Upload to AWS
- Verify deployment

### Step 3: Test Bedrock (5 minutes)

```powershell
.\test-bedrock-agents.ps1
```

**Expected Output**:
```
✅ SUCCESS: Using AWS Bedrock!
AI Provider: bedrock
```

**If you see**:
```
⚠️ WARNING: Fell back to Groq
```

Then check:
1. Model access enabled? (Step 1)
2. IAM policy attached? (already done)
3. CloudWatch logs for errors

### Step 4: Verify CloudWatch (2 minutes)

```powershell
aws logs tail /aws/lambda/kisanmitra-api --since 5m --region us-east-1
```

**Look for**:
```
Bedrock inference successful: { modelId: 'anthropic.claude-3-haiku-20240307-v1:0', usage: {...} }
```

---

## ✅ Success Checklist

- [ ] Claude 3 Haiku enabled in Bedrock console
- [ ] Lambda deployed successfully
- [ ] Test shows `"aiProvider": "bedrock"`
- [ ] CloudWatch shows "Bedrock inference successful"

---

## 💰 Cost Estimate

**Claude 3 Haiku Pricing**:
- Input: $0.00025 per 1K tokens
- Output: $0.00125 per 1K tokens

**Example Costs**:
- 100 agent calls ≈ $0.10
- 1,000 agent calls ≈ $1.00
- 10,000 agent calls ≈ $10.00

**For competition demo**: Expect < $5 total

---

## 🔧 Troubleshooting

### "Access denied to model"
→ Enable Claude 3 Haiku in Bedrock console (Step 1)

### "User is not authorized"
→ IAM policy already attached, check role name:
```powershell
aws iam list-attached-role-policies --role-name kisanmitra-lambda-role
```

### Always falls back to Groq
→ Check CloudWatch logs for detailed error:
```powershell
aws logs tail /aws/lambda/kisanmitra-api --since 10m --region us-east-1
```

---

## 📚 Documentation

- **Full Guide**: `BEDROCK_MIGRATION.md`
- **Lambda Code**: `server/index.mjs` (lines 140-180)
- **Requirements**: `.kiro/specs/agentic-ai-ecosystem/requirements.md`

---

## 🎯 Competition Impact

**Before Bedrock**:
- ❌ Using Groq (not in pitch)
- 🔴 70% competition alignment
- 🔴 HIGH risk with judges

**After Bedrock**:
- ✅ Using AWS Bedrock (as promised)
- 🟢 95% competition alignment
- 🟢 LOW risk with judges

---

## 🎉 You're Ready!

Once all 4 steps show ✅, your system is using AWS Bedrock and is 100% aligned with the competition pitch!
