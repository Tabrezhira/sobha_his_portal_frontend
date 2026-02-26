"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { Textarea } from "@/components/Textarea";
import ReactSelect from "react-select";
import { RiArrowLeftLine, RiCheckLine, RiLoaderLine, RiDeleteBinLine } from "@remixicon/react";
import { IGrievance, IPatient } from "@/data/h&Ischema";
import { useAuthStore } from "@/store/auth";
import { dropdown } from "@/data/schema";
import { useMultipleDropdowns } from "@/hooks/useDropdownDataQuery";

interface UpdateGrievanceFormProps {
  grievance: IGrievance;
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

export default function UpdateGrievanceForm({ grievance, onBack }: UpdateGrievanceFormProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const { token } = useAuthStore();

  // Fetch all dropdown data using React Query
  const dropdownNames = [
    dropdown.trLocation,
    dropdown.gStatus,
    dropdown.gSourceOfGrievance,
    dropdown.gTypeOfIssue,
    dropdown.gCorrectiveActionStatus,
    dropdown.gPreventiveActionStatus,
    dropdown.gResponsibility,
  ];

  const { data: dropdownData } = useMultipleDropdowns(dropdownNames);

  const [formData, setFormData] = useState<IGrievance>({
    ...grievance,
    date: grievance.date || new Date(),
    issueDate: grievance.issueDate || new Date(),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Date") ? new Date(value) : value,
    }));

    // If employeeId field is being changed, trigger search
    if (name === "employeeId" && value.length === 6) {
      searchPatientData(value);
    }
  };

  const searchPatientData = async (empId: string) => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const apiUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL;
        const response = await fetch(`${apiUrl}/patients/emp/${empId}`);

        if (response.ok) {
          const data: IPatient = await response.json();
          setFormData((prev) => ({
            ...prev,
            employeeName: data.PatientName || "",
            insuranceID: data.insuranceId || "",
            trLocation: data.trLocation || "",
            employeeMobile: data.mobileNumber || "",
          }));
          setNotification({
            type: "success",
            message: `Employee details loaded for ${data.PatientName}`,
          });
          setTimeout(() => setNotification(null), 3000);
        } else {
          setNotification({
            type: "error",
            message: "Employee details not found",
          });
          setTimeout(() => setNotification(null), 3000);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        setNotification({
          type: "error",
          message: "Error fetching employee details",
        });
        setTimeout(() => setNotification(null), 3000);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_CURD_API_URL;
      const submissionData = {
        ...formData,
        employeeId: formData.employeeId.toUpperCase(),
      };
      const response = await fetch(`${apiUrl}/grievance/${grievance._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        setNotification({
          type: "success",
          message: "Grievance updated successfully!",
        });
        setTimeout(() => {
          setNotification(null);
          onBack();
        }, 2000);
      } else {
        setNotification({
          type: "error",
          message: "Failed to update grievance. Please try again.",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Error updating grievance:", error);
      setNotification({
        type: "error",
        message: "Failed to update grievance. Please check your connection.",
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this grievance?")) {
      return;
    }

    setDeleting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_CURD_API_URL;
      const response = await fetch(`${apiUrl}/grievance/${grievance._id}`, {
        method: "DELETE",
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` })
        }
      });

      if (response.ok) {
        setNotification({
          type: "success",
          message: "Grievance deleted successfully!",
        });
        setTimeout(() => {
          setNotification(null);
          onBack();
        }, 2000);
      } else {
        setNotification({
          type: "error",
          message: "Failed to delete grievance. Please try again.",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Error deleting grievance:", error);
      setNotification({
        type: "error",
        message: "Failed to delete grievance. Please check your connection.",
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setDeleting(false);
    }
  };

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
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date ? new Date(formData.date).toISOString().split("T")[0] : ""}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="employeeId">Employee ID * {searching && <span className="text-xs text-gray-500">(Searching...)</span>}</Label>
              <Input
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                placeholder="Enter employee ID"
                maxLength={10}
              />
            </div>

            <div>
              <Label htmlFor="employeeName">Employee Name *</Label>
              <Input
                id="employeeName"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleChange}
                required
                placeholder="Enter employee name"
                disabled
              />
            </div>

            <div>
              <Label htmlFor="insuranceID">Insurance ID</Label>
              <Input
                id="insuranceID"
                name="insuranceID"
                value={formData.insuranceID || ""}
                onChange={handleChange}
                placeholder="Enter ID number"
                disabled
              />
            </div>

            <div>
              <Label htmlFor="employeeMobile">Employee Mobile No. *</Label>
              <Input
                id="employeeMobile"
                name="employeeMobile"
                value={formData.employeeMobile}
                onChange={handleChange}
                required
                placeholder="Enter mobile number"
              />
            </div>
          </div>
        </Card>

        {/* Card 2: Manager & TR Location */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
            2. Manager & TR Location
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="trLocation">TR Location *</Label>
              <div className="mt-2 text-left">
                <ReactSelect
                  inputId="trLocation"
                  value={formData.trLocation ? { label: formData.trLocation, value: formData.trLocation } : null}
                  onChange={(opt: any) => setFormData({ ...formData, trLocation: opt ? opt.value : "" })}
                  options={(dropdownData[dropdown.trLocation] || []).map((location) => ({ label: location, value: location }))}
                  isClearable
                  placeholder="Select location"
                  unstyled
                  components={{ IndicatorSeparator: () => null }}
                  classNames={reactSelectClassNames}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="Manager">Manager *</Label>
              <Input
                id="Manager"
                name="Manager"
                value={formData.Manager}
                onChange={handleChange}
                required
                placeholder="Enter manager name"
                disabled
              />
            </div>
          </div>
        </Card>

        {/* Card 3: Grievance Details */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
            3. Grievance Details
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="sourceOfGrievance">Source of Grievance *</Label>
                <div className="mt-2 text-left">
                  <ReactSelect
                    inputId="sourceOfGrievance"
                    value={formData.sourceOfGrievance ? { label: formData.sourceOfGrievance, value: formData.sourceOfGrievance } : null}
                    onChange={(opt: any) => setFormData({ ...formData, sourceOfGrievance: opt ? opt.value : "" })}
                    options={(dropdownData[dropdown.gSourceOfGrievance] || []).map((option) => ({ label: option, value: option }))}
                    isClearable
                    placeholder="Select source"
                    unstyled
                    components={{ IndicatorSeparator: () => null }}
                    classNames={reactSelectClassNames}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="typeOfIssue">Type of Issue *</Label>
                <div className="mt-2 text-left">
                  <ReactSelect
                    inputId="typeOfIssue"
                    value={formData.typeOfIssue ? { label: formData.typeOfIssue, value: formData.typeOfIssue } : null}
                    onChange={(opt: any) => setFormData({ ...formData, typeOfIssue: opt ? opt.value : "" })}
                    options={(dropdownData[dropdown.gTypeOfIssue] || []).map((option) => ({ label: option, value: option }))}
                    isClearable
                    placeholder="Select issue type"
                    unstyled
                    components={{ IndicatorSeparator: () => null }}
                    classNames={reactSelectClassNames}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="grievanceRemarks">Grievance Remarks</Label>
              <Textarea
                id="grievanceRemarks"
                name="grievanceRemarks"
                value={formData.grievanceRemarks || ""}
                onChange={handleChange}
                placeholder="Describe the grievance in detail"
                rows={4}
              />
            </div>
          </div>
        </Card>

        {/* Card 4: Issue Timeline */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
            4. Issue Timeline
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="issueDate">Issue Date *</Label>
              <Input
                id="issueDate"
                name="issueDate"
                type="date"
                value={formData.issueDate ? new Date(formData.issueDate).toISOString().split("T")[0] : ""}
                onChange={handleChange}
                required
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
              />
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <div className="mt-2 text-left">
                <ReactSelect
                  inputId="status"
                  value={formData.status ? { label: formData.status, value: formData.status } : null}
                  onChange={(opt: any) => setFormData({ ...formData, status: opt ? opt.value as any : "" as any })}
                  options={(dropdownData[dropdown.gStatus] || []).map((option) => ({ label: option, value: option }))}
                  isClearable
                  placeholder="Select status"
                  unstyled
                  components={{ IndicatorSeparator: () => null }}
                  classNames={reactSelectClassNames}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tatMins">TAT (Minutes)</Label>
              <Input
                id="tatMins"
                name="tatMins"
                type="number"
                value={formData.tatMins || ""}
                onChange={handleChange}
                placeholder="Enter TAT in minutes"
              />
            </div>

            <div>
              <Label htmlFor="slaTatMins">SLA TAT (Minutes)</Label>
              <Input
                id="slaTatMins"
                name="slaTatMins"
                type="number"
                value={formData.slaTatMins || ""}
                onChange={handleChange}
                placeholder="Enter SLA TAT"
              />
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
                <div className="mt-2 text-left">
                  <ReactSelect
                    inputId="correctiveActionStatus"
                    value={formData.correctiveActionStatus ? { label: formData.correctiveActionStatus, value: formData.correctiveActionStatus } : null}
                    onChange={(opt: any) => setFormData({ ...formData, correctiveActionStatus: opt ? opt.value : "" })}
                    options={(dropdownData[dropdown.gCorrectiveActionStatus] || []).map((option) => ({ label: option, value: option }))}
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
              <div className="mt-2 text-left">
                <ReactSelect
                  inputId="preventiveActionStatus"
                  value={formData.preventiveActionStatus ? { label: formData.preventiveActionStatus, value: formData.preventiveActionStatus } : null}
                  onChange={(opt: any) => setFormData({ ...formData, preventiveActionStatus: opt ? opt.value : "" })}
                  options={(dropdownData[dropdown.gPreventiveActionStatus] || []).map((option) => ({ label: option, value: option }))}
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
              <div className="mt-2 text-left">
                <ReactSelect
                  inputId="responsibility"
                  value={formData.responsibility ? { label: formData.responsibility, value: formData.responsibility } : null}
                  onChange={(opt: any) => setFormData({ ...formData, responsibility: opt ? opt.value : "" })}
                  options={(dropdownData[dropdown.gResponsibility] || []).map((option) => ({ label: option, value: option }))}
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
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            variant="secondary"
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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
                Update Grievance
              </>
            )}
          </Button>
        </Card>
      </form>
    </div>
  );
}
