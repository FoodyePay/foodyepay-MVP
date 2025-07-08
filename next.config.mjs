/** @type {import('next').NextConfig} */
const nextConfig = {
    // Silence warnings
    // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
    webpack: (config, { webpack }) => {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
      
      // Completely ignore HeartbeatWorker.js from webpack processing
      config.plugins.push(new webpack.IgnorePlugin({
        resourceRegExp: /HeartbeatWorker\.js$/,
      }));
      
      return config;
    },
  };
  
  export default nextConfig;
  