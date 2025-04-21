import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

// Define the Report interface
interface Report {
  firstName: string;
  lastName: string;
  filerName: string;
  reportLink: string;
  reportDate: string;
}

// Mock layout for fallback when Supabase function fails
const mockSenatorData = {
  recordsTotal: 5,
  recordsFiltered: 5,
  data: [
    []
  ]
};

const transformReportData = (apiResponse: any): Report[] => {
  if (!apiResponse?.data) return [];

  // Check if the data is already in the correct format (from Postman example)
  if (apiResponse.data.length > 0 && typeof apiResponse.data[0] === 'object' && 'firstName' in apiResponse.data[0]) {
    return apiResponse.data;
  }

  // Otherwise, transform the array format
  return apiResponse.data.map((item: string[]) => ({
    firstName: item[0],
    lastName: item[1],
    filerName: item[2],
    reportLink: extractReportLink(item[3]),
    reportDate: item[4],
  }));
};

// Helper function to safely extract href link from the anchor tag string
const extractReportLink = (htmlString: string): string => {
  if (!htmlString) return '';
  const regex = /href="([^"]+)"/;
  const match = htmlString.match(regex);
  return match ? `https://efdsearch.senate.gov${match[1]}` : '';
};

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_API_KEY) {
    console.warn("Missing Supabase configuration, using mock data");
    const transformedData = transformReportData(mockSenatorData);
    return NextResponse.json({
      recordsTotal: mockSenatorData.recordsTotal,
      recordsFiltered: mockSenatorData.recordsFiltered,
      data: transformedData,
      isMockData: true
    });
  }

  try {
    // Parse the request body
    const requestBody = await request.json();
    
    // Format dates to match what the Supabase function expects
    // The Supabase function expects dates in MM/DD/YYYY HH:MM:SS format
    const formatDateForSupabase = (dateString: string) => {
      if (!dateString) return "";
      
      // If it's already in the correct format, return as is
      if (dateString.includes("/")) return dateString;
      
      // Convert YYYY-MM-DD to MM/DD/YYYY
      const parts = dateString.split("-");
      if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}/${parts[0]} 00:00:00`;
      }
      
      return dateString;
    };
    
    // Set default values if not provided
    const body = {
      draw: requestBody.draw || 1,
      start: requestBody.start || 0,
      length: requestBody.length || 100, // 100 is the max
      firstName: requestBody.firstName || "",
      lastName: requestBody.lastName || "",
      dateStart: formatDateForSupabase(requestBody.dateStart) || "12/31/2024 19:00:00",
      dateEnd: formatDateForSupabase(requestBody.dateEnd) || ""
    };

    const url = SUPABASE_URL + "/functions/v1/senate-data-fetcher";
    // console.log("Senator API request:", body);
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_API_KEY}`,
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      console.error("Senator API error:", response.status, response.statusText);
      
      // If we get a 500 error from Supabase, use mock data as fallback
      if (response.status === 500) {
        console.warn("Using mock data as fallback due to Supabase function error");
        const transformedData = transformReportData(mockSenatorData);
        return NextResponse.json({
          recordsTotal: mockSenatorData.recordsTotal,
          recordsFiltered: mockSenatorData.recordsFiltered,
          data: transformedData,
          isMockData: true
        });
      }
      
      return NextResponse.json(
        { error: `API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log("Senator API response data length:", data.data?.length || 0);
    
    if (!data || !data.data) {
      console.error("Invalid senator API response:", data);
      return NextResponse.json(
        { error: "Invalid API response format" },
        { status: 500 }
      );
    }
    
    const transformedData = transformReportData(data);
    console.log("Transformed senator data length:", transformedData.length);
    
    return NextResponse.json({
        recordsTotal: data.recordsTotal || 0,
        recordsFiltered: data.recordsFiltered || 0,
        data: transformedData
    });
  } catch (error) {
    console.error("Error processing senator request:", error);
    
    // Use mock data as fallback in case of any error
    console.warn("Using mock data as fallback due to error");
    const transformedData = transformReportData(mockSenatorData);
    return NextResponse.json({
      recordsTotal: mockSenatorData.recordsTotal,
      recordsFiltered: mockSenatorData.recordsFiltered,
      data: transformedData,
      isMockData: true
    });
  }
}
