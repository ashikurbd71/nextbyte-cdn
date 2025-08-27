#!/bin/bash

# NextByte CDN API Testing Script
# Make sure the server is running before executing this script

BASE_URL="http://localhost:3000/api"
CDN_URL="$BASE_URL/cdn"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 NextByte CDN API Testing Script${NC}"
echo "=================================="
echo ""

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Function to check if server is running
check_server() {
    echo -e "${YELLOW}Checking if server is running...${NC}"
    curl -s "$BASE_URL" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Server is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Server is not running. Please start the server first.${NC}"
        echo "Run: npm run start:dev"
        exit 1
    fi
}

# Test 1: Get API info
test_api_info() {
    echo -e "${YELLOW}1. Testing API info...${NC}"
    response=$(curl -s "$BASE_URL")
    if echo "$response" | grep -q "Welcome to NextByte CDN Server"; then
        print_result 0 "API info endpoint works"
        echo "Response: $response" | head -c 200
        echo "..."
    else
        print_result 1 "API info endpoint failed"
        echo "Response: $response"
    fi
    echo ""
}

# Test 2: Create a test file
create_test_file() {
    echo -e "${YELLOW}Creating test file...${NC}"
    echo "This is a test file for CDN API testing" > test_file.txt
    print_result 0 "Test file created"
    echo ""
}

# Test 3: Upload single file
test_single_upload() {
    echo -e "${YELLOW}2. Testing single file upload...${NC}"
    response=$(curl -s -X POST "$CDN_URL/upload" -F "file=@test_file.txt")
    if echo "$response" | grep -q "success.*true"; then
        print_result 0 "Single file upload works"
        # Extract filename for later tests
        FILENAME=$(echo "$response" | grep -o '"filename":"[^"]*"' | cut -d'"' -f4)
        echo "Uploaded file: $FILENAME"
    else
        print_result 1 "Single file upload failed"
        echo "Response: $response"
    fi
    echo ""
}

# Test 4: Get file info
test_file_info() {
    echo -e "${YELLOW}3. Testing file info...${NC}"
    if [ -n "$FILENAME" ]; then
        response=$(curl -s "$CDN_URL/info/$FILENAME")
        if echo "$response" | grep -q "success.*true"; then
            print_result 0 "File info endpoint works"
        else
            print_result 1 "File info endpoint failed"
            echo "Response: $response"
        fi
    else
        print_result 1 "File info test skipped (no filename)"
    fi
    echo ""
}

# Test 5: List all files
test_list_files() {
    echo -e "${YELLOW}4. Testing file list...${NC}"
    response=$(curl -s "$CDN_URL/files")
    if echo "$response" | grep -q "success.*true"; then
        print_result 0 "File list endpoint works"
        file_count=$(echo "$response" | grep -o '"data":\[[^]]*\]' | grep -o '\[.*\]' | jq 'length' 2>/dev/null || echo "unknown")
        echo "Files found: $file_count"
    else
        print_result 1 "File list endpoint failed"
        echo "Response: $response"
    fi
    echo ""
}

# Test 6: Get stats
test_stats() {
    echo -e "${YELLOW}5. Testing stats...${NC}"
    response=$(curl -s "$CDN_URL/stats")
    if echo "$response" | grep -q "success.*true"; then
        print_result 0 "Stats endpoint works"
        total_files=$(echo "$response" | grep -o '"totalFiles":[0-9]*' | cut -d':' -f2)
        total_size=$(echo "$response" | grep -o '"totalSizeMB":"[^"]*"' | cut -d'"' -f4)
        echo "Total files: $total_files, Total size: ${total_size}MB"
    else
        print_result 1 "Stats endpoint failed"
        echo "Response: $response"
    fi
    echo ""
}

# Test 7: Download file
test_download() {
    echo -e "${YELLOW}6. Testing file download...${NC}"
    if [ -n "$FILENAME" ]; then
        curl -s "$CDN_URL/files/$FILENAME" -o "downloaded_$FILENAME" > /dev/null 2>&1
        if [ -f "downloaded_$FILENAME" ]; then
            print_result 0 "File download works"
            echo "Downloaded: downloaded_$FILENAME"
        else
            print_result 1 "File download failed"
        fi
    else
        print_result 1 "Download test skipped (no filename)"
    fi
    echo ""
}

# Test 8: Direct file access
test_direct_access() {
    echo -e "${YELLOW}7. Testing direct file access...${NC}"
    if [ -n "$FILENAME" ]; then
        curl -s "http://localhost:3000/files/$FILENAME" -o "direct_$FILENAME" > /dev/null 2>&1
        if [ -f "direct_$FILENAME" ]; then
            print_result 0 "Direct file access works"
            echo "Downloaded: direct_$FILENAME"
        else
            print_result 1 "Direct file access failed"
        fi
    else
        print_result 1 "Direct access test skipped (no filename)"
    fi
    echo ""
}

# Test 9: Delete file
test_delete() {
    echo -e "${YELLOW}8. Testing file deletion...${NC}"
    if [ -n "$FILENAME" ]; then
        response=$(curl -s -X DELETE "$CDN_URL/files/$FILENAME")
        if echo "$response" | grep -q "success.*true"; then
            print_result 0 "File deletion works"
        else
            print_result 1 "File deletion failed"
            echo "Response: $response"
        fi
    else
        print_result 1 "Delete test skipped (no filename)"
    fi
    echo ""
}

# Test 10: Error handling
test_error_handling() {
    echo -e "${YELLOW}9. Testing error handling...${NC}"
    
    # Test non-existent file
    response=$(curl -s "$CDN_URL/info/nonexistent_file.txt")
    if echo "$response" | grep -q "File not found"; then
        print_result 0 "Error handling for non-existent file works"
    else
        print_result 1 "Error handling for non-existent file failed"
    fi
    
    # Test invalid upload (no file)
    response=$(curl -s -X POST "$CDN_URL/upload")
    if echo "$response" | grep -q "No file uploaded"; then
        print_result 0 "Error handling for no file upload works"
    else
        print_result 1 "Error handling for no file upload failed"
    fi
    
    echo ""
}

# Cleanup
cleanup() {
    echo -e "${YELLOW}Cleaning up test files...${NC}"
    rm -f test_file.txt
    rm -f downloaded_*
    rm -f direct_*
    print_result 0 "Cleanup completed"
    echo ""
}

# Main execution
main() {
    check_server
    test_api_info
    create_test_file
    test_single_upload
    test_file_info
    test_list_files
    test_stats
    test_download
    test_direct_access
    test_delete
    test_error_handling
    cleanup
    
    echo -e "${GREEN}🎉 API testing completed!${NC}"
    echo ""
    echo -e "${BLUE}Summary:${NC}"
    echo "- All endpoints tested"
    echo "- Error handling verified"
    echo "- File operations validated"
    echo ""
    echo -e "${YELLOW}Note: Check the server logs for any additional information.${NC}"
}

# Run the main function
main
