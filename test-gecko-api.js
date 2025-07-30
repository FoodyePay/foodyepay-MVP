// test-gecko-api.js
// 测试 GeckoTerminal API 的 24h 变化数据

async function testGeckoAPI() {
  try {
    console.log('🦎 Testing GeckoTerminal API for 24h change...');
    
    const response = await fetch(
      'https://api.geckoterminal.com/api/v2/networks/base/pools/0xfd25915646ba7677de6079320b1a4975a450891d/ohlcv/day?aggregate=1&limit=2'
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.data && data.data.attributes && data.data.attributes.ohlcv_list.length >= 2) {
      const ohlcvList = data.data.attributes.ohlcv_list;
      
      // 最新价格 (今天的收盘价)
      const latestPrice = parseFloat(ohlcvList[0][4]);
      // 24小时前的价格 (昨天的收盘价)
      const price24hAgo = parseFloat(ohlcvList[1][4]);
      
      // 计算24h价格变化百分比
      const priceChange = ((latestPrice - price24hAgo) / price24hAgo) * 100;
      
      console.log('✅ API Test Results:');
      console.log('Current Price:', latestPrice);
      console.log('Price 24h Ago:', price24hAgo);
      console.log('24h Change:', priceChange.toFixed(2) + '%');
      
      return {
        success: true,
        currentPrice: latestPrice,
        change24h: priceChange
      };
    } else {
      console.log('⚠️ Insufficient data, only got:', data.data?.attributes?.ohlcv_list?.length, 'days');
      return { success: false, reason: 'Insufficient data' };
    }
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    return { success: false, error: error.message };
  }
}

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testGeckoAPI();
}
