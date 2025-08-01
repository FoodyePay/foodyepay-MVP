'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, X } from 'lucide-react';
import Image from 'next/image';

interface QRGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantZipCode?: string;
  restaurantInfo?: {
    name: string;
    address: string;
    email: string;
    phone: string;
    city?: string;
    state?: string;
  };
}

interface TaxCalculation {
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  tax_rate: number;
  zip_code: string;
  state: string;
}

interface FoodyConversion {
  subtotal_usdc: number;
  tax_usdc: number;
  total_usdc: number;
  subtotal_foody: number;
  tax_foody: number;
  total_foody: number;
  exchange_rate: number;
}

export function QRGenerator({ isOpen, onClose, restaurantId, restaurantZipCode, restaurantInfo }: QRGeneratorProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);
  const [foodyConversion, setFoodyConversion] = useState<FoodyConversion | null>(null);

  // 自动计算税费和 FOODY 转换
  useEffect(() => {
    const calculateTaxAndFoody = async () => {
      if (!amount) return;
      
      // 优先使用州代码，否则回滚到ZIP code
      const restaurantState = restaurantInfo?.state;
      if (!restaurantState && !restaurantZipCode) return;
      
      const subtotal = parseFloat(amount);
      if (isNaN(subtotal) || subtotal <= 0) return;

      try {
        // 1. 计算税费 - 优先使用州代码
        const taxPayload = restaurantState 
          ? { amount: subtotal, state: restaurantState }
          : { amount: subtotal, zipCode: restaurantZipCode };
          
        const taxResponse = await fetch('/api/calculate-tax', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taxPayload)
        });

        if (taxResponse.ok) {
          const taxData = await taxResponse.json();
          setTaxCalculation(taxData);

          // 2. 计算 FOODY 转换
          const foodyResponse = await fetch('/api/foody-convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              amount: taxData.total_amount, 
              fromCurrency: 'USDC', 
              toCurrency: 'FOODY' 
            })
          });

          if (foodyResponse.ok) {
            const foodyData = await foodyResponse.json();
            
            // 重新计算详细的 FOODY 分解
            const subtotalFoody = (subtotal * foodyData.exchange_rate);
            const taxFoody = (taxData.tax_amount * foodyData.exchange_rate);
            
            setFoodyConversion({
              subtotal_usdc: subtotal,
              tax_usdc: taxData.tax_amount,
              total_usdc: taxData.total_amount,
              subtotal_foody: Math.round(subtotalFoody * 100) / 100,
              tax_foody: Math.round(taxFoody * 100) / 100,
              total_foody: foodyData.output.amount,
              exchange_rate: foodyData.exchange_rate
            });
          }
        }
      } catch (error) {
        console.error('Tax/FOODY calculation failed:', error);
      }
    };

    // 延迟计算以避免频繁API调用
    const timer = setTimeout(calculateTaxAndFoody, 500);
    return () => clearTimeout(timer);
  }, [amount, restaurantInfo?.state, restaurantZipCode]);

  const generateQR = async () => {
    // 验证必填字段
    if (!amount || !orderId) {
      alert('Please enter both amount and order ID - both are required');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      // 使用含税总额和 FOODY 数量生成 QR 码
      const finalAmount = taxCalculation ? taxCalculation.total_amount : parseFloat(amount) || 0;
      const foodyAmount = foodyConversion ? foodyConversion.total_foody : 0;
      
      // QR码数据格式（包含完整餐厅信息）
      const qrData = JSON.stringify({
        restaurantId,
        restaurantInfo: restaurantInfo || {
          name: 'Restaurant',
          address: 'Address not provided',
          email: 'Email not provided',
          phone: 'Phone not provided',
          city: '',
          state: ''
        },
        orderId: orderId, // 现在是必填，不需要默认值
        amounts: {
          usdc: finalAmount,
          foody: foodyAmount,
          subtotal: taxCalculation?.subtotal || parseFloat(amount) || 0,
          tax: taxCalculation?.tax_amount || 0
        },
        tableNumber: tableNumber || '',
        taxInfo: taxCalculation ? {
          rate: taxCalculation.tax_rate,
          zipCode: taxCalculation.zip_code,
          state: taxCalculation.state
        } : null,
        timestamp: Date.now(),
        paymentCreatedAt: new Date().toISOString()
      });
      
      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrUrl(qrCodeUrl);
    } catch (error) {
      console.error('QR generation failed:', error);
      alert('QR code generation failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    
    const link = document.createElement('a');
    link.download = `foodyepay-qr-${orderId || tableNumber || 'general'}.png`;
    link.href = qrUrl;
    link.click();
  };

  const resetForm = () => {
    setAmount('');
    setOrderId('');
    setTableNumber('');
    setQrUrl('');
    setTaxCalculation(null);
    setFoodyConversion(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Generate Payment QR Code
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount (USDC) *
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#222c4e] focus:border-transparent dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* 税费和 FOODY 计算显示 - 简化版 */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3">
              {taxCalculation && (
                <div>
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Payment
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${taxCalculation.subtotal.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({(taxCalculation.tax_rate * 100).toFixed(3)}%):</span>
                      <span>${taxCalculation.tax_amount.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total:</span>
                      <span>${taxCalculation.total_amount.toFixed(2)} USDC</span>
                    </div>
                  </div>
                </div>
              )}

              {foodyConversion && (
                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Image src="/foody.png" alt="FOODY" width={16} height={16} />
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      FOODY Equivalent
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{foodyConversion.subtotal_foody.toLocaleString()} FOODY</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{foodyConversion.tax_foody.toLocaleString()} FOODY</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total:</span>
                      <span className="text-purple-600 dark:text-purple-400">
                        {foodyConversion.total_foody.toLocaleString()} FOODY
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Rate: 1 USDC = {foodyConversion.exchange_rate.toLocaleString()} FOODY
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order ID *
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="ord-8888"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#222c4e] focus:border-transparent dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Table Number (Optional)
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Table 1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#222c4e] focus:border-transparent dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <button
            onClick={generateQR}
            disabled={loading || !amount || !orderId}
            className="w-full bg-[#222c4e] hover:bg-[#454b80] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </div>

        {/* QR Code Display */}
        {qrUrl && (
          <div className="text-center space-y-4">
            <div className="bg-white p-4 rounded-lg inline-block">
              <Image 
                src={qrUrl} 
                alt="Payment QR Code" 
                width={256}
                height={256}
                className="mx-auto"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={downloadQR}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={18} />
                <span>Download</span>
              </button>
              
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Generate New
              </button>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded max-h-20 overflow-y-auto">
              <p className="font-mono break-all">
                QR includes: ${taxCalculation?.total_amount.toFixed(2) || amount} USDC = {foodyConversion?.total_foody.toLocaleString() || '0'} FOODY
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
