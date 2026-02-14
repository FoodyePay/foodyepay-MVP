import React, { useState, useEffect, useRef } from 'react';
import { Phone, Mic, ShoppingCart, CreditCard, Check, Volume2, Globe, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Zap, TrendingUp, Clock } from 'lucide-react';

const AVOSDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const autoPlayRef = useRef(null);

  // Demo conversation flow
  const conversationSteps = [
    {
      state: 'GREETING',
      speaker: 'AI',
      message: 'Thank you for calling Golden Dragon Restaurant! Would you like to order in English or 中文?',
      timestamp: 0,
      orderItems: []
    },
    {
      state: 'LANGUAGE_SELECTION',
      speaker: 'Customer',
      message: 'English please',
      timestamp: 4,
      orderItems: []
    },
    {
      state: 'LANGUAGE_SELECTION',
      speaker: 'AI',
      message: 'Great! What can I get for you today?',
      timestamp: 6,
      orderItems: []
    },
    {
      state: 'TAKING_ORDER',
      speaker: 'Customer',
      message: "I'd like the Kung Pao Chicken and some fried rice",
      timestamp: 10,
      orderItems: []
    },
    {
      state: 'TAKING_ORDER',
      speaker: 'AI',
      message: 'Kung Pao Chicken - $14.99, and Fried Rice - $4.99. Would you like the chicken mild, medium, or spicy?',
      timestamp: 15,
      orderItems: [
        { name: 'Kung Pao Chicken', price: 14.99, quantity: 1 },
        { name: 'Fried Rice', price: 4.99, quantity: 1 }
      ]
    },
    {
      state: 'ITEM_CUSTOMIZATION',
      speaker: 'Customer',
      message: 'Spicy please. And can I add a wonton soup?',
      timestamp: 21,
      orderItems: [
        { name: 'Kung Pao Chicken (Spicy)', price: 14.99, quantity: 1 },
        { name: 'Fried Rice', price: 4.99, quantity: 1 }
      ]
    },
    {
      state: 'ITEM_CUSTOMIZATION',
      speaker: 'AI',
      message: 'Spicy Kung Pao Chicken, got it! And Wonton Soup - $5.99. Would you like to add a drink? We have Jasmine Tea for $2.50',
      timestamp: 27,
      orderItems: [
        { name: 'Kung Pao Chicken (Spicy)', price: 14.99, quantity: 1 },
        { name: 'Fried Rice', price: 4.99, quantity: 1 },
        { name: 'Wonton Soup', price: 5.99, quantity: 1 }
      ]
    },
    {
      state: 'ITEM_CUSTOMIZATION',
      speaker: 'Customer',
      message: 'Sure, add the tea',
      timestamp: 31,
      orderItems: [
        { name: 'Kung Pao Chicken (Spicy)', price: 14.99, quantity: 1 },
        { name: 'Fried Rice', price: 4.99, quantity: 1 },
        { name: 'Wonton Soup', price: 5.99, quantity: 1 }
      ]
    },
    {
      state: 'ORDER_REVIEW',
      speaker: 'AI',
      message: 'Perfect! Let me review your order: Spicy Kung Pao Chicken $14.99, Fried Rice $4.99, Wonton Soup $5.99, and Jasmine Tea $2.50. Your total is $28.47. Would you like to pay with card or crypto?',
      timestamp: 35,
      orderItems: [
        { name: 'Kung Pao Chicken (Spicy)', price: 14.99, quantity: 1 },
        { name: 'Fried Rice', price: 4.99, quantity: 1 },
        { name: 'Wonton Soup', price: 5.99, quantity: 1 },
        { name: 'Jasmine Tea', price: 2.50, quantity: 1 }
      ]
    },
    {
      state: 'PAYMENT',
      speaker: 'Customer',
      message: 'Crypto please',
      timestamp: 42,
      orderItems: [
        { name: 'Kung Pao Chicken (Spicy)', price: 14.99, quantity: 1 },
        { name: 'Fried Rice', price: 4.99, quantity: 1 },
        { name: 'Wonton Soup', price: 5.99, quantity: 1 },
        { name: 'Jasmine Tea', price: 2.50, quantity: 1 }
      ]
    },
    {
      state: 'PAYMENT',
      speaker: 'AI',
      message: "I'll send a payment link to your phone. You'll receive an SMS with a secure link to pay with USDC on Base. Your order will be ready in about 20 minutes!",
      timestamp: 47,
      orderItems: [
        { name: 'Kung Pao Chicken (Spicy)', price: 14.99, quantity: 1 },
        { name: 'Fried Rice', price: 4.99, quantity: 1 },
        { name: 'Wonton Soup', price: 5.99, quantity: 1 },
        { name: 'Jasmine Tea', price: 2.50, quantity: 1 }
      ],
      showPayment: true
    },
    {
      state: 'CONFIRMATION',
      speaker: 'AI',
      message: 'Thank you for ordering with Golden Dragon! Your order #12847 has been confirmed.',
      timestamp: 55,
      orderItems: [
        { name: 'Kung Pao Chicken (Spicy)', price: 14.99, quantity: 1 },
        { name: 'Fried Rice', price: 4.99, quantity: 1 },
        { name: 'Wonton Soup', price: 5.99, quantity: 1 },
        { name: 'Jasmine Tea', price: 2.50, quantity: 1 }
      ],
      showPayment: true,
      isConfirmed: true
    }
  ];

  const currentConversation = conversationSteps[currentStep];
  const orderItems = currentConversation.orderItems || [];
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // State display mapping
  const stateColors = {
    GREETING: '#FF6B35',
    LANGUAGE_SELECTION: '#FF9F4A',
    TAKING_ORDER: '#00D4FF',
    ITEM_CUSTOMIZATION: '#7C3AED',
    ORDER_REVIEW: '#8B5CF6',
    PAYMENT: '#06B6D4',
    CONFIRMATION: '#10B981'
  };

  // Auto-play logic
  useEffect(() => {
    if (isPlaying) {
      autoPlayRef.current = setTimeout(() => {
        if (currentStep < conversationSteps.length - 1) {
          setCurrentStep(current => current + 1);
        } else {
          setIsPlaying(false);
        }
      }, 2500);
    }
    return () => clearTimeout(autoPlayRef.current);
  }, [isPlaying, currentStep, conversationSteps.length]);

  // Call duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentStep < conversationSteps.length - 1) {
      setCurrentStep(current => current + 1);
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(current => current - 1);
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    setCurrentStep(0);
    setCallDuration(0);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF9F4A] mb-2">
              AVOS
            </div>
            <p className="text-slate-400 text-sm">AI Voice Ordering System • FoodyePay Technology, Inc.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReplay}
              className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
              title="Replay Demo"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-3 rounded-lg bg-[#FF6B35] hover:bg-[#ff5520] transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Phone Call Simulation - Left Side */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
          <div className="h-full flex flex-col">
            {/* Phone Header */}
            <div className="bg-gradient-to-r from-[#1B3A5C] to-slate-800 p-6 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-sm font-semibold">Golden Dragon Restaurant</p>
                    <p className="text-xs text-slate-400">{formatTime(callDuration)}</p>
                  </div>
                </div>
                <Phone className="text-[#FF6B35]" size={24} />
              </div>

              {/* Animated Waveform */}
              {currentConversation.speaker && (
                <div className="flex items-center justify-center gap-1 h-8">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        currentConversation.speaker === 'AI'
                          ? 'bg-gradient-to-t from-[#FF6B35] to-[#FF9F4A]'
                          : 'bg-gradient-to-t from-[#00D4FF] to-[#7C3AED]'
                      }`}
                      style={{
                        height: `${20 + Math.sin(i * 0.5 + Date.now() / 100) * 15}px`,
                        animation: `pulse 0.6s ease-in-out infinite`
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {/* Conversation Transcript */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {conversationSteps.slice(0, currentStep + 1).map((step, idx) => (
                <div
                  key={idx}
                  className={`flex ${step.speaker === 'AI' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg ${
                      step.speaker === 'AI'
                        ? 'bg-slate-700 text-white'
                        : 'bg-gradient-to-r from-[#FF6B35] to-[#FF9F4A] text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{step.message}</p>
                    <p className="text-xs opacity-60 mt-1">{step.speaker}</p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {currentStep < conversationSteps.length - 1 && isPlaying && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 px-4 py-3 rounded-lg flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Dialog State Machine */}
            <div className="bg-slate-900 border-t border-slate-700 p-4">
              <p className="text-xs text-slate-400 mb-3 font-semibold">DIALOG STATE</p>
              <div className="flex items-center gap-2 flex-wrap">
                {['GREETING', 'LANGUAGE_SELECTION', 'TAKING_ORDER', 'ITEM_CUSTOMIZATION', 'ORDER_REVIEW', 'PAYMENT', 'CONFIRMATION'].map((state, idx) => (
                  <div key={state} className="flex items-center gap-2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                        state === currentConversation.state
                          ? `bg-[${stateColors[state]}] text-white shadow-lg scale-110`
                          : idx < conversationSteps.findIndex(s => s.state === currentConversation.state)
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                      style={{
                        backgroundColor: state === currentConversation.state ? stateColors[state] : undefined
                      }}
                    >
                      {state === currentConversation.state && idx < conversationSteps.findIndex(s => s.state === currentConversation.state) ? '✓' : ''} {state.replace('_', ' ')}
                    </div>
                    {idx < 6 && <ChevronRight size={14} className="text-slate-600" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-900 border-t border-slate-700 p-4 flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === conversationSteps.length - 1}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm flex-1 justify-center"
              >
                Next <ChevronRight size={16} />
              </button>
              <div className="text-xs text-slate-400 py-2 px-3 bg-slate-800 rounded-lg">
                {currentStep + 1} / {conversationSteps.length}
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Dashboard - Right Side */}
        <div className="space-y-6">
          {/* Live Order Section */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-[#1B3A5C] to-slate-800 px-6 py-4 border-b border-slate-700 flex items-center gap-3">
              <ShoppingCart className="text-[#FF6B35]" size={24} />
              <div>
                <p className="font-semibold">Live Order Build</p>
                <p className="text-xs text-slate-400">Real-time as conversation progresses</p>
              </div>
            </div>

            <div className="p-6 space-y-3 max-h-64 overflow-y-auto">
              {orderItems.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Waiting for order items...</p>
              ) : (
                orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600 animate-in fade-in slide-in-from-right duration-500"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#FF6B35]">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-slate-400">${item.price.toFixed(2)} ea</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-slate-900 border-t border-slate-700 p-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tax (8%)</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between">
                <span className="font-bold">Total</span>
                <span className={`font-bold text-lg ${total > 0 ? 'text-[#FF6B35]' : 'text-slate-400'}`}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* POS Ticket Preview */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-[#1B3A5C] to-slate-800 px-6 py-4 border-b border-slate-700 flex items-center gap-3">
              <Volume2 className="text-[#FF6B35]" size={24} />
              <div>
                <p className="font-semibold">POS Ticket</p>
                <p className="text-xs text-slate-400">Kitchen print preview</p>
              </div>
            </div>

            <div className="p-6 bg-slate-950 font-mono text-xs space-y-2">
              <div className="border border-slate-600 p-4 space-y-2 bg-slate-900">
                <p className="text-center font-bold text-[#FF6B35]">GOLDEN DRAGON</p>
                <p className="text-center text-slate-400 text-xs">Order #12847</p>
                <div className="border-t border-slate-600 pt-2 space-y-1">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="text-[#FF6B35]">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-600 pt-2 text-right">
                  <p className="font-bold">Est. 20 min</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          {currentConversation.showPayment && (
            <div className={`bg-gradient-to-br rounded-2xl border overflow-hidden shadow-2xl transition-all duration-500 ${
              currentConversation.isConfirmed
                ? 'from-slate-800 to-slate-900 border-green-600'
                : 'from-slate-800 to-slate-900 border-slate-700'
            }`}>
              <div className="bg-gradient-to-r from-[#1B3A5C] to-slate-800 px-6 py-4 border-b border-slate-700 flex items-center gap-3">
                <CreditCard className="text-[#FF6B35]" size={24} />
                <div>
                  <p className="font-semibold">Payment Status</p>
                  <p className="text-xs text-slate-400">Blockchain settlement</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Payment Method</p>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg">
                    <Zap size={16} className="text-[#FF6B35]" />
                    <span className="font-semibold">USDC on Base L2</span>
                  </div>
                </div>

                {!currentConversation.isConfirmed ? (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">Awaiting confirmation...</p>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FF9F4A] rounded-full transition-all duration-1000"
                        style={{ width: isPlaying ? '75%' : '50%' }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-500">
                      <Check size={20} />
                      <p className="font-semibold">Payment Confirmed</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      TxHash: 0x7a9f2e8c...4b1d
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Call Duration', value: formatTime(callDuration), icon: Clock },
          { label: 'Order Accuracy', value: '98.7%', icon: Check },
          { label: 'Language Detected', value: 'English', icon: Globe },
          { label: 'AI Confidence', value: '96.2%', icon: TrendingUp },
          { label: 'Settlement', value: 'Instant (Base)', icon: Zap },
          { label: 'Cost Savings vs CC', value: '$0.47', icon: CreditCard },
          { label: 'Status', value: currentConversation.isConfirmed ? 'Confirmed' : 'Processing', icon: Phone }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-3 text-center hover:border-[#FF6B35] transition-colors"
            >
              <Icon className="mx-auto mb-2 text-[#FF6B35]" size={16} />
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className="font-bold text-sm text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Footer with Partner Badges */}
      <div className="max-w-7xl mx-auto mt-8 border-t border-slate-700 pt-6">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-slate-400">Powered by</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: 'Amazon Nova 2 Sonic', color: 'from-orange-600 to-orange-500' },
              { label: 'Coinbase Blue Carpet', color: 'from-blue-600 to-blue-500' },
              { label: 'Base L2', color: 'from-cyan-600 to-cyan-500' },
              { label: 'Uniswap V4', color: 'from-pink-600 to-pink-500' }
            ].map((badge, idx) => (
              <div
                key={idx}
                className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${badge.color} text-white shadow-lg`}
              >
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default AVOSDemo;
