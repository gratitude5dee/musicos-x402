import { Suspense, lazy, useState } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

const SplineOrbCard = () => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-[400px] h-[400px] rounded-2xl overflow-hidden bg-muted/20 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">3D scene unavailable</div>
      </div>
    );
  }

  return (
    <div className="w-[400px] h-[400px] rounded-2xl overflow-hidden">
      <Suspense
        fallback={
          <div className="w-full h-full bg-muted/20 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <Spline 
          scene="https://prod.spline.design/4mEWf5KuK8XTfc9O/scene.splinecode"
          onError={() => setHasError(true)}
        />
      </Suspense>
    </div>
  );
};

export default SplineOrbCard;
