importScripts('https://www.gstatic.com/firebasejs/11.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.2.0/firebase-messaging-compat.js');

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const firebaseConfig = {
  apiKey: 'demo',
  authDomain: 'demo.local',
  projectId: 'demo-project',
  storageBucket: 'demo-project.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:demo',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'ChaiPlus';
  const notificationOptions = {
    body: payload.notification?.body || 'Yeni bildirim',
    icon: '/favicon.svg',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
