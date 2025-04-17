'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  RefreshCw,
  Maximize2,
  Minimize2,
  ExternalLink
} from 'lucide-react';
import Switch from '@/components/ui/switch';

// Define the type for insider trading data
interface InsiderTrade {
  Ticker: string;
  Owner: string;
  Relationship: string;
  Date: string;
  Transaction: string;
  Cost: string;
  Shares: string;
  Value: string;
  Total: string;
  SEC: string;
}

// Define the type for sort configuration
interface SortConfig {
  key: keyof InsiderTrade | null;
  direction: 'asc' | 'desc' | null;
}

export default function InsiderTrading() {
  const [data, setData] = useState<InsiderTrade[]>([]);
  const [filteredData, setFilteredData] = useState<InsiderTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [option, setOption] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null
  });
  const [compactMode, setCompactMode] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // Fetch data from the API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Only include the option parameter if it's not the default "Latest" option
      const url = option === "latest" 
        ? '/api/finviz/insider' 
        : `/api/finviz/insider?option=${option}`;
      
      console.log('Fetching data from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API response data:', result);
      console.log('Data length:', result.length);
      
      setData(result);
      setFilteredData(result);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, [option]);

  // Fetch data on component mount and when option changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter(item => 
        item.Ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Relationship.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('Filtering data with searchTerm:', searchTerm);
      console.log('Filtered data length:', filtered.length);
      setFilteredData(filtered);
    } else {
      console.log('No search term, using full data length:', data.length);
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  // Sort data when sort configuration changes
  const sortedData = useMemo(() => {
    console.log('Sorting data with sortConfig:', sortConfig);
    if (!sortConfig.key) {
      console.log('No sort key, returning unsorted data');
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];
      console.log('Comparing values:', { aValue, bValue });

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc'
        ? aValue < bValue ? -1 : 1
        : aValue > bValue ? -1 : 1;
    });
  }, [filteredData, sortConfig]);

  // Handle sort request
  const requestSort = (key: keyof InsiderTrade) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key: keyof InsiderTrade) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="h-4 w-4" />;
    }
    
    if (sortConfig.direction === 'desc') {
      return <ArrowDown className="h-4 w-4" />;
    }
    
    return <ArrowUpDown className="h-4 w-4" />;
  };

  // Format transaction type with badge
  const formatTransaction = (transaction: string) => {
    let color = 'bg-gray-500';
    
    if (transaction.toLowerCase().includes('buy')) {
      color = 'bg-green-500';
    } else if (transaction.toLowerCase().includes('sale')) {
      color = 'bg-red-500';
    } else if (transaction.toLowerCase().includes('option')) {
      color = 'bg-blue-500';
    } else if (transaction.toLowerCase().includes('proposed')) {
      color = 'bg-yellow-500';
    }
    
    return <Badge className={color}>{transaction}</Badge>;
  };

  // Format date
  const formatDate = (date: string) => {
    // Convert "Apr 09 '25" to "Apr 09, 2025"
    return date.replace(/'(\d{2})/, ', 20$1');
  };

  // Toggle expanded view
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="w-full overflow-hidden mb-8">
      <CardHeader className="flex flex-col space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold">Insider Trading</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleExpanded}
              className="h-8 w-8"
            >
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchData}
            disabled={loading}
            className="ml-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Mobile Controls - Stacked Layout */}
        <div className="flex flex-col gap-3 w-full sm:hidden">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticker, owner, or relationship..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <div className="w-[120px]">
              <Select value={option} onValueChange={setOption}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="latest buys">Latest Buys</SelectItem>
                  <SelectItem value="latest sales">Latest Sales</SelectItem>
                  <SelectItem value="top week">Top Week</SelectItem>
                  <SelectItem value="top week buys">Top Week Buys</SelectItem>
                  <SelectItem value="top week sales">Top Week Sales</SelectItem>
                  <SelectItem value="top owner trade">Top Owner Trade</SelectItem>
                  <SelectItem value="top owner buys">Top Owner Buys</SelectItem>
                  <SelectItem value="top owner sales">Top Owner Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <Switch 
                checked={compactMode} 
                onCheckedChange={setCompactMode}
                label="Compact Mode"
              />
            </div>
          </div>
        </div>
        
        {/* Desktop Controls - Horizontal Layout */}
        <div className="hidden sm:flex sm:flex-row gap-3 w-full">
          <Select value={option} onValueChange={setOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="latest buys">Latest Buys</SelectItem>
              <SelectItem value="latest sales">Latest Sales</SelectItem>
              <SelectItem value="top week">Top Week</SelectItem>
              <SelectItem value="top week buys">Top Week Buys</SelectItem>
              <SelectItem value="top week sales">Top Week Sales</SelectItem>
              <SelectItem value="top owner trade">Top Owner Trade</SelectItem>
              <SelectItem value="top owner buys">Top Owner Buys</SelectItem>
              <SelectItem value="top owner sales">Top Owner Sales</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticker, owner, or relationship..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          
          <div className="flex items-center">
            <Switch 
              checked={compactMode} 
              onCheckedChange={setCompactMode}
              label="Compact Mode"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              {filteredData.length === 0 ? (
                <div className="text-center p-4">
                  No insider trading data found.
                </div>
              ) : (
                <div className={`space-y-4 overflow-y-auto ${expanded ? "max-h-[600px]" : "max-h-[400px]"}`}>
                  {sortedData.map((item, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg font-bold">{item.Ticker}</CardTitle>
                          {formatTransaction(item.Transaction)}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="font-medium">Owner:</div>
                          <div>{item.Owner}</div>
                          
                          <div className="font-medium">Relationship:</div>
                          <div>{item.Relationship}</div>
                          
                          <div className="font-medium">Date:</div>
                          <div>{formatDate(item.Date)}</div>
                          
                          <div className="font-medium">Cost:</div>
                          <div>{item.Cost}</div>
                          
                          <div className="font-medium">Shares:</div>
                          <div>{item.Shares}</div>
                          
                          <div className="font-medium">Value:</div>
                          <div>{item.Value}</div>
                          
                          <div className="font-medium">Total:</div>
                          <div>{item.Total}</div>
                        </div>
                        
                        <div className="mt-3 flex justify-end">
                          <a 
                            href={item.SEC} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                          >
                            View SEC Form <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden sm:block rounded-md border overflow-hidden">
              <div className={`overflow-x-auto ${expanded ? "max-h-[600px]" : "max-h-[400px]"}`}>
                <div className="min-w-[800px]">
                  <Table className={compactMode ? "text-sm" : ""}>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead 
                          className={`cursor-pointer ${compactMode ? "px-3 py-2" : "px-4 py-3"}`}
                          onClick={() => requestSort('Ticker')}
                        >
                          <div className="flex items-center">
                            Ticker {getSortIcon('Ticker')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className={`cursor-pointer ${compactMode ? "px-3 py-2" : "px-4 py-3"}`}
                          onClick={() => requestSort('Owner')}
                        >
                          <div className="flex items-center">
                            Owner {getSortIcon('Owner')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className={`cursor-pointer ${compactMode ? "px-3 py-2" : "px-4 py-3"}`}
                          onClick={() => requestSort('Relationship')}
                        >
                          <div className="flex items-center">
                            Relationship {getSortIcon('Relationship')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className={`cursor-pointer ${compactMode ? "px-3 py-2" : "px-4 py-3"}`}
                          onClick={() => requestSort('Date')}
                        >
                          <div className="flex items-center">
                            Date {getSortIcon('Date')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className={`cursor-pointer ${compactMode ? "px-3 py-2" : "px-4 py-3"}`}
                          onClick={() => requestSort('Transaction')}
                        >
                          <div className="flex items-center">
                            Transaction {getSortIcon('Transaction')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className={`cursor-pointer ${compactMode ? "px-3 py-2" : "px-4 py-3"}`}
                          onClick={() => requestSort('Cost')}
                        >
                          <div className="flex items-center">
                            Cost {getSortIcon('Cost')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className={`cursor-pointer ${compactMode ? "px-3 py-2" : "px-4 py-3"}`}
                          onClick={() => requestSort('Shares')}
                        >
                          <div className="flex items-center">
                            Shares {getSortIcon('Shares')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className={`cursor-pointer ${compactMode ? "px-3 py-2" : "px-4 py-3"}`}
                          onClick={() => requestSort('Value')}
                        >
                          <div className="flex items-center">
                            Value {getSortIcon('Value')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className={`cursor-pointer ${compactMode ? "px-3 py-2" : "px-4 py-3"}`}
                          onClick={() => requestSort('Total')}
                        >
                          <div className="flex items-center">
                            Total {getSortIcon('Total')}
                          </div>
                        </TableHead>
                        <TableHead className={compactMode ? "px-3 py-2" : "px-4 py-3"}>SEC Form 4</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            No insider trading data found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedData.map((item, index) => (
                          <TableRow key={index} className="hover:bg-muted/50">
                            <TableCell className={`font-medium ${compactMode ? "px-3 py-2" : "px-4 py-3"}`}>{item.Ticker}</TableCell>
                            <TableCell className={compactMode ? "px-3 py-2" : "px-4 py-3"}>{item.Owner}</TableCell>
                            <TableCell className={compactMode ? "px-3 py-2" : "px-4 py-3"}>{item.Relationship}</TableCell>
                            <TableCell className={compactMode ? "px-3 py-2" : "px-4 py-3"}>{formatDate(item.Date)}</TableCell>
                            <TableCell className={compactMode ? "px-3 py-2" : "px-4 py-3"}>{formatTransaction(item.Transaction)}</TableCell>
                            <TableCell className={compactMode ? "px-3 py-2" : "px-4 py-3"}>{item.Cost}</TableCell>
                            <TableCell className={compactMode ? "px-3 py-2" : "px-4 py-3"}>{item.Shares}</TableCell>
                            <TableCell className={compactMode ? "px-3 py-2" : "px-4 py-3"}>{item.Value}</TableCell>
                            <TableCell className={compactMode ? "px-3 py-2" : "px-4 py-3"}>{item.Total}</TableCell>
                            <TableCell className={compactMode ? "px-3 py-2" : "px-4 py-3"}>
                              <a 
                                href={item.SEC} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View
                              </a>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 