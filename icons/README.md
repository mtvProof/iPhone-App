# Icon Generation Guide

## Quick Icon Creation

You need to create app icons in multiple sizes. Here are the easiest methods:

### Option 1: Use Online Tools (Recommended)

1. **PWA Asset Generator** (https://github.com/elegantapp/pwa-asset-generator)
   - Automatically generates all required sizes
   - Command: `npx pwa-asset-generator [source-image] icons`

2. **RealFaviconGenerator** (https://realfavicongenerator.net/)
   - Upload one image
   - Download a complete icon package
   - Includes iOS-specific icons

3. **Favicon.io** (https://favicon.io/)
   - Simple and fast
   - Can generate from text, emoji, or image

### Option 2: Manual Creation

If you have a design tool (Photoshop, GIMP, Figma):

**Required sizes:**
- 72x72 → icon-72.png
- 96x96 → icon-96.png
- 128x128 → icon-128.png
- 144x144 → icon-144.png
- 152x152 → icon-152.png (iPad)
- 167x167 → icon-167.png (iPad Pro)
- 180x180 → icon-180.png (iPhone)
- 192x192 → icon-192.png
- 384x384 → icon-384.png
- 512x512 → icon-512.png

### Option 3: Use ImageMagick

If you have ImageMagick installed:

```bash
# Convert a single image to all required sizes
convert source.png -resize 72x72 icons/icon-72.png
convert source.png -resize 96x96 icons/icon-96.png
convert source.png -resize 128x128 icons/icon-128.png
convert source.png -resize 144x144 icons/icon-144.png
convert source.png -resize 152x152 icons/icon-152.png
convert source.png -resize 167x167 icons/icon-167.png
convert source.png -resize 180x180 icons/icon-180.png
convert source.png -resize 192x192 icons/icon-192.png
convert source.png -resize 384x384 icons/icon-384.png
convert source.png -resize 512x512 icons/icon-512.png
```

## Temporary Placeholder

For testing purposes, you can use emoji or simple colored squares as placeholders until you have your final icon design.

## Icon Design Tips

- **Keep it simple**: Icons look best when simple and recognizable
- **Use solid colors**: Avoid gradients that might not scale well
- **Test on device**: Check how it looks on your actual iPhone
- **Square format**: Icons should be square (1:1 aspect ratio)
- **No transparency needed**: iOS adds its own rounded corners and effects
