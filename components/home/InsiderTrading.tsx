'use client';

import { useState, useEffect, useMemo } from 'react';
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
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2
} from 'lucide-react';
import Switch from '@/components/ui/switch';
import Label from '@/components/ui/label';

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
  const fetchData = async () => {
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
  };

  // Fetch data on component mount and when option changes
  useEffect(() => {
    fetchData();
  }, [option]);

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
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
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
        <div className="flex items-center space-x-3">
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
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="mb-6 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticker, owner, or relationship..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Switch 
              checked={compactMode} 
              onCheckedChange={setCompactMode}
              label="Compact Mode"
            />
          </div>
        </div>
        
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
          <div className="rounded-md border">
            <div className={`overflow-y-auto ${expanded ? "max-h-[600px]" : "max-h-[400px]"}`}>
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
        )}
      </CardContent>
    </Card>
  );
} 