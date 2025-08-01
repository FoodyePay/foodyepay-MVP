// simple-qr-test.js
console.log('Testing QR Restaurant Info...');

const qrData = {
  "restaurantInfo": {
    "name": "Ken Canton CUISINE INC.",
    "address": "158-30 71st Ave, Flushing, NY 11365",
    "email": "foodyecoind1@gmail.com",
    "phone": "1-718-888-8888"
  },
  "amounts": {
    "subtotal": 10,
    "tax": 0.89,
    "usdc": 10.89
  }
};

console.log('Restaurant Name:', qrData.restaurantInfo?.name || 'MISSING');
console.log('Restaurant Address:', qrData.restaurantInfo?.address || 'MISSING');
console.log('Restaurant Email:', qrData.restaurantInfo?.email || 'MISSING');
console.log('Restaurant Phone:', qrData.restaurantInfo?.phone || 'MISSING');

console.log('\nFormatted Display:');
const displayInfo = `🏪 Restaurant Info:
• Name: ${qrData.restaurantInfo?.name || 'N/A'}
• Address: ${qrData.restaurantInfo?.address || 'N/A'}
• Email: ${qrData.restaurantInfo?.email || 'N/A'}
• Phone: ${qrData.restaurantInfo?.phone || 'N/A'}`;

console.log(displayInfo);
