"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { Textarea } from "@/components/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiArrowLeftLine, RiCheckLine, RiLoaderLine } from "@remixicon/react";
import { CreateGrievanceInput, IPatient } from "@/data/h&Ischema";
import { useDropdownStore } from "@/store/dropdown";
import { useAuthStore } from "@/store/auth";
import { dropdown } from "@/data/schema";

interface NewGrievanceFormProps {
  onBack: () => void;
}

export default function NewGrievanceForm({ onBack }: NewGrievanceFormProps) {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [trLocationOptions, setTrLocationOptions] = useState<string[]>([]);
  const { fetchDropdownData } = useDropdownStore();
  const { user, token } = useAuthStore();

  useEffect(() => {
    const loadTrLocationData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL;
      const data = await fetchDropdownData(dropdown.trLocation, apiUrl);
      setTrLocationOptions(data);
    };
    loadTrLocationData();
  }, [fetchDropdownData]);

  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({ ...prev, Manager: user.name || "" }));
    }
  }, [user]);

  const [formData, setFormData] = useState<CreateGrievanceInput>({
    date: new Date(),
    employeeId: "",
    employeeName: "",
    insuranceID: "",
    trLocation: "",
    Manager: "",
    employeeMobile: "",
    sourceOfGrievance: "",
    grievanceRemarks: "",
    typeOfIssue: "",
    issueDate: new Date(),
    closedDate: undefined,
    tatMins: undefined,
    slaTatMins: undefined,
    status: "Open",
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
      const response = await fetch(`${apiUrl}/grievance/`, {
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
          message: "Grievance created successfully!",
        });
        setTimeout(() => {
          setNotification(null);
          setFormData({
            date: new Date(),
            employeeId: "",
            employeeName: "",
            insuranceID: "",
            trLocation: "",
            Manager: user?.name || "",
            employeeMobile: "",
            sourceOfGrievance: "",
            grievanceRemarks: "",
            typeOfIssue: "",
            issueDate: new Date(),
            closedDate: undefined,
            tatMins: undefined,
            slaTatMins: undefined,
            status: "Open",
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
          message: "Failed to create grievance. Please try again.",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Error creating grievance:", error);
      setNotification({
        type: "error",
        message: "Failed to create grievance. Please check your connection.",
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
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
          Register New Grievance
        </h2>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`rounded-lg p-4 ${
            notification.type === "success"
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
                value={formData.insuranceID}
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
              <Select value={formData.trLocation} onValueChange={(value) => setFormData({ ...formData, trLocation: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {trLocationOptions.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Select value={formData.sourceOfGrievance} onValueChange={(value) => setFormData({ ...formData, sourceOfGrievance: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                    <SelectItem value="In Person">In Person</SelectItem>
                    <SelectItem value="Online Portal">Online Portal</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="typeOfIssue">Type of Issue *</Label>
                <Select value={formData.typeOfIssue} onValueChange={(value) => setFormData({ ...formData, typeOfIssue: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                    <SelectItem value="Service Quality">Service Quality</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="ON Hold">ON Hold</SelectItem>
                </SelectContent>
              </Select>
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
                <Select value={formData.correctiveActionStatus || ""} onValueChange={(value) => setFormData({ ...formData, correctiveActionStatus: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
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
                  <SelectItem value="H&I Manager">H&I Manager</SelectItem>
                  <SelectItem value="Hospital Admin">Hospital Admin</SelectItem>
                  <SelectItem value="Insurance Company">Insurance Company</SelectItem>
                  <SelectItem value="Provider">Provider</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Third Party">Third Party</SelectItem>
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
                Creating...
              </>
            ) : (
              <>
                <RiCheckLine className="size-4" />
                Create Grievance
              </>
            )}
          </Button>
        </Card>
      </form>
    </div>
  );
}
