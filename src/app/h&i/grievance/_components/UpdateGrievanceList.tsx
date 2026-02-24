"use client";

import { useState, useEffect } from "react";
// import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { RiArrowLeftLine, RiEditLine, RiDeleteBinLine, RiLoaderLine } from "@remixicon/react";
import { IGrievance } from "@/data/h&Ischema";
import { useAuthStore } from "@/store/auth";
import UpdateGrievanceForm from "./UpdateGrievanceForm";

interface UpdateGrievanceListProps {
  onBack: () => void;
}

export default function UpdateGrievanceList({ onBack }: UpdateGrievanceListProps) {
  const [grievances, setGrievances] = useState<IGrievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState<IGrievance | null>(null);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchGrievances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_CURD_API_URL;
      const response = await fetch(`${apiUrl}/grievance/`, {
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` })
        }
      });

      if (response.ok) {
        const result = await response.json();
        const data = Array.isArray(result) ? result : (result.data || []);
        setGrievances(data);
      } else {
        setNotification({
          type: "error",
          message: "Failed to fetch grievances",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Error fetching grievances:", error);
      setNotification({
        type: "error",
        message: "Error loading grievances",
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this grievance?")) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_CURD_API_URL;
      const response = await fetch(`${apiUrl}/grievance/${id}`, {
        method: "DELETE",
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` })
        }
      });

      if (response.ok) {
        setNotification({
          type: "success",
          message: "Grievance deleted successfully",
        });
        setTimeout(() => setNotification(null), 2000);
        fetchGrievances();
      } else {
        setNotification({
          type: "error",
          message: "Failed to delete grievance",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Error deleting grievance:", error);
      setNotification({
        type: "error",
        message: "Error deleting grievance",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  if (selectedGrievance) {
    return (
      <UpdateGrievanceForm
        grievance={selectedGrievance}
        onBack={() => {
          setSelectedGrievance(null);
          fetchGrievances();
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
          Grievance List
        </h2>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`rounded-lg p-4 ${notification.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            }`}
        >
          {notification.message}
        </div>
      )}

      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RiLoaderLine className="size-8 animate-spin text-gray-400" />
          </div>
        ) : grievances.length === 0 ? (
          <p className="py-8 text-center text-gray-600 dark:text-gray-400">
            No grievances found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-50">
                    DATE
                  </th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-50">
                    EMPLOYEE ID
                  </th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-50">
                    EMPLOYEE NAME
                  </th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-50">
                    TR LOCATION
                  </th>
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-50">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {grievances.map((grievance) => (
                  <tr
                    key={grievance._id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    <td className="py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(grievance.date)}
                    </td>
                    <td className="py-3 text-sm text-gray-700 dark:text-gray-300">
                      {grievance.employeeId}
                    </td>
                    <td className="py-3 text-sm text-gray-700 dark:text-gray-300">
                      {grievance.employeeName}
                    </td>
                    <td className="py-3 text-sm text-gray-700 dark:text-gray-300">
                      {grievance.trLocation}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedGrievance(grievance)}
                          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        >
                          <RiEditLine className="size-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(grievance._id!)}
                          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <RiDeleteBinLine className="size-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
