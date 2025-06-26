# Mobile Code Desktop Builds

## Build Status

### ✅ macOS
- Platform: macOS (ARM64/Intel)
- Status: Available
- File: MobileCode-macOS.dmg
- Size: ~45 MB

### ⏳ Windows
- Platform: Windows 10/11
- Status: Build required on Windows machine
- Expected file: MobileCode-Windows.zip
- Expected size: ~60 MB

To build for Windows:
```bash
# On a Windows machine
cd MobileCode
flutter build windows --release
# Create ZIP from build\windows\x64\runner\Release\
```

### ⏳ Linux
- Platform: Ubuntu 20.04+
- Status: Build required on Linux machine
- Expected file: MobileCode-Linux.tar.gz or .AppImage
- Expected size: ~70 MB

To build for Linux:
```bash
# On a Linux machine
cd MobileCode
flutter build linux --release
# Create tar.gz from build/linux/x64/release/bundle/
```

## How to Add Builds

1. Build on the respective platform
2. Copy the build file to this directory
3. Update the website links in index.html
4. Remove the placeholder files

## Current Files
- README.md - General information
- BUILD_INFO.md - This file
- build-instructions.txt - Detailed build steps