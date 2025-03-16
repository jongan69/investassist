import { getHighOpenInterestContracts } from "@/lib/alpaca/fetchHighOpenInterest"

type OptionContract = {
  symbol: string
  name: string
  expiration_date: string
  type: string
  strike_price: string
  open_interest: string
  close_price: string
}

type OpenInterestData = {
  shortTerm?: OptionContract
  leap?: OptionContract
  error?: string | null
}

const keysToDisplay = [
  { key: "name", title: "Contract" },
  { key: "expiration_date", title: "Expiry" },
  { key: "type", title: "Type", format: (type: string) => type.toUpperCase() },
  { key: "strike_price", title: "Strike", format: (price: string) => `$${price}` },
  { key: "open_interest", title: "Open Interest" },
  { key: "close_price", title: "Last Price", format: (price: string) => `$${price}` },
]

export default async function OpenInterest({ ticker }: { ticker: string }) {
  const openInterestData = await getHighOpenInterestContracts(ticker) as OpenInterestData
  
  // Handle API errors first
  if (openInterestData.error) {
    return (
      <div className="text-red-500 p-4 rounded-md bg-red-50">
        {openInterestData.error.includes('Invalid ticker') 
          ? 'Invalid ticker symbol. Please check the stock symbol and try again.' 
          : 'Unable to fetch options data. Please try again later.'}
      </div>
    )
  }

  // Filter out undefined contracts
  const availableContracts = Object.entries(openInterestData)
    .filter(([key]) => key !== 'error')
    .filter(([_, contract]) => contract !== undefined) as [string, OptionContract][]
  
  if (availableContracts.length === 0) {
    return <div>No high open interest contracts available</div>
  }

  return (
    <div className="space-y-6">
      {availableContracts.map(([contractType, contractData]) => (
        <div key={contractType}>
          <h3 className="mb-4 font-semibold">
            {contractType === 'shortTerm' ? 'Short Term' : 'LEAP'} High Open Interest Options
          </h3>
          <div className="grid grid-flow-col grid-rows-6 gap-4 md:grid-rows-3">
            {keysToDisplay.map((item) => {
              const data = contractData?.[item.key as keyof OptionContract]
              let formattedData = data ? 
                (item.format ? item.format(data) : data) : 
                "N/A"

              return (
                <div
                  key={item.key}
                  className="flex flex-row items-center justify-between font-medium"
                >
                  <span className="text-muted-foreground">{item.title}</span>
                  <span>{formattedData}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
