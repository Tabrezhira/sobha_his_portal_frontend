"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { RiArrowLeftLine } from "@remixicon/react";

interface UpdateGrievanceListProps {
  onBack: () => void;
}

export default function UpdateGrievanceList({ onBack }: UpdateGrievanceListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <RiArrowLeftLine className="size-4" />
          Back
        </button>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
          Update Grievance
        </h2>
      </div>

      <Card className="p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Grievance List - Coming Soon
        </p>
      </Card>
    </div>
  );
}
