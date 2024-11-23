import createNextPWA from 'next-pwa';

const withPWA = createNextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // disable: process.env.NODE_ENV === 'development'
});

const config = withPWA({
  // your existing next config
});

export default config;