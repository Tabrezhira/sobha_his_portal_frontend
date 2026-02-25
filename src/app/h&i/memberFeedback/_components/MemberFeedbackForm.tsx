"use client";

import { useEffect, useState } from "react";
import { MemberFeedbackForm as MemberFeedbackFormType } from "@/data/h&Ischema";
import { useAuthStore } from "@/store/auth";
import { Label } from "@/components/Label";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Switch";
import { RiCheckLine, RiLoaderLine } from "@remixicon/react";

interface MemberFeedbackFormProps {
    clinicId: string;
    employeeId: string;
}

export default function MemberFeedbackForm({ clinicId, employeeId }: MemberFeedbackFormProps) {
    const { user, token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);

    const [formData, setFormData] = useState<MemberFeedbackFormType>({
        clinicId: clinicId,
        employeeId: employeeId,
        manager: user?.name || "",
        dateOfCall: new Date(),
        wasTreatmentEffective: false,
        technicianFeedback: "",
        wasTreatmentEffective1: false,
        technicianFeedback1: "",
        refReqToSpecialist: false,
    });

    useEffect(() => {
        if (user?.name) {
            setFormData((prev) => ({ ...prev, manager: user.name || "" }));
        }
    }, [user]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "dateOfCall" ? new Date(value) : value,
        }));
    };

    const handleSwitchChange = (name: keyof MemberFeedbackFormType, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_CURD_API_URL;
            const response = await fetch(`${apiUrl}/memberFeedback/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setNotification({
                    type: "success",
                    message: "Feedback submitted successfully!",
                });
                setTimeout(() => setNotification(null), 3000);
            } else {
                setNotification({
                    type: "error",
                    message: "Failed to submit feedback. Please try again.",
                });
                setTimeout(() => setNotification(null), 3000);
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            setNotification({
                type: "error",
                message: "Failed to submit feedback. Please check your connection.",
            });
            setTimeout(() => setNotification(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {notification && (
                <div
                    className={`flex items-center gap-3 rounded-lg border p-4 shadow-sm ${notification.type === "success"
                        ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-900/10 dark:text-green-300"
                        : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-300"
                        }`}
                >
                    {notification.type === "success" ? <RiCheckLine className="size-5" /> : <RiLoaderLine className="size-5" />}
                    <p className="font-medium text-sm">{notification.message}</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor="dateOfCall">Date of Call *</Label>
                    <Input
                        id="dateOfCall"
                        name="dateOfCall"
                        type="date"
                        value={formData.dateOfCall ? new Date(formData.dateOfCall).toISOString().split("T")[0] : ""}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="manager">Manager *</Label>
                    <Input
                        id="manager"
                        name="manager"
                        value={formData.manager}
                        onChange={handleChange}
                        required
                        disabled
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                    <Label htmlFor="wasTreatmentEffective" className="cursor-pointer">Was treatment effective? (Initial)</Label>
                    <Switch
                        id="wasTreatmentEffective"
                        checked={formData.wasTreatmentEffective}
                        onCheckedChange={(checked) => handleSwitchChange("wasTreatmentEffective", checked)}
                    />
                </div>

                <div>
                    <Label htmlFor="technicianFeedback">Technician Feedback (Initial)</Label>
                    <Textarea
                        id="technicianFeedback"
                        name="technicianFeedback"
                        value={formData.technicianFeedback}
                        onChange={handleChange}
                        placeholder="Enter initial technician feedback..."
                        rows={3}
                        className="resize-none mt-2"
                    />
                </div>
            </div>

            <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                    <Label htmlFor="wasTreatmentEffective1" className="cursor-pointer">Was treatment effective? (Follow-up)</Label>
                    <Switch
                        id="wasTreatmentEffective1"
                        checked={formData.wasTreatmentEffective1}
                        onCheckedChange={(checked) => handleSwitchChange("wasTreatmentEffective1", checked)}
                    />
                </div>

                <div>
                    <Label htmlFor="technicianFeedback1">Technician Feedback (Follow-up)</Label>
                    <Textarea
                        id="technicianFeedback1"
                        name="technicianFeedback1"
                        value={formData.technicianFeedback1}
                        onChange={handleChange}
                        placeholder="Enter follow-up technician feedback..."
                        rows={3}
                        className="resize-none mt-2"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                <Label htmlFor="refReqToSpecialist" className="cursor-pointer">Referral required to specialist?</Label>
                <Switch
                    id="refReqToSpecialist"
                    checked={formData.refReqToSpecialist}
                    onCheckedChange={(checked) => handleSwitchChange("refReqToSpecialist", checked)}
                />
            </div>

            <div className="flex justify-end pt-2">
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex min-w-36 items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <RiLoaderLine className="size-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <RiCheckLine className="size-4" />
                            Save Feedback
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
