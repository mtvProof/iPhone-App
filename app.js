// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js', { scope: './' })
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Prevent default iOS behaviors
document.addEventListener('touchmove', function(event) {
    if (event.scale !== 1) {
        event.preventDefault();
    }
}, { passive: false });

// Add click handlers for cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const featureName = this.querySelector('h3').textContent;
            console.log(`Clicked on: ${featureName}`);
            // Add your custom functionality here
            alert(`You clicked on ${featureName}`);
        });
    });
});

// Handle iOS standalone mode detection
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
}

// Show install prompt for iOS users not in standalone mode
if (isIOS() && !isInStandaloneMode()) {
    console.log('Running on iOS - user can add to home screen');
}

// Log when app is running in standalone mode
if (isInStandaloneMode()) {
    console.log('Running as standalone app');
    document.body.classList.add('standalone');
}
