// =========================================================================
// CONNECT & PREP - SERVICE WORKER (sw.js)
// =========================================================================

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installed.');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activated.');
    return self.clients.claim();
});

// Handle incoming background push notifications
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push event received.');

    let data = { title: 'New Notification', body: 'You have a new update.' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'New Notification', body: event.data.text() };
        }
    }

    const options = {
        body: data.body,
        icon: '/assets/mockup.png',
        badge: '/assets/mockup.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/dashboard/notifications'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle clicking on a notification
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked.');
    event.notification.close();

    const targetUrl = event.notification.data?.url || '/dashboard/notifications';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If a window is already open, focus it and navigate to targetUrl
            for (const client of clientList) {
                if (client.url && 'focus' in client) {
                    return client.focus().then(() => {
                        if (client.navigate) {
                            return client.navigate(targetUrl);
                        }
                    });
                }
            }
            // Otherwise, open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});
