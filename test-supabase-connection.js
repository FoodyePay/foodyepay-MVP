// test-supabase-connection.js
// 测试Supabase连接和环境变量

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

console.log('🧪 Testing Supabase Connection...\n');

// 读取环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📊 Environment Variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!');
  console.log('\n🔧 Please check your .env.local file contains:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://sshpxsgbebwmbuohkljv.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here');
  process.exit(1);
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('\n🔍 Expected URL should be: https://sshpxsgbebwmbuohkljv.supabase.co');
console.log('🔍 Actual URL is:', supabaseUrl);

if (supabaseUrl && supabaseUrl.includes('cybaleks')) {
  console.error('❌ WRONG URL DETECTED! Found cybaleks URL instead of supabase.co');
  console.log('🚨 This explains the 404 errors in the browser console!');
} else if (supabaseUrl && supabaseUrl.includes('supabase.co')) {
  console.log('✅ Supabase URL looks correct');
} else {
  console.error('❌ Unexpected Supabase URL format');
}

// 测试连接
async function testConnection() {
  try {
    console.log('\n🔌 Testing connection to Supabase...');
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
    } else {
      console.log('✅ Connection successful!');
      console.log('📊 Sample data:', data);
    }
  } catch (err) {
    console.error('💥 Connection test exception:', err.message);
  }
}

testConnection();
