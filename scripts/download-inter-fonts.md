# Download Inter Font Files

## Instructions

To complete the self-hosting setup, download Inter font files in WOFF2 format.

### Option 1: Using google-webfonts-helper (Recommended)

1. Visit: https://gwfh.mranftl.com/fonts/inter
2. Select weights: **300, 400, 500, 600, 700**
3. Select style: **Regular** (normal) only
4. Select subset: **Latin** (or Latin Extended if needed)
5. Copy the CSS and download the files
6. Place the WOFF2 files in `public/fonts/inter/` with these exact names:
   - `Inter-300.woff2`
   - `Inter-400.woff2`
   - `Inter-500.woff2`
   - `Inter-600.woff2`
   - `Inter-700.woff2`

### Option 2: Using Google Fonts Directly

1. Visit: https://fonts.google.com/specimen/Inter
2. Click "Download family"
3. Extract the ZIP file
4. Navigate to `static` folder
5. Copy WOFF2 files to `public/fonts/inter/`:
   - `Inter-Light.woff2` → rename to `Inter-300.woff2`
   - `Inter-Regular.woff2` → rename to `Inter-400.woff2`
   - `Inter-Medium.woff2` → rename to `Inter-500.woff2`
   - `Inter-SemiBold.woff2` → rename to `Inter-600.woff2`
   - `Inter-Bold.woff2` → rename to `Inter-700.woff2`

### Option 3: Using npm package (if preferred)

```bash
npm install --save-dev @fontsource/inter
# Then copy from node_modules/@fontsource/inter/files/inter-*.woff2
```

## Verification

After adding font files, verify:
1. Files exist in `public/fonts/inter/`
2. Build passes: `npm run build`
3. No console errors
4. Typography looks correct
5. No network requests to fonts.googleapis.com

## File Structure

```
public/
  fonts/
    inter/
      Inter-300.woff2
      Inter-400.woff2
      Inter-500.woff2
      Inter-600.woff2
      Inter-700.woff2
```

