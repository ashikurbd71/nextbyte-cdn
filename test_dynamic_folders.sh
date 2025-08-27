#!/bin/bash

echo "Testing NextByte CDN Dynamic Folder Structure"
echo "============================================="

BASE_URL="http://localhost:8000"

echo ""
echo "1. Testing file upload (should create folders automatically)..."
echo "Uploading a test image..."
curl -X POST \
  -F "file=@test_upload.txt" \
  "${BASE_URL}/api/cdn/upload" \
  -H "Content-Type: multipart/form-data"

echo ""
echo ""
echo "2. Getting categories..."
curl -X GET "${BASE_URL}/api/cdn/categories"

echo ""
echo ""
echo "3. Getting all files..."
curl -X GET "${BASE_URL}/api/cdn/files"

echo ""
echo ""
echo "4. Getting stats with category breakdown..."
curl -X GET "${BASE_URL}/api/cdn/stats"

echo ""
echo ""
echo "5. Testing category-specific file listing..."
curl -X GET "${BASE_URL}/api/cdn/categories/documents"

echo ""
echo ""
echo "Test completed!"
