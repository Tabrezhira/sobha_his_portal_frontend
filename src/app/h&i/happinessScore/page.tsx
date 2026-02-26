"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { Textarea } from "@/components/Textarea";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { CreateHappinessSurveyInput, IPatient } from "@/data/h&Ischema";
import { useAuthStore } from "@/store/auth";
import { dropdown } from "@/data/schema";
import { useDropdownDataQuery } from "@/hooks/useDropdownDataQuery";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function Page() {
	const [formData, setFormData] = useState<CreateHappinessSurveyInput>({
		date: new Date(),
		time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
		empNo: "",
		empName: "",
		emiratesId: "",
		insuranceId: "",
		trLocation: "",
		surveyor: "",
		q1: undefined,
		q2: undefined,
		q3: undefined,
		q4: undefined,
		q5: undefined,
		q6: undefined,
		overallRating: undefined,
		suggestion: "",
		happinessScore: 0,
		photoUrl: "",
		signatureUrl: "",
		photoId: "",
		signatureId: "",
	});

	const cameraInputRef = useRef<HTMLInputElement>(null);
	const galleryInputRef = useRef<HTMLInputElement>(null);
	const [photoPreview, setPhotoPreview] = useState<string>("");
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [searching, setSearching] = useState(false);
	const searchTimeoutRef = useRef<NodeJS.Timeout>();
	const { data: trLocationOptions = [] } = useDropdownDataQuery(dropdown.trLocation);
	const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
	const [todayCount, setTodayCount] = useState<number>(0);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { user, token } = useAuthStore();
	const surveyorName = user?.name || "";

	useEffect(() => {
		const fetchTodayCount = async () => {
			if (!surveyorName || !token) return;
			try {
				const curdUrl = process.env.NEXT_PUBLIC_CURD_API_URL;
				const response = await fetch(`${curdUrl}/happiness-survey/count/surveyor/${encodeURIComponent(surveyorName)}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (response.ok) {
					const data = await response.json();
					setTodayCount(data?.data?.count || 0);
				}
			} catch (error) {
				console.error("Error fetching today's count:", error);
			}
		};
		fetchTodayCount();
	}, [surveyorName, token]);

	const happinessScore = useMemo(() => {
		const q7Normalized = typeof formData.overallRating === "number" ? formData.overallRating / 2 : undefined;
		const values = [
			formData.q1,
			formData.q2,
			formData.q3,
			formData.q4,
			formData.q5,
			formData.q6,
			q7Normalized,
		];
		if (values.some((v) => typeof v !== "number")) {
			return "";
		}
		const sum = (values as number[]).reduce((a, b) => a + b, 0);
		const avg = sum / values.length;
		return Math.round(avg * 10) / 10;
	}, [formData]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "date" ? new Date(value) : value,
		}));

		if (name === "empNo" && value.length === 6) {
			checkEligibilityAndLoad(value);
		}
	};

	const checkEligibilityAndLoad = async (empId: string) => {
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		searchTimeoutRef.current = setTimeout(async () => {
			try {
				setSearching(true);
				const curdUrl = process.env.NEXT_PUBLIC_CURD_API_URL;
				const eligibilityRes = await fetch(`${curdUrl}/happiness-survey/check/emp/${empId}`, {
					headers: {
						...(token && { Authorization: `Bearer ${token}` }),
					},
				});
				const eligibilityData = await eligibilityRes.json();

				if (eligibilityData?.status === "OK") {
					const apiUrl = process.env.NEXT_PUBLIC_DROPDOWN_API_URL;
					const response = await fetch(`${apiUrl}/patients/emp/${empId}`, {
						headers: {
							...(token && { Authorization: `Bearer ${token}` }),
						},
					});
					if (response.ok) {
						const data: IPatient = await response.json();
						setFormData((prev) => ({
							...prev,
							empName: data.PatientName || "",
							emiratesId: data.emiratesId || "",
							insuranceId: data.insuranceId || "",
							trLocation: data.trLocation || "",
						}));
					}
					setNotification(null);
					return;
				}

				if (eligibilityData?.success && eligibilityData?.data) {
					const { lastSurveyDate, nextEligibleDate } = eligibilityData.data;
					setFormData((prev) => ({
						...prev,
						empName: "",
						emiratesId: "",
						insuranceId: "",
						trLocation: "",
					}));
					setNotification({
						type: "error",
						message: `Not eligible. Last survey: ${new Date(lastSurveyDate).toLocaleDateString("en-GB")}. Next eligible: ${new Date(nextEligibleDate).toLocaleDateString("en-GB")}.`,
					});
					return;
				}
			} catch (error) {
				console.error("Error fetching patient data:", error);
			} finally {
				setSearching(false);
			}
		}, 500);
	};

	const handleSelectNumber = (name: keyof CreateHappinessSurveyInput, value: number | undefined) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const ratingLabels: Record<number, string> = {
		1: "Very Poor",
		2: "Poor",
		3: "Average",
		4: "Good",
		5: "Excellent",
	};

	const renderCheckboxGroup = (name: keyof CreateHappinessSurveyInput, options: number[]) => (
		<div className="flex flex-wrap items-center gap-4">
			{options.map((option) => (
				<label key={option} className="flex items-center gap-3 text-lg text-gray-700 dark:text-gray-300">
					<Checkbox
						className="size-5"
						checked={formData[name] === option}
						onCheckedChange={(checked) => handleSelectNumber(name, checked ? option : undefined)}
					/>
					<span>
						{option}
						{name === "overallRating" ? "" : ratingLabels[option] ? ` - ${ratingLabels[option]}` : ""}
					</span>
				</label>
			))}
		</div>
	);

	const handleImageSelect = (file?: File | null) => {
		if (!file) return;
		const url = URL.createObjectURL(file);
		setPhotoPreview(url);
		setFormData((prev) => ({
			...prev,
			photoUrl: url,
			photoId: file.name,
		}));
	};

	const getCanvasPosition = (e: React.PointerEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		return { x: e.clientX - rect.left, y: e.clientY - rect.top };
	};

	const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const { x, y } = getCanvasPosition(e);
		ctx.beginPath();
		ctx.moveTo(x, y);
		setIsDrawing(true);
	};

	const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if (!isDrawing) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const { x, y } = getCanvasPosition(e);
		ctx.lineTo(x, y);
		ctx.strokeStyle = "#111827";
		ctx.lineWidth = 2;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.stroke();
	};

	const endDrawing = () => {
		setIsDrawing(false);
	};

	const clearSignature = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		setFormData((prev) => ({
			...prev,
			signatureUrl: "",
			signatureId: "",
		}));
	};

	const saveSignature = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const dataUrl = canvas.toDataURL("image/png");
		setFormData((prev) => ({
			...prev,
			signatureUrl: dataUrl,
			signatureId: "signature.png",
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.empNo || !formData.empName) {
			setNotification({
				type: "error",
				message: "Please fill in required employee details.",
			});
			return;
		}

		if (typeof formData.q1 !== "number" || typeof formData.q2 !== "number" ||
			typeof formData.q3 !== "number" || typeof formData.q4 !== "number" ||
			typeof formData.q5 !== "number" || typeof formData.q6 !== "number" ||
			typeof formData.overallRating !== "number") {
			setNotification({
				type: "error",
				message: "Please answer all survey questions (Q1-Q7).",
			});
			return;
		}

		try {
			setIsSubmitting(true);
			const curdUrl = process.env.NEXT_PUBLIC_CURD_API_URL;

			const submitData = {
				...formData,
				surveyor: surveyorName,
				happinessScore: typeof happinessScore === "number" ? happinessScore : parseFloat(happinessScore.toString()),
				photoBase64: photoPreview || undefined,
				signatureBase64: formData.signatureUrl || undefined,
			};

			const response = await fetch(`${curdUrl}/happiness-survey/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token && { Authorization: `Bearer ${token}` }),
				},
				body: JSON.stringify(submitData),
			});

			if (response.ok) {
				await response.json();
				setNotification({
					type: "success",
					message: "Survey submitted successfully!",
				});

				// Reset form
				setFormData({
					date: new Date(),
					time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
					empNo: "",
					empName: "",
					emiratesId: "",
					insuranceId: "",
					trLocation: "",
					surveyor: "",
					q1: undefined,
					q2: undefined,
					q3: undefined,
					q4: undefined,
					q5: undefined,
					q6: undefined,
					overallRating: undefined,
					suggestion: "",
					happinessScore: 0,
					photoUrl: "",
					signatureUrl: "",
					photoId: "",
					signatureId: "",
				});
				setPhotoPreview("");
				clearSignature();

				// Refresh today's count
				const countResponse = await fetch(`${curdUrl}/happiness-survey/count/surveyor/${encodeURIComponent(surveyorName)}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (countResponse.ok) {
					const data = await countResponse.json();
					setTodayCount(data?.data?.count || 0);
				}
			} else {
				const error = await response.json();
				setNotification({
					type: "error",
					message: error.message || "Failed to submit survey. Please try again.",
				});
			}
		} catch (error) {
			console.error("Error submitting survey:", error);
			setNotification({
				type: "error",
				message: "An error occurred while submitting the survey.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
					Happiness Survey
				</h2>
				<div className="rounded-lg bg-blue-100 px-6 py-3 dark:bg-blue-900/30">
					<p className="text-lg font-semibold text-blue-900 dark:text-blue-300">
						Today&apos;s Surveys: <span className="text-2xl">{todayCount}</span>
					</p>
				</div>
			</div>

			<form className="space-y-6" onSubmit={handleSubmit}>
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
					<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
						1. Employee Details
					</h3>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div>
							<Label className="text-lg" htmlFor="date">Date *</Label>
							<Input
								id="date"
								name="date"
								type="date"
								value={formData.date ? new Date(formData.date).toISOString().split("T")[0] : ""}
								onChange={handleChange}
								className="h-14 text-lg"
								disabled
								required
							/>
						</div>
						<div>
							<Label className="text-lg" htmlFor="time">Time *</Label>
							<Input
								id="time"
								name="time"
								type="time"
								value={formData.time}
								onChange={handleChange}
								className="h-14 text-lg"
								disabled
								required
							/>
						</div>
						<div>
							<Label className="text-lg" htmlFor="empNo">
								Employee No *
								{searching && <span className="ml-2 text-sm text-gray-500">(Searching...)</span>}
							</Label>
							<Input
								id="empNo"
								name="empNo"
								value={formData.empNo}
								onChange={handleChange}
								className="h-14 text-lg"
								required
								placeholder="Enter employee number"
							/>
						</div>
						<div>
							<Label className="text-lg" htmlFor="empName">Employee Name *</Label>
							<Input
								id="empName"
								name="empName"
								value={formData.empName}
								onChange={handleChange}
								className="h-14 text-lg"
								disabled
								required
								placeholder="Enter employee name"
							/>
						</div>
						<div>
							<Label className="text-lg" htmlFor="emiratesId">Emirates ID</Label>
							<Input
								id="emiratesId"
								name="emiratesId"
								value={formData.emiratesId || ""}
								onChange={handleChange}
								className="h-14 text-lg"
								disabled
								placeholder="Enter emirates ID"
							/>
						</div>
						<div>
							<Label className="text-lg" htmlFor="insuranceId">Insurance ID</Label>
							<Input
								id="insuranceId"
								name="insuranceId"
								value={formData.insuranceId || ""}
								onChange={handleChange}
								className="h-14 text-lg"
								disabled
								placeholder="Enter insurance ID"
							/>
						</div>
						<div>
							<Label className="text-lg" htmlFor="trLocation">TR Location</Label>
							<Select
								value={formData.trLocation || ""}
								onValueChange={(value) => setFormData((prev) => ({ ...prev, trLocation: value }))}
							>
								<SelectTrigger className="h-14 text-lg">
									<SelectValue placeholder="Select TR location" />
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
							<Label className="text-lg" htmlFor="surveyor">Surveyor</Label>
							<Input
								id="surveyor"
								name="surveyor"
								value={surveyorName}
								className="h-14 text-lg"
								placeholder="Enter surveyor name"
								disabled
							/>
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
						2. Survey Questions (1-5)
					</h3>
					<div className="space-y-5">
						<div>
							<Label className="text-lg">Q1 - How do you feel about the medical & health insurance setup in your TR? (1-5)</Label>
							{renderCheckboxGroup("q1", [1, 2, 3, 4, 5])}
						</div>
						<div>
							<Label className="text-lg">Q2 - Is the medical facility in your TR easily accessible when you need help? (1-5)</Label>
							{renderCheckboxGroup("q2", [1, 2, 3, 4, 5])}
						</div>
						<div>
							<Label className="text-lg">Q3 - Are you aware of the company health insurance, and have you ever used it? (1-5)</Label>
							{renderCheckboxGroup("q3", [1, 2, 3, 4, 5])}
						</div>
						<div>
							<Label className="text-lg">Q4 - Are the medical staff available when you need assistance? (1-5)</Label>
							{renderCheckboxGroup("q4", [1, 2, 3, 4, 5])}
						</div>
						<div>
							<Label className="text-lg">Q5 - If you have visited the medical department, were your concerns properly attended to? (1-5)</Label>
							{renderCheckboxGroup("q5", [1, 2, 3, 4, 5])}
						</div>
						<div>
							<Label className="text-lg">Q6 - If you faced any medical or health insurance issues, were they resolved satisfactorily? (1-5)</Label>
							{renderCheckboxGroup("q6", [1, 2, 3, 4, 5])}
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
						3. Overall Rating & Suggestions
					</h3>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label className="text-lg">Q7 - Overall rating of the medical & health insurance services at your TR (1-10)</Label>
							{renderCheckboxGroup("overallRating", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])}
						</div>
						<div>
							<Label className="text-lg">Happiness Score</Label>
							<Input value={happinessScore.toString()} disabled placeholder="Auto calculated" className="h-14 text-lg" />
						</div>
						<div className="md:col-span-2">
							<Label className="text-lg">Q8 - What can we improve in the medical or health insurance setup at your TR?</Label>
							<Textarea
								name="suggestion"
								value={formData.suggestion || ""}
								onChange={handleChange}
								className="min-h-32 text-lg"
								placeholder="Your suggestions"
								rows={4}
							/>
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
						4. Upload Photo
					</h3>
					<div className="flex flex-wrap items-center gap-4">
						<input
							ref={cameraInputRef}
							type="file"
							accept="image/*"
							capture="environment"
							className="hidden"
							onChange={(e) => handleImageSelect(e.target.files?.[0])}
						/>
						<input
							ref={galleryInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={(e) => handleImageSelect(e.target.files?.[0])}
						/>
						<Button
							type="button"
							variant="secondary"
							onClick={() => cameraInputRef.current?.click()}
							className="h-12 text-base"
						>
							Upload from Camera
						</Button>
						<Button
							type="button"
							variant="secondary"
							onClick={() => galleryInputRef.current?.click()}
							className="h-12 text-base"
						>
							Upload from Gallery
						</Button>
					</div>
					{photoPreview && (
						<div className="mt-4">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={photoPreview}
								alt="Uploaded preview"
								className="max-h-64 w-full rounded-lg object-contain"
							/>
						</div>
					)}
				</Card>

				<Card className="p-6">
					<h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
						5. Signature Pad
					</h3>
					<div className="space-y-4">
						<div className="rounded-lg border border-gray-200 dark:border-gray-700">
							<canvas
								ref={canvasRef}
								width={700}
								height={200}
								className="h-48 w-full touch-none rounded-lg bg-white"
								onPointerDown={startDrawing}
								onPointerMove={draw}
								onPointerUp={endDrawing}
								onPointerLeave={endDrawing}
							/>
						</div>
						<div className="flex flex-wrap gap-3">
							<Button type="button" variant="secondary" onClick={clearSignature} className="h-12 text-base">
								Clear
							</Button>
							<Button type="button" variant="secondary" onClick={saveSignature} className="h-12 text-base">
								Save Signature
							</Button>
						</div>
						{formData.signatureUrl && (
							<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={formData.signatureUrl}
									alt="Signature preview"
									className="max-h-40 w-full object-contain"
								/>
							</div>
						)}
					</div>
				</Card>

				<div className="flex justify-end">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Submitting..." : "Submit"}
					</Button>
				</div>
			</form>
		</div>
	);
}