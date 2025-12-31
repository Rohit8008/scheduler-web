import { Suspense } from "react";
import { PulseLoader } from "react-spinners";

export default function AvailabilityLayout({ children }) {
  return (
    <div className="mx-auto">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-60">
            <PulseLoader color="#3498db" size={10} />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
