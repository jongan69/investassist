import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the report URL from the query parameter
    const url = request.nextUrl.searchParams.get("url");
    
    if (!url) {
      return NextResponse.json(
        { error: "Missing report URL parameter" },
        { status: 400 }
      );
    }
    
    // Validate that the URL is from the Senate website
    if (!url.includes("efdsearch.senate.gov")) {
      return NextResponse.json(
        { error: "Invalid report URL" },
        { status: 400 }
      );
    }
    
    // Fetch the report with the proper referer header
    const response = await fetch(url, {
      headers: {
        "Referer": "https://efdsearch.senate.gov/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch report: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the content type from the response
    const contentType = response.headers.get("content-type") || "application/pdf";
    
    // Get the filename from the URL or use a default
    const urlParts = url.split("/");
    const filename = urlParts[urlParts.length - 1] || "senate-report.pdf";
    
    // Create a new response with the report content
    const reportResponse = new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600"
      }
    });
    
    return reportResponse;
  } catch (error) {
    console.error("Error proxying Senate report:", error);
    return NextResponse.json(
      { error: "Failed to proxy Senate report" },
      { status: 500 }
    );
  }
} 