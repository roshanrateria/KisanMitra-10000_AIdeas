# SageMaker Deployment Fix

## Issue
The SageMaker endpoint was returning a 500 error with the message:
```
"error": "No module named 'pi_heif'"
```

## Root Cause
The `pillow-heif` library (which provides the `pi_heif` module) was missing from the dependencies. This library is required by Pillow to handle HEIF/HEIC image formats, which are commonly used on iOS devices.

## Fix Applied

### 1. Updated `requirements.txt`
Added `pillow-heif` to the Python dependencies:
```
pillow-heif
```

### 2. Updated `Dockerfile`
Added system dependency `libheif-dev` required for pillow-heif:
```dockerfile
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libheif-dev \
    && rm -rf /var/lib/apt/lists/*
```

### 3. Updated `app.py`
Added explicit HEIF support registration with error handling:
```python
try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    print("Warning: pillow-heif not available")
```

## Redeployment Steps

### Option 1: Quick Redeploy (Recommended)
```powershell
cd AI-Disease
.\redeploy.ps1
```

### Option 2: Manual Deployment
```powershell
cd AI-Disease
.\deploy_sagemaker.ps1
```

## Verification

After deployment completes (takes 5-10 minutes), test the endpoint:

```powershell
cd AI-Disease
.\test-endpoint.ps1
```

Or manually check the status:
```powershell
aws sagemaker describe-endpoint --endpoint-name kisanmitra-disease-endpoint
```

## Expected Behavior
- Endpoint status should be "InService"
- Test images should return disease detection results
- No more "No module named 'pi_heif'" errors
- HEIF/HEIC images from iOS devices will now be supported

