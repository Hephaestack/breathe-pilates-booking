import withPWA from 'next-pwa';

const withPwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV !== 'production',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  ...withPwaConfig,
};

export default nextConfig;
