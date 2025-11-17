# My iPhone App

A Progressive Web App (PWA) optimized for iPhone that can be added to the home screen for an app-like experience.

## Features

- **iPhone Optimized**: Designed specifically for iOS devices
- **Add to Home Screen**: Can be installed as a standalone app
- **Offline Support**: Service worker enables offline functionality
- **iOS-Specific Meta Tags**: Proper support for iOS status bar and splash screens
- **Responsive Design**: Adapts to different screen sizes
- **Dark Theme**: Modern dark interface matching iOS aesthetics

## Installation on iPhone

1. Open Safari on your iPhone
2. Navigate to your website URL
3. Tap the Share button (square with arrow pointing up)
4. Scroll down and tap "Add to Home Screen"
5. Give it a name and tap "Add"
6. The app icon will appear on your home screen

## Files Structure

```
├── index.html          # Main HTML file
├── styles.css          # Styling with iOS design patterns
├── app.js              # JavaScript functionality
├── manifest.json       # PWA manifest file
├── service-worker.js   # Service worker for offline support
├── icons/              # App icons (need to be created)
└── README.md           # This file
```

## Creating Icons

You need to create icons in the `icons/` directory with the following sizes:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 167x167, 180x180 (for different iPhone models)
- 192x192, 384x384, 512x512 (for Android compatibility)

You can use tools like:
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)

## Deployment

### GitHub Pages

1. Push this code to your GitHub repository
2. Go to Settings → Pages
3. Select the branch (usually `main`) and root folder
4. Your site will be available at `https://yourusername.github.io/repository-name`

### Other Hosting Options

- **Netlify**: Drag and drop your folder
- **Vercel**: Connect your GitHub repo
- **Firebase Hosting**: Use Firebase CLI

## Customization

- Edit `index.html` to change content and structure
- Modify `styles.css` to adjust colors and styling
- Update `manifest.json` with your app name and details
- Add functionality in `app.js`

## Browser Support

- Safari (iOS 11.3+)
- Chrome (Android)
- Edge
- Firefox

## License

MIT License - Feel free to use and modify as needed.
