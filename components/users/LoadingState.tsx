import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
      {/* Header Section Skeleton */}
      <div className="w-full bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* User Info Skeleton */}
            <div className="lg:w-1/3">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64 mb-6" />
              <div className="mt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            
            {/* Chart Skeleton */}
            <div className="lg:w-2/3">
              <Card className="h-[400px] lg:h-[350px]">
                <CardContent className="h-full p-4">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Holdings Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Tweets Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 