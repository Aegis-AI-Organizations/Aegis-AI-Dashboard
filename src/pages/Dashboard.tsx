import React from "react";
import { LaunchpadForm } from "../components/LaunchpadForm";

export const Dashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Security Dashboard
        </h1>
        <p className="text-gray-400">
          Comprehensive overview of your security posture and pentest
          operations.
        </p>
      </div>

      {/* Scan Form Card directly embedded here */}
      <div className="flex justify-start">
        <LaunchpadForm />
      </div>
    </div>
  );
};
