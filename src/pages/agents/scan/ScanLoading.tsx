import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ScanLoading = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card className="bg-card/70 border border-white/10 shadow-xl">
        <CardContent className="py-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card/70 border border-white/10 shadow-xl">
        <CardContent className="py-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
      <Card className="bg-card/70 border border-white/10 shadow-xl">
        <CardContent className="py-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanLoading;
