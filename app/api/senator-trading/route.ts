import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

const transformReportData = (apiResponse: any): Report[] => {
    if (!apiResponse?.data) return [];
  
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
    const regex = /href="([^"]+)"/;
    const match = htmlString.match(regex);
    return match ? `https://efdsearch.senate.gov${match[1]}` : '';
  };

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_API_KEY) {
    return NextResponse.json(
      { error: "Missing Supabase configuration" },
      { status: 500 }
    );
  }

  try {
    // Parse the request body
    const requestBody = await request.json();
    
    // Set default values if not provided
    const body = {
      draw: requestBody.draw || 1,
      start: requestBody.start || 0,
      length: requestBody.length || 100, // 100 is the max
      firstName: requestBody.firstName || "",
      lastName: requestBody.lastName || "",
      dateStart: requestBody.dateStart || "12/31/2011 19:00:00",
      dateEnd: requestBody.dateEnd || ""
    };

    const url = SUPABASE_URL + "/functions/v1/senate-data-fetcher";
    console.log(url);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_API_KEY}`,
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    console.log(data.data.length);
    const transformedData = transformReportData(data);
    // console.log(transformedData);
    return NextResponse.json({
        recordsTotal: data.recordsTotal,
        recordsFiltered: data.recordsFiltered,
        data: transformedData
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
