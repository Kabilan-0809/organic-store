# Font Files for PDF Invoice Generation

This directory contains font files used for PDF invoice generation.

## Required Font File

**Inter-Regular.ttf** - Required for invoice PDF generation

## Quick Setup

### Option 1: Automatic Download (Recommended)
```bash
node scripts/download-font.js
```

### Option 2: Manual Download

1. Visit [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
2. Click "Download family"
3. Extract the ZIP file
4. Copy `Inter-Regular.ttf` from the extracted folder
5. Place it in this directory: `assets/fonts/Inter-Regular.ttf`

### Option 3: Direct Download from GitHub

1. Visit: https://github.com/rsms/inter/releases
2. Download the latest release
3. Extract and find `Inter-Regular.ttf` in the `docs/font-files/` directory
4. Copy to: `assets/fonts/Inter-Regular.ttf`

## Verification

After adding the font file, verify it exists:
```bash
# Windows
Test-Path assets\fonts\Inter-Regular.ttf

# Linux/Mac
test -f assets/fonts/Inter-Regular.ttf
```

## Font License

Inter font is licensed under the SIL Open Font License 1.1.

