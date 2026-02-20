"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Table } from "@/components/Table";
import { RiArrowLeftLine, RiEdit2Line, RiLoaderLine, RiSearchLine } from "@remixicon/react";
import { ICaseResolutionTracker } from "@/data/h&Ischema";
import { useAuthStore } from "@/store/auth";
import UpdateCaseForm from "./UpdateCaseForm";

interface UpdateCaseListProps {
  onBack: () => void;
}

export default function UpdateCaseList({ onBack }: UpdateCaseListProps) {
  const [cases, setCases] = useState<ICaseResolutionTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState<ICaseResolutionTracker | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_CURD_API_URL;
      const response = await fetch(`${apiUrl}/resolution/`, {
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` })
        }
      });
      if (response.ok) {
        const result = await response.json();
        // Handle both direct array and wrapped response formats
        const data = Array.isArray(result) ? result : (result.data || []);
        setCases(data);
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(
    (caseItem) =>
      caseItem.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.empId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.issue?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateCaseAge = (issueDate: Date | undefined) => {
    if (!issueDate) return "-";
    const today = new Date();
    const issue = new Date(issueDate);
    const diffTime = Math.abs(today.getTime() - issue.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (selectedCase) {
    return (
      <UpdateCaseForm
        caseData={selectedCase}
        onBack={() => {
          setSelectedCase(null);
          fetchCases();
        }}
      />
    );
  }

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
          Update Case
        </h2>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <RiSearchLine className="text-gray-400" />
          <Input
            type="text"
            placeholder="Search by employee name, ID, or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RiLoaderLine className="animate-spin text-gray-400" size={24} />
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No cases found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    EMPLOYEE ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    EMPLOYEE NAME
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    TR LOCATION
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    ISSUE DATE
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Case Age (Days)
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((caseItem) => (
                  <tr
                    key={caseItem._id}
                    className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-50">
                        {caseItem.empId}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-600 dark:text-gray-300">
                        {caseItem.empName}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-600 dark:text-gray-300">
                        {caseItem.trLocation || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {caseItem.issueDate
                        ? new Date(caseItem.issueDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                        {calculateCaseAge(caseItem.issueDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedCase(caseItem)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      >
                        <RiEdit2Line className="size-4" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6">
          <Button onClick={onBack} variant="secondary">
            Back to Options
          </Button>
        </div>
      </Card>
    </div>
  );
}
