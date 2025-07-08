/** @type {import('next').NextConfig} */
const nextConfig = {
    // Silence warnings
    // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
    webpack: (config, { webpack }) => {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
      
      // Completely ignore HeartbeatWorker from @coinbase/wallet-sdk to prevent module issues
      config.plugins.push(new webpack.IgnorePlugin({
        resourceRegExp: /HeartbeatWorker\.js$/,
        contextRegExp: /@coinbase\/wallet-sdk/,
      }));
      
      // Additional rule to exclude HeartbeatWorker files from processing
      config.module.rules.push({
        test: /HeartbeatWorker\.js$/,
        use: 'null-loader'
      });
      
      return config;
    },
  };
  
  export default nextConfig;
  