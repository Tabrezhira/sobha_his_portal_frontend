"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import ReactSelect from "react-select";
import { SuggestionInput } from "@/components/SuggestionInput";
import { Textarea } from "@/components/Textarea";
import { RiArrowLeftLine, RiCheckLine, RiLoaderLine } from "@remixicon/react";
import { ICaseResolutionTracker } from "@/data/h&Ischema";
import { useAuthStore } from "@/store/auth";
import { dropdown, inputsearch, issueSlaMinutes } from "@/data/schema";
import { useMultipleDropdowns } from "@/hooks/useDropdownDataQuery";

interface UpdateCaseFormProps {
  caseData: ICaseResolutionTracker;
  onBack: () => void;
}

const reactSelectClassNames = {
  control: (state: any) =>
    `flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm ring-offset-white focus-within:ring-2 focus-within:ring-gray-400 focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-transparent dark:ring-offset-gray-950 dark:focus-within:ring-gray-800 ${state.isFocused ? 'ring-2 ring-gray-400 ring-offset-2 dark:ring-gray-800 dark:ring-offset-gray-950 border-transparent' : ''
    }`,
  placeholder: () => "text-gray-500 dark:text-gray-400 truncate",
  singleValue: () => "text-gray-900 dark:text-gray-50 truncate",
  valueContainer: () => "flex flex-1 items-center gap-1 overflow-hidden",
  input: () => "text-gray-900 dark:text-gray-50 m-0 p-0",
  indicatorsContainer: () => "flex items-center gap-1",
  clearIndicator: () => "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-pointer p-0.5",
  dropdownIndicator: () => "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-pointer p-0.5",
  menu: () => "mt-1 overflow-hidden rounded-md border border-gray-200 bg-white text-gray-900 shadow-md dark:border-gray-800 dark:bg-gray-950 z-50",
  menuList: () => "p-1",
  option: (state: any) =>
    `relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50 ${state.isFocused ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' : ''
    } ${state.isSelected ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50 font-medium' : ''}`,
  noOptionsMessage: () => "text-sm text-gray-500 dark:text-gray-400 p-2",
};

export default function UpdateCaseForm({ caseData, onBack }: UpdateCaseFormProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ICaseResolutionTracker>(caseData);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);

  const { token } = useAuthStore();

  // Fetch all dropdown data using React Query
  const dropdownNames = [
    dropdown.crtInsuranceType,
    dropdown.crtTypeOfIssue,
    dropdown.crtStatus,
    dropdown.crtCorrectiveActionStatus,
    dropdown.crtPreventiveActionStatus,
    dropdown.crtResponsibility,
  ];

  const { data: dropdownData } = useMultipleDropdowns(dropdownNames);

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


  return (
    <Card className="mx-auto max-w-5xl space-y-8 p-6 sm:p-8 mt-0">
      <div className="flex items-center justify-between border-b border-gray-200 pb-6 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-50"
          >
            <RiArrowLeftLine className="size-4 transition-transform group-hover:-translate-x-1" />
            Back
          </button>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Update Case
          </h2>
        </div>
        {/* <button
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
        </button> */}
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
              <div className="text-left mt-1">
                <ReactSelect
                  inputId="insuranceType"
                  value={formData.insuranceType ? { label: formData.insuranceType, value: formData.insuranceType } : null}
                  onChange={(opt: any) => setFormData({ ...formData, insuranceType: opt ? opt.value : "" })}
                  options={(dropdownData[dropdown.crtInsuranceType] || []).map((option: string) => ({ label: option, value: option }))}
                  isClearable
                  placeholder="Insurance type"
                  unstyled
                  components={{ IndicatorSeparator: () => null }}
                  classNames={reactSelectClassNames}
                />
              </div>
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
                <div className="text-left mt-1">
                  <ReactSelect
                    inputId="typeOfIssue"
                    value={formData.typeOfIssue ? { label: formData.typeOfIssue, value: formData.typeOfIssue } : null}
                    onChange={(opt: any) => {
                      const value = opt ? opt.value : "";
                      const mappedSla = issueSlaMinutes[value as keyof typeof issueSlaMinutes];
                      setFormData({
                        ...formData,
                        typeOfIssue: value,
                        // Reset slaTAT to undefined if mappedSla is undefined or value is empty
                        slaTAT: mappedSla !== undefined ? mappedSla : undefined
                      });
                    }}
                    options={(dropdownData[dropdown.crtTypeOfIssue] || []).map((option: string) => ({ label: option, value: option }))}
                    isClearable
                    placeholder="Issue type"
                    unstyled
                    components={{ IndicatorSeparator: () => null }}
                    classNames={reactSelectClassNames}
                  />
                </div>
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
                  disabled
                  value={formData.slaTAT || ""}
                  onChange={handleChange}
                  placeholder="Enter SLA TAT"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <div className="text-left mt-1">
                  <ReactSelect
                    inputId="status"
                    value={formData.status ? { label: formData.status, value: formData.status } : null}
                    onChange={(opt: any) => setFormData({ ...formData, status: opt ? opt.value : "" })}
                    options={(dropdownData[dropdown.crtStatus] || []).map((option: string) => ({ label: option, value: option }))}
                    isClearable
                    placeholder="Select status"
                    unstyled
                    components={{ IndicatorSeparator: () => null }}
                    classNames={reactSelectClassNames}
                  />
                </div>
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
                <div className="text-left mt-1">
                  <ReactSelect
                    inputId="correctiveActionStatus"
                    value={formData.correctiveActionStatus ? { label: formData.correctiveActionStatus, value: formData.correctiveActionStatus } : null}
                    onChange={(opt: any) => setFormData({ ...formData, correctiveActionStatus: opt ? opt.value : "" })}
                    options={(dropdownData[dropdown.crtCorrectiveActionStatus] || []).map((option: string) => ({ label: option, value: option }))}
                    isClearable
                    placeholder="Select status"
                    unstyled
                    components={{ IndicatorSeparator: () => null }}
                    classNames={reactSelectClassNames}
                  />
                </div>
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
              <div className="text-left mt-1">
                <ReactSelect
                  inputId="preventiveActionStatus"
                  value={formData.preventiveActionStatus ? { label: formData.preventiveActionStatus, value: formData.preventiveActionStatus } : null}
                  onChange={(opt: any) => setFormData({ ...formData, preventiveActionStatus: opt ? opt.value : "" })}
                  options={(dropdownData[dropdown.crtPreventiveActionStatus] || []).map((option: string) => ({ label: option, value: option }))}
                  isClearable
                  placeholder="Select status"
                  unstyled
                  components={{ IndicatorSeparator: () => null }}
                  classNames={reactSelectClassNames}
                />
              </div>
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
              <div className="text-left mt-1">
                <ReactSelect
                  inputId="responsibility"
                  value={formData.responsibility ? { label: formData.responsibility, value: formData.responsibility } : null}
                  onChange={(opt: any) => setFormData({ ...formData, responsibility: opt ? opt.value : "" })}
                  options={(dropdownData[dropdown.crtResponsibility] || []).map((option: string) => ({ label: option, value: option }))}
                  isClearable
                  placeholder="Select responsibility"
                  unstyled
                  components={{ IndicatorSeparator: () => null }}
                  classNames={reactSelectClassNames}
                />
              </div>
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
    </Card>
  );
}
