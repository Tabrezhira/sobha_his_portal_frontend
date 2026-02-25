"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SuggestionInput } from "@/components/SuggestionInput";
import { Textarea } from "@/components/Textarea";
import { RiArrowLeftLine, RiCheckLine, RiLoaderLine, RiDeleteBinLine } from "@remixicon/react";
import { ICaseResolutionTracker } from "@/data/h&Ischema";
import { useAuthStore } from "@/store/auth";
import { useDropdownStore } from "@/store/dropdown";
import { dropdown, inputsearch, issueSlaMinutes } from "@/data/schema";

interface UpdateCaseFormProps {
  caseData: ICaseResolutionTracker;
  onBack: () => void;
}

export default function UpdateCaseForm({ caseData, onBack }: UpdateCaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<ICaseResolutionTracker>(caseData);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);

  const [insuranceTypeOptions, setInsuranceTypeOptions] = useState<string[]>([]);
  const [typeOfIssueOptions, setTypeOfIssueOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [correctiveActionStatusOptions, setCorrectiveActionStatusOptions] = useState<string[]>([]);
  const [preventiveActionStatusOptions, setPreventiveActionStatusOptions] = useState<string[]>([]);
  const [responsibilityOptions, setResponsibilityOptions] = useState<string[]>([]);

  const { fetchDropdownData } = useDropdownStore();
  const { token } = useAuthStore();

  useEffect(() => {
    const loadDropdownData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL;
      const [
        insuranceTypeData,
        typeOfIssueData,
        statusData,
        correctiveActionStatusData,
        preventiveActionStatusData,
        responsibilityData
      ] = await Promise.all([
        fetchDropdownData(dropdown.crtInsuranceType, apiUrl),
        fetchDropdownData(dropdown.crtTypeOfIssue, apiUrl),
        fetchDropdownData(dropdown.crtStatus, apiUrl),
        fetchDropdownData(dropdown.crtCorrectiveActionStatus, apiUrl),
        fetchDropdownData(dropdown.crtPreventiveActionStatus, apiUrl),
        fetchDropdownData(dropdown.crtResponsibility, apiUrl),
      ]);
      setInsuranceTypeOptions(insuranceTypeData);
      setTypeOfIssueOptions(typeOfIssueData);
      setStatusOptions(statusData);
      setCorrectiveActionStatusOptions(correctiveActionStatusData);
      setPreventiveActionStatusOptions(preventiveActionStatusData);
      setResponsibilityOptions(responsibilityData);
    };
    loadDropdownData();
  }, [fetchDropdownData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: ICaseResolutionTracker) => ({
      ...prev,
      [name]: name.includes("Date") ? new Date(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_CURD_API_URL;
      const response = await fetch(`${apiUrl}/resolution/${formData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setNotification({
          type: "success",
          message: "Case updated successfully!",
        });
        setTimeout(() => {
          setNotification(null);
          onBack();
        }, 2000);
      } else {
        setNotification({
          type: "error",
          message: "Failed to update case. Please try again.",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Error updating case:", error);
      setNotification({
        type: "error",
        message: "Failed to update case. Please check your connection.",
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this case?")) return;

    setDeleting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_CURD_API_URL;
      const response = await fetch(`${apiUrl}/resolution/${formData._id}`, {
        method: "DELETE",
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` })
        }
      });

      if (response.ok) {
        setNotification({
          type: "success",
          message: "Case deleted successfully!",
        });
        setTimeout(() => {
          setNotification(null);
          onBack();
        }, 2000);
      } else {
        setNotification({
          type: "error",
          message: "Failed to delete case. Please try again.",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Error deleting case:", error);
      setNotification({
        type: "error",
        message: "Failed to delete case. Please check your connection.",
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
        >
          {deleting ? (
            <>
              <RiLoaderLine className="size-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <RiDeleteBinLine className="size-4" />
              Delete
            </>
          )}
        </button>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Member Basic Details */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
            1. Member Basic Details
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date ? new Date(formData.date).toISOString().split("T")[0] : ""}
                onChange={handleChange}
                disabled
              />
            </div>

            <div>
              <Label htmlFor="empId">Employee ID</Label>
              <Input
                id="empId"
                name="empId"
                value={formData.empId}
                onChange={handleChange}
                disabled
                placeholder="Employee ID"
              />
            </div>

            <div>
              <Label htmlFor="empName">Employee Name</Label>
              <Input
                id="empName"
                name="empName"
                value={formData.empName}
                onChange={handleChange}
                disabled
                placeholder="Employee name"
              />
            </div>

            <div>
              <Label htmlFor="insuranceID">Insurance ID</Label>
              <Input
                id="insuranceID"
                name="insuranceID"
                value={formData.insuranceID}
                onChange={handleChange}
                disabled
                placeholder="Insurance ID"
              />
            </div>

            <div>
              <Label htmlFor="empMobileNo">Employee Mobile No.</Label>
              <Input
                id="empMobileNo"
                name="empMobileNo"
                value={formData.empMobileNo}
                onChange={handleChange}
                placeholder="Mobile number"
              />
            </div>
          </div>
        </Card>

        {/* Card 2: H&I Manager & TR Location */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
            2. H&I Manager & TR Location
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="trLocation">TR Location</Label>
              <Input
                id="trLocation"
                name="trLocation"
                value={formData.trLocation}
                onChange={handleChange}
                disabled
                placeholder="Location"
              />
            </div>

            <div>
              <Label htmlFor="MANAGER">H&I Manager</Label>
              <Input
                id="MANAGER"
                name="MANAGER"
                value={formData.MANAGER}
                onChange={handleChange}
                disabled
                placeholder="Manager"
              />
            </div>
          </div>
        </Card>

        {/* Card 3: Type of Admission, Provider Name, Insurance Type */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
            3. Type of Admission & Provider Details
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="TypeOfAdmission">Type of Admission</Label>
              <Input
                id="TypeOfAdmission"
                name="TypeOfAdmission"
                value={formData.TypeOfAdmission}
                onChange={handleChange}
                disabled
                placeholder="Type"
              />
            </div>

            <div>
              <Label htmlFor="insuranceType">Insurance Type</Label>
              <Select value={formData.insuranceType || ""} onValueChange={(value) => setFormData({ ...formData, insuranceType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Insurance type" />
                </SelectTrigger>
                <SelectContent>
                  {insuranceTypeOptions.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <SuggestionInput
                id="providerName"
                label="Provider Name"
                value={formData.providerName || ""}
                onChange={(value) => setFormData({ ...formData, providerName: value })}
                category={inputsearch.providerName}
                placeholder="Search or enter provider name"
              />
            </div>
          </div>
        </Card>

        {/* Card 4: Issue Details */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
            4. Issue Details
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="issue">Issue</Label>
              <Textarea
                id="issue"
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                disabled
                placeholder="Issue description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="typeOfIssue">Type of Issue</Label>
                <Select value={formData.typeOfIssue || ""} onValueChange={(value) => {
                  const mappedSla = issueSlaMinutes[value as keyof typeof issueSlaMinutes];
                  setFormData({
                    ...formData,
                    typeOfIssue: value,
                    ...(mappedSla !== undefined ? { slaTAT: mappedSla } : {})
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOfIssueOptions.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  value={formData.issueDate ? new Date(formData.issueDate).toISOString().split("T")[0] : ""}
                  onChange={handleChange}
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="closedDate">Closed Date</Label>
                <Input
                  id="closedDate"
                  name="closedDate"
                  type="date"
                  value={formData.closedDate ? new Date(formData.closedDate).toISOString().split("T")[0] : ""}
                  onChange={handleChange}
                  placeholder="Leave empty if not closed"
                />
              </div>

              <div>
                <Label htmlFor="TAT">TAT (Minutes only - 24h = 1440 mins)</Label>
                <Input
                  id="TAT"
                  name="TAT"
                  type="number"
                  value={formData.TAT || ""}
                  onChange={handleChange}
                  placeholder="Enter TAT in minutes"
                />
              </div>

              <div>
                <Label htmlFor="slaTAT">SLA TAT (Minutes)</Label>
                <Input
                  id="slaTAT"
                  name="slaTAT"
                  type="number"
                  value={formData.slaTAT || ""}
                  onChange={handleChange}
                  placeholder="Enter SLA TAT"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status || ""} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 5: Root Cause & Corrective Action */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
            5. Root Cause & Corrective Action
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="rootCause">Root Cause</Label>
              <Textarea
                id="rootCause"
                name="rootCause"
                value={formData.rootCause || ""}
                onChange={handleChange}
                placeholder="Describe root cause"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="correctiveAction">Corrective Action</Label>
                <Textarea
                  id="correctiveAction"
                  name="correctiveAction"
                  value={formData.correctiveAction || ""}
                  onChange={handleChange}
                  placeholder="Describe corrective action"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="correctiveActionStatus">Corrective Action Status</Label>
                <Select value={formData.correctiveActionStatus || ""} onValueChange={(value) => setFormData({ ...formData, correctiveActionStatus: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {correctiveActionStatusOptions.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 6: Preventive Action */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
            6. Preventive Action
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="preventiveAction">Preventive Action</Label>
              <Textarea
                id="preventiveAction"
                name="preventiveAction"
                value={formData.preventiveAction || ""}
                onChange={handleChange}
                placeholder="Describe preventive action"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="preventiveActionStatus">Preventive Action Status</Label>
              <Select value={formData.preventiveActionStatus || ""} onValueChange={(value) => setFormData({ ...formData, preventiveActionStatus: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {preventiveActionStatusOptions.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Card 7: Responsibility & Remarks */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
            7. Responsibility & Remarks
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="responsibility">Responsibility</Label>
              <Select value={formData.responsibility || ""} onValueChange={(value) => setFormData({ ...formData, responsibility: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select responsibility" />
                </SelectTrigger>
                <SelectContent>
                  {responsibilityOptions.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                name="remarks"
                value={formData.remarks || ""}
                onChange={handleChange}
                placeholder="Add remarks"
                rows={2}
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="flex gap-3 border-0 bg-transparent p-0 shadow-none">
          <Button
            type="button"
            onClick={onBack}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <RiLoaderLine className="size-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <RiCheckLine className="size-4" />
                Update Case
              </>
            )}
          </Button>
        </Card>
      </form>
    </div>
  );
}
