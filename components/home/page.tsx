"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Senator Report interface
interface SenatorReport {
  firstName: string;
  lastName: string;
  filerName: string;
  reportLink: string;
  reportDate: string;
}

// House Rep Report interface
interface HouseRepReport {
  name: string;
  office: string;
  filingYear: string;
  filingType: string;
  documentUrl?: string;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

export default function TradingReports() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'senator' | 'house'>('senator');
  
  // Senator state
  const [senatorReports, setSenatorReports] = useState<SenatorReport[]>([]);
  const [senatorFirstName, setSenatorFirstName] = useState(searchParams.get("senatorFirstName") || "");
  const [senatorLastName, setSenatorLastName] = useState(searchParams.get("senatorLastName") || "");
  const [senatorPage, setSenatorPage] = useState(parseInt(searchParams.get("senatorPage") || "1"));
  const [senatorTotalResults, setSenatorTotalResults] = useState(0);
  
  // House Rep state
  const [houseRepReports, setHouseRepReports] = useState<HouseRepReport[]>([]);
  const [houseRepLastName, setHouseRepLastName] = useState(searchParams.get("houseRepLastName") || "");
  const [houseRepFilingYear, setHouseRepFilingYear] = useState(searchParams.get("houseRepFilingYear") || "2025");
  const [houseRepState, setHouseRepState] = useState(searchParams.get("houseRepState") || "");
  const [houseRepDistrict, setHouseRepDistrict] = useState(searchParams.get("houseRepDistrict") || "");
  const [houseRepPage, setHouseRepPage] = useState(parseInt(searchParams.get("houseRepPage") || "1"));
  const [houseRepTotalResults, setHouseRepTotalResults] = useState(0);
  
  // Common state
  const [loading, setLoading] = useState(false);
  const pageSize = 100;

  // Fetch Senator reports
  const fetchSenatorReports = async () => {
    setLoading(true);
    try {
      const start = (senatorPage - 1) * pageSize;
      const response = await fetch("/api/senator-trading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: senatorFirstName,
          lastName: senatorLastName,
          start,
          length: pageSize,
        }),
      });
      
      const data = await response.json();
      setSenatorReports(data);
      // Assuming we get total count from the API response
      setSenatorTotalResults(data.recordsTotal || 0);
    } catch (error) {
      console.error("Error fetching senator reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch House Rep reports
  const fetchHouseRepReports = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/house-rep-trading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lastName: houseRepLastName,
          filingYear: houseRepFilingYear,
          state: houseRepState,
          district: houseRepDistrict,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setHouseRepReports(data.data);
        setHouseRepTotalResults(data.data.length);
      } else {
        console.error("Error in house rep API response:", data.error);
      }
    } catch (error) {
      console.error("Error fetching house rep reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'senator' | 'house') => {
    setActiveTab(tab);
  };

  // Handle Senator search
  const handleSenatorSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSenatorPage(1); // Reset to first page on new search
    fetchSenatorReports();
  };

  // Handle House Rep search
  const handleHouseRepSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHouseRepPage(1); // Reset to first page on new search
    fetchHouseRepReports();
  };

  // Update URL with search params when dependencies change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (activeTab === 'senator') {
      if (senatorFirstName) params.set("senatorFirstName", senatorFirstName);
      if (senatorLastName) params.set("senatorLastName", senatorLastName);
      if (senatorPage > 1) params.set("senatorPage", senatorPage.toString());
    } else {
      if (houseRepLastName) params.set("houseRepLastName", houseRepLastName);
      if (houseRepFilingYear) params.set("houseRepFilingYear", houseRepFilingYear);
      if (houseRepState) params.set("houseRepState", houseRepState);
      if (houseRepDistrict) params.set("houseRepDistrict", houseRepDistrict);
      if (houseRepPage > 1) params.set("houseRepPage", houseRepPage.toString());
    }
    
    params.set("tab", activeTab);
    router.push(`/trading-reports?${params.toString()}`);
  }, [
    activeTab, 
    senatorFirstName, 
    senatorLastName, 
    senatorPage,
    houseRepLastName,
    houseRepFilingYear,
    houseRepState,
    houseRepDistrict,
    houseRepPage
  ]);

  // Fetch data when tab changes or search parameters change
  useEffect(() => {
    if (activeTab === 'senator') {
      fetchSenatorReports();
    } else {
      fetchHouseRepReports();
    }
  }, [activeTab]);

  // Calculate pagination
  const senatorTotalPages = Math.ceil(senatorTotalResults / pageSize);
  const houseRepTotalPages = Math.ceil(houseRepTotalResults / pageSize);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Congressional Trading Reports</h1>
      
      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'senator'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('senator')}
          >
            Senator Reports
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'house'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('house')}
          >
            House Representative Reports
          </button>
        </div>
      </div>
      
      {/* Senator Search Form */}
      {activeTab === 'senator' && (
        <form onSubmit={handleSenatorSearch} className="mb-6 flex gap-4">
          <div>
            <label htmlFor="senatorFirstName" className="block text-sm font-medium mb-1">
              First Name
            </label>
            <input
              type="text"
              id="senatorFirstName"
              value={senatorFirstName}
              onChange={(e) => setSenatorFirstName(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="First Name"
            />
          </div>
          <div>
            <label htmlFor="senatorLastName" className="block text-sm font-medium mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="senatorLastName"
              value={senatorLastName}
              onChange={(e) => setSenatorLastName(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Last Name"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
      )}
      
      {/* House Rep Search Form */}
      {activeTab === 'house' && (
        <form onSubmit={handleHouseRepSearch} className="mb-6 flex gap-4">
          <div>
            <label htmlFor="houseRepLastName" className="block text-sm font-medium mb-1">
              Last Name
            </label>
            <input
              type="text"
              id="houseRepLastName"
              value={houseRepLastName}
              onChange={(e) => setHouseRepLastName(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Last Name"
            />
          </div>
          <div>
            <label htmlFor="houseRepFilingYear" className="block text-sm font-medium mb-1">
              Filing Year
            </label>
            <input
              type="text"
              id="houseRepFilingYear"
              value={houseRepFilingYear}
              onChange={(e) => setHouseRepFilingYear(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Filing Year"
            />
          </div>
          <div>
            <label htmlFor="houseRepState" className="block text-sm font-medium mb-1">
              State
            </label>
            <input
              type="text"
              id="houseRepState"
              value={houseRepState}
              onChange={(e) => setHouseRepState(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="State"
            />
          </div>
          <div>
            <label htmlFor="houseRepDistrict" className="block text-sm font-medium mb-1">
              District
            </label>
            <input
              type="text"
              id="houseRepDistrict"
              value={houseRepDistrict}
              onChange={(e) => setHouseRepDistrict(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="District"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
      )}
      
      {/* Results Table */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          {/* Senator Results Table */}
          {activeTab === 'senator' && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border">First Name</th>
                      <th className="px-4 py-2 border">Last Name</th>
                      <th className="px-4 py-2 border">Filer Name</th>
                      <th className="px-4 py-2 border">Report Date</th>
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {senatorReports.map((report, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{report.firstName}</td>
                        <td className="px-4 py-2 border">{report.lastName}</td>
                        <td className="px-4 py-2 border">{report.filerName}</td>
                        <td className="px-4 py-2 border">{report.reportDate}</td>
                        <td className="px-4 py-2 border">
                          <a
                            href={report.reportLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View Report
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Senator Pagination */}
              {senatorTotalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => setSenatorPage(senatorPage - 1)}
                    disabled={senatorPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {senatorPage} of {senatorTotalPages}
                  </span>
                  <button
                    onClick={() => setSenatorPage(senatorPage + 1)}
                    disabled={senatorPage === senatorTotalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
          
          {/* House Rep Results Table */}
          {activeTab === 'house' && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border">Name</th>
                      <th className="px-4 py-2 border">Office</th>
                      <th className="px-4 py-2 border">Filing Year</th>
                      <th className="px-4 py-2 border">Filing Type</th>
                      <th className="px-4 py-2 border">Status</th>
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {houseRepReports.map((report, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{report.name}</td>
                        <td className="px-4 py-2 border">{report.office}</td>
                        <td className="px-4 py-2 border">{report.filingYear}</td>
                        <td className="px-4 py-2 border">{report.filingType}</td>
                        <td className="px-4 py-2 border">
                          {report.processingStatus ? (
                            <span className={`px-2 py-1 rounded text-xs ${
                              report.processingStatus === 'completed' ? 'bg-green-100 text-green-800' :
                              report.processingStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              report.processingStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {report.processingStatus}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-2 border">
                          {report.documentUrl ? (
                            <a
                              href={report.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              View Report
                            </a>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* House Rep Pagination */}
              {houseRepTotalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => setHouseRepPage(houseRepPage - 1)}
                    disabled={houseRepPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {houseRepPage} of {houseRepTotalPages}
                  </span>
                  <button
                    onClick={() => setHouseRepPage(houseRepPage + 1)}
                    disabled={houseRepPage === houseRepTotalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
} 