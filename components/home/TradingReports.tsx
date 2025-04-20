"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Search, ChevronLeft, ChevronRight, FileText, ExternalLink, Loader2 } from "lucide-react";

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
  const [senatorDateStart, setSenatorDateStart] = useState(searchParams.get("senatorDateStart") || "2024-01-01");
  const [senatorDateEnd, setSenatorDateEnd] = useState(searchParams.get("senatorDateEnd") || "2024-12-31");
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
      
      // Format dates for API request
      // The API will handle the conversion, but we'll log the original values
      console.log("Fetching senator reports with params:", {
        firstName: senatorFirstName,
        lastName: senatorLastName,
        start,
        length: pageSize,
        dateStart: senatorDateStart,
        dateEnd: senatorDateEnd,
      });
      
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
          dateStart: senatorDateStart,
          dateEnd: senatorDateEnd,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Senator API response:", data);
      
      // Handle the specific response structure
      if (data && typeof data === 'object') {
        const reports = Array.isArray(data.data) ? data.data : [];
        console.log("Processed senator reports:", reports);
        setSenatorReports(reports);
        setSenatorTotalResults(data.recordsTotal || 0);
      } else {
        console.error("Invalid senator API response format:", data);
        setSenatorReports([]);
        setSenatorTotalResults(0);
      }
    } catch (error) {
      console.error("Error fetching senator reports:", error);
      setSenatorReports([]);
      setSenatorTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch House Rep reports
  const fetchHouseRepReports = async () => {
    setLoading(true);
    try {
      console.log("Fetching house rep reports with params:", {
        lastName: houseRepLastName,
        filingYear: houseRepFilingYear,
        state: houseRepState,
        district: houseRepDistrict,
        page: houseRepPage
      });
      
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
          page: houseRepPage,
          pageSize: pageSize
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("House rep API response:", data);
      
      if (data.success) {
        setHouseRepReports(data.data);
        setHouseRepTotalResults(data.totalResults || data.data.length);
      } else {
        console.error("Error in house rep API response:", data.error);
        setHouseRepReports([]);
        setHouseRepTotalResults(0);
      }
    } catch (error) {
      console.error("Error fetching house rep reports:", error);
      setHouseRepReports([]);
      setHouseRepTotalResults(0);
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
      if (senatorDateStart) params.set("senatorDateStart", senatorDateStart);
      if (senatorDateEnd) params.set("senatorDateEnd", senatorDateEnd);
      if (senatorPage > 1) params.set("senatorPage", senatorPage.toString());
    } else {
      if (houseRepLastName) params.set("houseRepLastName", houseRepLastName);
      if (houseRepFilingYear) params.set("houseRepFilingYear", houseRepFilingYear);
      if (houseRepState) params.set("houseRepState", houseRepState);
      if (houseRepDistrict) params.set("houseRepDistrict", houseRepDistrict);
      if (houseRepPage > 1) params.set("houseRepPage", houseRepPage.toString());
    }
    
    params.set("tab", activeTab);
    // Update the URL without navigating to a new page
    router.push(`?${params.toString()}`, { scroll: false });
  }, [
    activeTab, 
    senatorFirstName, 
    senatorLastName, 
    senatorDateStart,
    senatorDateEnd,
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

  // Add a separate useEffect for pagination changes
  useEffect(() => {
    if (activeTab === 'senator') {
      fetchSenatorReports();
    }
  }, [senatorPage]);

  useEffect(() => {
    if (activeTab === 'house') {
      fetchHouseRepReports();
    }
  }, [houseRepPage]);

  // Calculate pagination
  const senatorTotalPages = Math.ceil(senatorTotalResults / pageSize);
  const houseRepTotalPages = Math.ceil(houseRepTotalResults / pageSize);

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="bg-card rounded-xl shadow-lg backdrop-blur-sm bg-opacity-95 transition-all duration-300 hover:shadow-xl">
        {/* Fixed Search Section */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2 mb-4">
            <button
              className={`py-2 px-4 font-medium transition-all duration-300 rounded-lg text-sm ${
                activeTab === 'senator'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => handleTabChange('senator')}
            >
              Senator Reports
            </button>
            <button
              className={`py-2 px-4 font-medium transition-all duration-300 rounded-lg text-sm ${
                activeTab === 'house'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => handleTabChange('house')}
            >
              House Representative Reports
            </button>
          </div>

          {activeTab === 'senator' && (
            <form onSubmit={handleSenatorSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 rounded-lg bg-muted/30">
              <div className="space-y-1">
                <label htmlFor="senatorFirstName" className="text-sm font-medium text-foreground">
                  First Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    id="senatorFirstName"
                    value={senatorFirstName}
                    onChange={(e) => setSenatorFirstName(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-300 group-hover:border-primary/50"
                    placeholder="First Name"
                  />
                  <Search className="absolute left-3 top-2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="senatorLastName" className="text-sm font-medium text-foreground">
                  Last Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="senatorLastName"
                    value={senatorLastName}
                    onChange={(e) => setSenatorLastName(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Last Name"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="senatorDateStart" className="text-sm font-medium text-foreground">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="senatorDateStart"
                    value={senatorDateStart}
                    onChange={(e) => setSenatorDateStart(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="senatorDateEnd" className="text-sm font-medium text-foreground">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="senatorDateEnd"
                    value={senatorDateEnd}
                    onChange={(e) => setSenatorDateEnd(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'house' && (
            <form onSubmit={handleHouseRepSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 rounded-lg bg-muted/30">
              <div className="space-y-1">
                <label htmlFor="houseRepLastName" className="text-sm font-medium text-foreground">
                  Last Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="houseRepLastName"
                    value={houseRepLastName}
                    onChange={(e) => setHouseRepLastName(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Last Name"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="houseRepFilingYear" className="text-sm font-medium text-foreground">
                  Filing Year
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="houseRepFilingYear"
                    value={houseRepFilingYear}
                    onChange={(e) => setHouseRepFilingYear(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Filing Year"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="houseRepState" className="text-sm font-medium text-foreground">
                  State
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="houseRepState"
                    value={houseRepState}
                    onChange={(e) => setHouseRepState(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="State"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="houseRepDistrict" className="text-sm font-medium text-foreground">
                  District
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="houseRepDistrict"
                    value={houseRepDistrict}
                    onChange={(e) => setHouseRepDistrict(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="District"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Scrollable Results Section */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                {activeTab === 'senator' ? 'Senator Reports' : 'House Representative Reports'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'senator' 
                  ? `${senatorTotalResults} reports found`
                  : `${houseRepTotalResults} reports found`
                }
              </p>
            </div>

            {/* Results Table */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <p className="text-sm">Loading reports...</p>
              </div>
            ) : (
              <>
                {/* Senator Results Table */}
                {activeTab === 'senator' && (
                  <>
                    <div className="overflow-x-auto rounded-lg border border-border bg-card/50 backdrop-blur-sm">
                      <table className="min-w-full divide-y divide-border">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">First Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Filer Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Report Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                          {senatorReports.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                No senator reports found. Try adjusting your search criteria.
                              </td>
                            </tr>
                          ) : (
                            senatorReports.map((report, index) => (
                              <tr key={index} className="hover:bg-muted/50 transition-colors duration-200">
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-foreground">{report.firstName}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-foreground">{report.lastName}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-foreground">{report.filerName}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-foreground">{report.reportDate}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  <a
                                    href={`/api/senate-report-proxy?url=${encodeURIComponent(report.reportLink)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 inline-flex items-center gap-2 transition-all duration-300 hover:gap-3"
                                  >
                                    <FileText className="h-4 w-4" />
                                    <span>View Report</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Senator Pagination */}
                    {senatorTotalPages > 1 && (
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => setSenatorPage(senatorPage - 1)}
                          disabled={senatorPage === 1}
                          className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md flex items-center gap-2 text-sm"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>Previous</span>
                        </button>
                        <span className="px-3 py-1.5 text-muted-foreground bg-muted/30 rounded-lg text-sm">
                          Page {senatorPage} of {senatorTotalPages}
                        </span>
                        <button
                          onClick={() => setSenatorPage(senatorPage + 1)}
                          disabled={senatorPage === senatorTotalPages}
                          className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md flex items-center gap-2 text-sm"
                        >
                          <span>Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                {/* House Rep Results Table */}
                {activeTab === 'house' && (
                  <>
                    <div className="overflow-x-auto rounded-lg border border-border bg-card/50 backdrop-blur-sm">
                      <table className="min-w-full divide-y divide-border">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Office</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Filing Year</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Filing Type</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                          {houseRepReports.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                No house representative reports found. Try adjusting your search criteria.
                              </td>
                            </tr>
                          ) : (
                            houseRepReports.map((report, index) => (
                              <tr key={index} className="hover:bg-muted/50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{report.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{report.office}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{report.filingYear}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{report.filingType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {report.processingStatus ? (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      report.processingStatus === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                      report.processingStatus === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                      report.processingStatus === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                      {report.processingStatus}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {report.documentUrl ? (
                                    <a
                                      href={report.documentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:text-primary/80 inline-flex items-center gap-2 transition-all duration-300 hover:gap-3"
                                    >
                                      <FileText className="h-4 w-4" />
                                      <span>View Report</span>
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  ) : '-'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* House Rep Pagination */}
                    {houseRepTotalPages > 1 && (
                      <div className="mt-8 flex justify-center gap-4">
                        <button
                          onClick={() => setHouseRepPage(houseRepPage - 1)}
                          disabled={houseRepPage === 1}
                          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md flex items-center gap-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>Previous</span>
                        </button>
                        <span className="px-4 py-2 text-muted-foreground bg-muted/30 rounded-lg">
                          Page {houseRepPage} of {houseRepTotalPages}
                        </span>
                        <button
                          onClick={() => setHouseRepPage(houseRepPage + 1)}
                          disabled={houseRepPage === houseRepTotalPages}
                          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md flex items-center gap-2"
                        >
                          <span>Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 