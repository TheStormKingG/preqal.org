# Image Conversion Instructions

To convert images to WebP format for better performance:

## Required Tools
- ImageMagick (recommended) or Sharp (Node.js)
- Or use online tools like Squoosh.app

## Images to Convert

### Hero Image (LCP - Largest Contentful Paint)
**Source:** `public/Image1.png`
**Output sizes needed:**
- `public/Image1-640.webp` (640px width)
- `public/Image1-1200.webp` (1200px width)
- `public/Image1-1920.webp` (1920px width)

**Command (ImageMagick):**
```bash
magick public/Image1.png -resize 640x -quality 85 public/Image1-640.webp
magick public/Image1.png -resize 1200x -quality 85 public/Image1-1200.webp
magick public/Image1.png -resize 1920x -quality 85 public/Image1-1920.webp
```

### Logo Image
**Source:** `public/Preqal Logo Sep25-9.png`
**Output:** `public/Preqal Logo Sep25-9.webp`

**Command (ImageMagick):**
```bash
magick "public/Preqal Logo Sep25-9.png" -quality 90 "public/Preqal Logo Sep25-9.webp"
```

## Quality Settings
- Hero images: 85% quality (good balance of size/quality)
- Logo: 90% quality (needs to be crisp)

## Verification
After conversion, verify:
1. WebP files are smaller than originals
2. Visual quality is acceptable
3. Files load correctly in browser

