import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="w-full lg:w-1/2">
          <div className="relative flex h-full min-h-[15rem] flex-col justify-between overflow-hidden rounded-lg border p-6">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2">
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
      <div>
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="flex flex-col gap-4 p-6 lg:flex-row rounded-lg border">
          <Skeleton className="h-96 w-full lg:w-1/2" />
          <Skeleton className="h-96 w-full lg:w-1/2" />
        </div>
      </div>
    </div>
  )
} 