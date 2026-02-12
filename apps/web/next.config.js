/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Enable react-native-web transpilation
  transpilePackages: [
    'react-native',
    'react-native-web',
    '@moneylife/ui-kit',
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    };
    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];
    return config;
  },
};

module.exports = nextConfig;

// Temporary: ignore type errors for react-native-web compat
// Remove once proper RNW types are set up
nextConfig.typescript = {
  ignoreBuildErrors: true,
};
