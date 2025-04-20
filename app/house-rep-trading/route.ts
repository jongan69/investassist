import { NextResponse } from "next/server";

// Initialize debug logger
interface HouseRepSearchRequest {
  lastName?: string;
  filingYear?: string;
  state?: string;
  district?: string;
}

export async function POST(request: Request) {
  try {
    console.log("POST request received for house-rep-trading");
    const body = await request.json() as HouseRepSearchRequest;
    console.log("Request body:", JSON.stringify(body));
    const thisYear = new Date().getFullYear();
    // Set default values if not provided
    const lastName = body.lastName || "";
    const filingYear = body.filingYear || thisYear.toString();
    const state = body.state || "";
    const district = body.district || "";

    console.log(`Searching for: LastName=${lastName}, FilingYear=${filingYear}, State=${state}, District=${district}`);

    // Create form data for the request
    const formData = new URLSearchParams();
    formData.append("LastName", lastName);
    formData.append("FilingYear", filingYear);
    formData.append("State", state);
    formData.append("District", district);

    // Add CSRF token (this would need to be fetched first in a real implementation)
    formData.append("__RequestVerificationToken", process.env.CLERK_CSFR_TOKEN || "");

    console.log("Making request to House Financial Disclosure website...");

    // Make the request to the House Financial Disclosure website
    const response = await fetch(
      "https://disclosures-clerk.house.gov/FinancialDisclosure/ViewMemberSearchResult",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.json();
    console.log("Response:", responseText);
    return NextResponse.json({
      responseText
    });

  } catch (error) {
    console.error("Error fetching House Representative filings:", error);
    return NextResponse.json(
      {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    );
  }
} 