"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { Textarea } from "@/components/Textarea";
import ReactSelect from "react-select";
import { SuggestionInput } from "@/components/SuggestionInput";
import { RiArrowLeftLine, RiCheckLine, RiLoaderLine } from "@remixicon/react";
import { CreateCaseResolutionTrackerInput, IPatient } from "@/data/h&Ischema";
import { useAuthStore } from "@/store/auth";
import { dropdown, inputsearch, issueSlaMinutes } from "@/data/schema";
import { useMultipleDropdowns } from "@/hooks/useDropdownDataQuery";

interface NewCaseFormProps {
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

export default function NewCaseForm({ onBack }: NewCaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const { user, token } = useAuthStore();

  // Fetch all dropdown data using React Query
  const dropdownNames = [
    dropdown.trLocation,
    dropdown.natureOfCase,
    dropdown.crtInsuranceType,
    dropdown.crtTypeOfIssue,
    dropdown.crtStatus,
    dropdown.crtCorrectiveActionStatus,
    dropdown.crtPreventiveActionStatus,
    dropdown.crtResponsibility,
  ];

  const { data: dropdownData } = useMultipleDropdowns(dropdownNames);

  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({ ...prev, MANAGER: user.name || "" }));
    }
  }, [user]);

  const [formData, setFormData] = useState<CreateCaseResolutionTrackerInput>({
    date: new Date(),
    empId: "",
    empName: "",
    insuranceID: "",
    trLocation: "",
    MANAGER: "",
    empMobileNo: "",
    TypeOfAdmission: "",
    insuranceType: "",
    providerName: "",
    issue: "",
    typeOfIssue: "",
    issueDate: new Date(),
    closedDate: undefined,
    TAT: undefined,
    slaTAT: undefined,
    status: undefined,
    rootCause: "",
    correctiveAction: "",
    correctiveActionStatus: "",
    preventiveAction: "",
    preventiveActionStatus: "",
    responsibility: "",
    remarks: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Date") ? new Date(value) : value,
    }));

    // If empId field is being changed, trigger search
    if (name === "empId" && value.length === 6) {
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
            empName: data.PatientName || "",
            insuranceID: data.insuranceId || "",
            trLocation: data.trLocation || "",
            empMobileNo: data.mobileNumber || "",
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
        empId: formData.empId.toUpperCase(),
      };
      const response = await fetch(`${apiUrl}/resolution/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        setNotification({
          type: "success",
          message: "Case created successfully!",
        });
        setTimeout(() => {
          setNotification(null);
          setFormData({
            date: new Date(),
            empId: "",
            empName: "",
            insuranceID: "",
            trLocation: "",
            MANAGER: "",
            empMobileNo: "",
            TypeOfAdmission: "",
            insuranceType: "",
            providerName: "",
            issue: "",
            typeOfIssue: "",
            issueDate: new Date(),
            closedDate: undefined,
            TAT: undefined,
            slaTAT: undefined,
            status: undefined,
            rootCause: "",
            correctiveAction: "",
            correctiveActionStatus: "",
            preventiveAction: "",
            preventiveActionStatus: "",
            responsibility: "",
            remarks: "",
          });
          onBack();
        }, 2000);
      } else {
        setNotification({
          type: "error",
          message: "Failed to create case. Please try again.",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Error creating case:", error);
      setNotification({
        type: "error",
        message: "Failed to create case. Please check your connection.",
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-5xl space-y-8 p-6 sm:p-8 mt-0">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-6 dark:border-gray-800">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-50"
        >
          <RiArrowLeftLine className="size-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Register New Case
        </h2>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`flex items-center gap-3 rounded-lg border p-4 shadow-sm ${notification.type === "success"
            ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-900/10 dark:text-green-300"
            : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-300"
            }`}
        >
          {notification.type === "success" ? <RiCheckLine className="size-5" /> : <RiLoaderLine className="size-5" />}
          <p className="font-medium">{notification.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Member Basic Details */}
        <Card className="p-6 sm:p-8">
          <h3 className="mb-6 border-b border-gray-100 pb-4 text-lg font-medium text-gray-900 dark:border-gray-800 dark:text-gray-50">
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
              <Label htmlFor="empId">Employee ID * {searching && <span className="text-xs text-gray-500">(Searching...)</span>}</Label>
              <Input
                id="empId"
                name="empId"
                value={formData.empId}
                onChange={handleChange}
                required
                placeholder="Enter 5-letter employee ID"
                maxLength={10}
              />
            </div>

            <div>
              <Label htmlFor="empName">Employee Name *</Label>
              <Input
                id="empName"
                name="empName"
                value={formData.empName}
                onChange={handleChange}
                required
                placeholder="Enter employee name"
                disabled
              />
            </div>

            <div>
              <Label htmlFor="emiratesId">Insurance ID</Label>
              <Input
                id="insuranceID"
                name="insuranceID"
                value={formData.insuranceID}
                onChange={handleChange}
                required
                placeholder="Enter ID number"
                disabled
              />
            </div>

            <div>
              <Label htmlFor="empMobileNo">Employee Mobile No. *</Label>
              <Input
                id="empMobileNo"
                name="empMobileNo"
                value={formData.empMobileNo}
                onChange={handleChange}
                required
                placeholder="Enter mobile number"
              />
            </div>
          </div>
        </Card>

        {/* Card 2: H&I Manager & TR Location */}
        <Card className="p-6 sm:p-8">
          <h3 className="mb-6 border-b border-gray-100 pb-4 text-lg font-medium text-gray-900 dark:border-gray-800 dark:text-gray-50">
            2. H&I Manager & TR Location
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="trLocation">TR Location *</Label>
              <div className="text-left mt-1">
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
              <Label htmlFor="MANAGER">H&I Manager *</Label>
              <Input
                id="MANAGER"
                name="MANAGER"
                value={formData.MANAGER}
                onChange={handleChange}
                required
                placeholder="Enter manager name"
                disabled
              />
            </div>
          </div>
        </Card>

        {/* Card 3: Type of Admission, Provider Name, Insurance Type */}
        <Card className="p-6 sm:p-8">
          <h3 className="mb-6 border-b border-gray-100 pb-4 text-lg font-medium text-gray-900 dark:border-gray-800 dark:text-gray-50">
            3. Type of Admission & Provider Details
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="TypeOfAdmission">Type of Admission *</Label>
              <div className="text-left mt-1">
                <ReactSelect
                  inputId="TypeOfAdmission"
                  value={formData.TypeOfAdmission ? { label: formData.TypeOfAdmission, value: formData.TypeOfAdmission } : null}
                  onChange={(opt: any) => setFormData({ ...formData, TypeOfAdmission: opt ? opt.value : "" })}
                  options={(dropdownData[dropdown.natureOfCase] || []).map((option) => ({ label: option, value: option }))}
                  isClearable
                  placeholder="Select type"
                  unstyled
                  components={{ IndicatorSeparator: () => null }}
                  classNames={reactSelectClassNames}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="insuranceType">Insurance Type *</Label>
              <div className="text-left mt-1">
                <ReactSelect
                  inputId="insuranceType"
                  value={formData.insuranceType ? { label: formData.insuranceType, value: formData.insuranceType } : null}
                  onChange={(opt: any) => setFormData({ ...formData, insuranceType: opt ? opt.value : "" })}
                  options={(dropdownData[dropdown.crtInsuranceType] || []).map((option) => ({ label: option, value: option }))}
                  isClearable
                  placeholder="Select insurance type"
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
                required={true}
                placeholder="Search or enter provider name"
              />
            </div>
          </div>
        </Card>

        {/* Card 4: Issue Details */}
        <Card className="p-6 sm:p-8">
          <h3 className="mb-6 border-b border-gray-100 pb-4 text-lg font-medium text-gray-900 dark:border-gray-800 dark:text-gray-50">
            4. Issue Details
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="issue">Issue *</Label>
              <Textarea
                id="issue"
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                required
                placeholder="Describe the issue"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="typeOfIssue">Type of Issue *</Label>
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
                    options={(dropdownData[dropdown.crtTypeOfIssue] || []).map((option) => ({ label: option, value: option }))}
                    isClearable
                    placeholder="Select issue type"
                    unstyled
                    components={{ IndicatorSeparator: () => null }}
                    classNames={reactSelectClassNames}
                  />
                </div>
              </div>

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
                  disabled
                  type="number"
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
                    options={(dropdownData[dropdown.crtStatus] || []).map((option) => ({ label: option, value: option }))}
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
        <Card className="p-6 sm:p-8">
          <h3 className="mb-6 border-b border-gray-100 pb-4 text-lg font-medium text-gray-900 dark:border-gray-800 dark:text-gray-50">
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
                    options={(dropdownData[dropdown.crtCorrectiveActionStatus] || []).map((option) => ({ label: option, value: option }))}
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
        <Card className="p-6 sm:p-8">
          <h3 className="mb-6 border-b border-gray-100 pb-4 text-lg font-medium text-gray-900 dark:border-gray-800 dark:text-gray-50">
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
                  options={(dropdownData[dropdown.crtPreventiveActionStatus] || []).map((option) => ({ label: option, value: option }))}
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
                  options={(dropdownData[dropdown.crtResponsibility] || []).map((option) => ({ label: option, value: option }))}
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
        <div className="flex items-center justify-end gap-3 pt-6 pb-4">
          <Button
            type="button"
            onClick={onBack}
            variant="secondary"
            className="min-w-28"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex min-w-36 items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RiLoaderLine className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <RiCheckLine className="size-4" />
                Create Case
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
