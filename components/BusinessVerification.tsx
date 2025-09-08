// components/BusinessVerification.tsx
'use client';

import { useState } from 'react';

interface Business {
  place_id: string;
  name: string;
  formatted_address: string;
  rating: number;
  user_ratings_total: number;
  business_status?: string;
  price_level?: number;
  formatted_phone_number?: string | null;
  international_phone_number?: string | null;
}

interface BusinessVerificationProps {
  onVerificationComplete: (business: Business) => void;
  isVerified: boolean;
  verifiedBusiness?: Business | null;
}

export function BusinessVerification({ 
  onVerificationComplete, 
  isVerified, 
  verifiedBusiness 
}: BusinessVerificationProps) {
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async () => {
    if (!businessName.trim() || !city.trim()) {
      setSearchError('Please enter both restaurant name and city');
      return;
    }

    setSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const response = await fetch('/api/search-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          city: city.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.places || []);
        if (data.places.length === 0) {
          setSearchError('No matching restaurants found. Please check the name and zip code spelling');
        } else {
          // Success - restaurants found via Google Maps API
          console.log(`✅ Found ${data.places.length} restaurants via Google Maps API`);
        }
      } else {
        setSearchError(data.message || 'Search failed, please try again later');
      }
    } catch (error) {
      console.error('Business search error:', error);
      setSearchError('Connection error. Please check your internet connection and try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectBusiness = (business: Business) => {
    onVerificationComplete(business);
  };

  if (isVerified && verifiedBusiness) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-900 border border-green-500 rounded-lg">
          <h4 className="text-green-300 font-medium mb-2">✅ Restaurant Information Confirmed</h4>
          <div className="text-sm text-green-200 space-y-1">
            <p><strong>Name:</strong> {verifiedBusiness.name}</p>
            <p><strong>Address:</strong> {verifiedBusiness.formatted_address}</p>
            {verifiedBusiness.rating > 0 && (
              <p><strong>Rating:</strong> {verifiedBusiness.rating}/5.0 ({verifiedBusiness.user_ratings_total} reviews)</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-400">🔍 Search and Claim Your Restaurant</h4>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Restaurant Name *"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="input-base flex-1"
            disabled={searching}
          />
          <input
            type="text"
            placeholder="Zip Code *"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-base w-32"
            disabled={searching}
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={searching || !businessName.trim() || !city.trim()}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            searching || !businessName.trim() || !city.trim()
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {searching ? '🔍 Searching...' : '🔍 Search Restaurant'}
        </button>

        {searchError && (
          <div className="p-3 bg-red-900 border border-red-500 rounded-lg">
            <p className="text-red-300 text-sm">❌ {searchError}</p>
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-400">Found the following restaurants, please select yours:</h5>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {searchResults.map((business) => (
              <div
                key={business.place_id}
                className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-blue-500 cursor-pointer transition-colors"
                onClick={() => handleSelectBusiness(business)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h6 className="font-medium text-white">{business.name}</h6>
                    <p className="text-xs text-gray-400 mt-1">{business.formatted_address}</p>
                    {business.rating > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm text-gray-300 ml-1">
                            {business.rating}/5.0
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({business.user_ratings_total} reviews)
                        </span>
                      </div>
                    )}
                    {business.business_status && business.business_status !== 'OPERATIONAL' && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-orange-900 text-orange-300 rounded">
                        {business.business_status}
                      </span>
                    )}
                  </div>
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>🏪 We use Google Maps to verify that your restaurant is a real operating business entity</p>
        <p>🔍 If you can't find your restaurant, please check the spelling or try different search terms</p>
      </div>
    </div>
  );
}
