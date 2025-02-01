import yahooFinance from "yahoo-finance2"
import { Card, CardContent } from "../../../../components/ui/card"
import ReadMoreText from "../../../../components/ui/read-more-text"
import Link from "next/link"

export default async function CompanySummaryCard({
  ticker,
}: {
  ticker: string
}) {
  const data = await yahooFinance.quoteSummary(ticker, {
    modules: ["summaryProfile"],
  })
  console.log(data)
  if (!data.summaryProfile) {
    return null
  }
  const {
    longBusinessSummary,
    description,
    sector,
    industryDisp,
    country,
    fullTimeEmployees,
    website,
    twitter,
  } = data.summaryProfile

  return (
    <Card className="group relative min-h-max overflow-hidden">
      <div className="absolute z-0 h-full w-full bg-gradient-to-t from-neutral-50 via-neutral-200 to-neutral-50 bg-size-200 bg-pos-0 blur-2xl transition-all duration-500 group-hover:bg-pos-100 dark:from-black dark:via-blue-950 dark:to-black" />

      <CardContent className="z-50 flex h-full w-full flex-col items-start justify-center gap-6 py-10 text-sm lg:flex-row">
        <div className="z-50 max-w-2xl text-pretty font-medium">
          <ReadMoreText text={longBusinessSummary ?? description ?? ""} truncateLength={500} />
        </div>
        {(sector || industryDisp || country || fullTimeEmployees || website || twitter) && (
          <div className="z-50 min-w-fit font-medium text-muted-foreground">
            {sector && (
              <div>
                Sector: <span className="text-foreground ">{sector}</span>
              </div>
            )}
            {industryDisp && (
              <div>
                Industry: <span className="text-foreground ">{industryDisp}</span>
              </div>
            )}
            {country && (
              <div>
                Country: <span className="text-foreground ">{country}</span>
              </div>
            )}
            {fullTimeEmployees && (
              <div>
                Employees:{" "}
                <span className="text-foreground ">
                  {fullTimeEmployees.toLocaleString("en-US")}
                </span>
              </div>
            )}
            {website && (
              <div>
                Website:{" "}
                <span className="text-foreground ">
                  <Link
                    href={website}
                    target="_blank"
                    className="text-blue-600 hover:underline dark:text-blue-500"
                  >
                    {website}
                  </Link>
                </span>
              </div>
            )}
            {twitter && (
              <div>
                Twitter:{" "}
                <span className="text-foreground ">
                  <Link
                    href={twitter.includes("http") ? twitter.replace(/"/g, '') : `https://twitter.com/${twitter.replace(/"/g, '')}`}
                    className="text-blue-600 hover:underline dark:text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {twitter.replace(/"/g, '')}
                  </Link>
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
