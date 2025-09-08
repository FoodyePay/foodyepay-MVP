// app/api/search-business/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface SearchBusinessRequest {
  businessName: string;
  city: string;
}

// Mock data function for fallback when Google API is not available
function getMockResults(businessName: string, city: string) {
  const mockData = [
    {
      name: "Fan Szechuan Restaurant & Bar",
      validZips: ["10002"],
      data: {
        place_id: "mock_fan_szechuan_restaurant_&_bar_10002",
        name: "Fan Szechuan Restaurant & Bar",
        formatted_address: "103 Essex St, New York, NY 10002, USA",
        rating: 4.8,
        user_ratings_total: 666,
        business_status: 'OPERATIONAL',
        price_level: 2,
        photos: []
      }
    },
    {
      name: "Zao Men Qian Hot Pot",
      validZips: ["11355"],
      data: {
        place_id: "mock_zao_men_qian_hot_pot_11355",
        name: "Zao Men Qian Hot Pot",
        formatted_address: "46-09 Kissena Blvd, Flushing, NY 11355, USA",
        rating: 4.5,
        user_ratings_total: 460,
        business_status: 'OPERATIONAL',
        price_level: 2,
        photos: []
      }
    },
    {
      name: "Mountain House Flushing",
      validZips: ["11354"],
      data: {
        place_id: "mock_mountain_house_flushing_11354",
        name: "Mountain House Flushing",
        formatted_address: "39-16 Prince St g03, Flushing, NY 11354, USA",
        rating: 4.5,
        user_ratings_total: 1649,
        business_status: 'OPERATIONAL',
        price_level: 2,
        photos: []
      }
    }
  ];

  // Find matching restaurant in mock data
  const matchedRestaurant = mockData.find(restaurant => 
    restaurant.name.toLowerCase().includes(businessName.toLowerCase()) &&
    restaurant.validZips.includes(city)
  );

  return matchedRestaurant ? [matchedRestaurant.data] : [];
}

export async function POST(request: NextRequest) {
  try {
    const { businessName, city }: SearchBusinessRequest = await request.json();

    if (!businessName || !city) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Business name and city are required' 
        },
        { status: 400 }
      );
    }

    console.log('🔍 Searching for business:', businessName, 'in', city);
    
    // Use real Google Maps Places API
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Google Maps API key not found');
      return NextResponse.json(
        { 
          success: false,
          message: 'Google Maps API key not configured' 
        },
        { status: 500 }
      );
    }

    // Search for businesses using Google Places Text Search API
    const searchQuery = `${businessName} ${city}`;
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&type=restaurant&key=${apiKey}`;
    
    console.log('🌐 Making Google Places API call...');
    console.log('🔑 API Key (first 10 chars):', apiKey?.substring(0, 10) + '...');
    console.log('🔍 Search URL:', placesUrl);
    
    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();
    
    console.log('📊 API Response Status:', placesData.status);
    console.log('📄 API Response:', placesData);
    
    if (placesData.status !== 'OK') {
      console.error('❌ Google Places API error:', placesData.status, placesData.error_message);
      
      return NextResponse.json(
        { 
          success: false,
          message: `Google Places API error: ${placesData.status}`,
          api_error: placesData.status,
          error_details: placesData.error_message || 'No additional error details',
          debug_info: {
            api_key_configured: !!apiKey,
            api_key_length: apiKey?.length,
            search_query: searchQuery,
            full_url: placesUrl
          }
        },
        { status: 500 }
      );
    }

    if (!placesData.results || placesData.results.length === 0) {
      console.log('📍 No restaurants found for query:', searchQuery);
      return NextResponse.json({
        success: true,
        results: []
      });
    }

    // Filter results to match both name and zip code
    const filteredResults = placesData.results.filter((place: any) => {
      const addressContainsZip = place.formatted_address && place.formatted_address.includes(city);
      const nameMatches = place.name.toLowerCase().includes(businessName.toLowerCase());
      return nameMatches && addressContainsZip;
    });

    console.log(`✅ Found ${filteredResults.length} matching restaurants`);

    // Transform results to match our expected format and get detailed info including phone numbers
    const transformedResults = [];
    
    for (const place of filteredResults) {
      // Get detailed place information including phone number
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,rating,user_ratings_total,business_status,price_level,formatted_phone_number,international_phone_number&key=${apiKey}`;
      
      try {
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        if (detailsData.status === 'OK' && detailsData.result) {
          const details = detailsData.result;
          transformedResults.push({
            place_id: place.place_id,
            name: details.name || place.name,
            formatted_address: details.formatted_address || place.formatted_address,
            rating: details.rating || place.rating || 0,
            user_ratings_total: details.user_ratings_total || place.user_ratings_total || 0,
            business_status: details.business_status || place.business_status || 'OPERATIONAL',
            price_level: details.price_level || place.price_level || 0,
            formatted_phone_number: details.formatted_phone_number || null,
            international_phone_number: details.international_phone_number || null,
            photos: place.photos || []
          });
        } else {
          // Fallback to basic info if details API fails
          transformedResults.push({
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.formatted_address,
            rating: place.rating || 0,
            user_ratings_total: place.user_ratings_total || 0,
            business_status: place.business_status || 'OPERATIONAL',
            price_level: place.price_level || 0,
            formatted_phone_number: null,
            international_phone_number: null,
            photos: place.photos || []
          });
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
        // Fallback to basic info
        transformedResults.push({
          place_id: place.place_id,
          name: place.name,
          formatted_address: place.formatted_address,
          rating: place.rating || 0,
          user_ratings_total: place.user_ratings_total || 0,
          business_status: place.business_status || 'OPERATIONAL',
          price_level: place.price_level || 0,
          formatted_phone_number: null,
          international_phone_number: null,
          photos: place.photos || []
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      places: transformedResults,
      total_results: transformedResults.length,
      real_data: true,
      message: transformedResults.length > 0 ? 'Restaurants found successfully' : 'No matching restaurants found'
    });

  } catch (error) {
    console.error('❌ Business search error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Business search failed. Please try again.'
    }, { status: 500 });
  }
}
