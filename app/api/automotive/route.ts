import { NextResponse } from 'next/server';

const API_KEY = process.env.CAR_API_KEY;
const BASE_URL = 'https://auto.dev/api/listings';

interface CarListing {
  year: number;
  make: string;
  model: string;
  price: string;
  priceUnformatted: number;
  mileage: string;
  mileageUnformatted: number;
  condition: string;
  city: string;
  state: string;
}

interface PriceIndex {
  totalListings: number;
  averagePrice: number;
  medianPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  averageMileage: number;
  priceByYear: Record<number, {
    count: number;
    averagePrice: number;
    averageMileage: number;
  }>;
  priceByMake: Record<string, {
    count: number;
    averagePrice: number;
    averageMileage: number;
  }>;
  listings: CarListing[];
}

export async function GET(request: Request) {
  try {
    // Get search params from the URL
    const { searchParams } = new URL(request.url);
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('apikey', API_KEY!);
    
    // Add all search parameters from the request
    for (const [key, value] of searchParams.entries()) {
      queryParams.append(key, value);
    }

    // Make the API request
    const response = await fetch(`${BASE_URL}?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Process the listings to create price index
    const listings = data.records.map((record: any) => ({
      year: record.year,
      make: record.make,
      model: record.model,
      price: record.price,
      priceUnformatted: record.priceUnformatted,
      mileage: record.mileage,
      mileageUnformatted: record.mileageUnformatted,
      condition: record.condition,
      city: record.city,
      state: record.state
    }));

    // Calculate statistics
    const prices = listings.map((l: CarListing) => l.priceUnformatted);
    const mileages = listings.map((l: CarListing) => l.mileageUnformatted);
    
    const priceIndex: PriceIndex = {
      totalListings: listings.length,
      averagePrice: Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length),
      medianPrice: prices.sort((a: number, b: number) => a - b)[Math.floor(prices.length / 2)],
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      averageMileage: Math.round(mileages.reduce((a: number, b: number) => a + b, 0) / mileages.length),
      priceByYear: {},
      priceByMake: {},
      listings
    };

    // Calculate price by year
    listings.forEach((listing: CarListing) => {
      if (!priceIndex.priceByYear[listing.year]) {
        priceIndex.priceByYear[listing.year] = {
          count: 0,
          averagePrice: 0,
          averageMileage: 0
        };
      }
      priceIndex.priceByYear[listing.year].count++;
      priceIndex.priceByYear[listing.year].averagePrice += listing.priceUnformatted;
      priceIndex.priceByYear[listing.year].averageMileage += listing.mileageUnformatted;
    });

    // Calculate averages for each year
    Object.keys(priceIndex.priceByYear).forEach(year => {
      const yearData = priceIndex.priceByYear[Number(year)];
      yearData.averagePrice = Math.round(yearData.averagePrice / yearData.count);
      yearData.averageMileage = Math.round(yearData.averageMileage / yearData.count);
    });

    // Calculate price by make
    listings.forEach((listing: CarListing) => {
      if (!priceIndex.priceByMake[listing.make]) {
        priceIndex.priceByMake[listing.make] = {
          count: 0,
          averagePrice: 0,
          averageMileage: 0
        };
      }
      priceIndex.priceByMake[listing.make].count++;
      priceIndex.priceByMake[listing.make].averagePrice += listing.priceUnformatted;
      priceIndex.priceByMake[listing.make].averageMileage += listing.mileageUnformatted;
    });

    // Calculate averages for each make
    Object.keys(priceIndex.priceByMake).forEach(make => {
      const makeData = priceIndex.priceByMake[make];
      makeData.averagePrice = Math.round(makeData.averagePrice / makeData.count);
      makeData.averageMileage = Math.round(makeData.averageMileage / makeData.count);
    });

    return NextResponse.json(priceIndex);
  } catch (error) {
    console.error('Error fetching automotive data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automotive data' },
      { status: 500 }
    );
  }
}
