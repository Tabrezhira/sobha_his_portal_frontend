"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/store/auth"
import { DataTable } from "./_components/table/DataTable"
import { columns, MemberFeedbackTableRow } from "./_components/table/columns"
import { MemberFeedbackDialog } from "./_components/FeedbackDialog"

export default function Page() {
	const [selectedRow, setSelectedRow] = useState<MemberFeedbackTableRow | null>(null)
	const { token } = useAuthStore()

	const { data = [], isLoading } = useQuery<MemberFeedbackTableRow[]>({
		queryKey: ["memberFeedbackData", token],
		queryFn: async () => {
			const url = new URL(`${process.env.NEXT_PUBLIC_DROPDOWN_API_URL}/clinic/manager-prioritized`)
			const response = await fetch(url.toString(), {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			})

			if (!response.ok) {
				throw new Error("Failed to fetch member feedback data")
			}

			const result = await response.json()
			const dataArray = Array.isArray(result?.data) ? result.data : []

			return dataArray.map((item: any) => ({
				...item, // Keep all the raw JSON data
				_id: item._id,
				date: item.date,
				time: item.time,
				empNo: item.empNo,
				name: item.employeeName || item.name,
				trLocation: item.trLocation,
				mobileNumber: item.mobileNumber,
				natureOfCase: item.natureOfCase,
				caseCategory: item.caseCategory,
				nurseAssessment: item.nurseAssessment,
				sentTo: item.sentTo,
				providerName: item.providerName,
				sickLeaveStatus: item.sickLeaveStatus,
				totalSickLeaveDays: item.totalSickLeaveDays,
				referral: item.referral,
				referredTo: item.referredToHospital || item.specialistType || item.referredTo,
				visitStatus: item.visitStatus,
			}))
		},
		enabled: !!token,
		staleTime: 5 * 60 * 1000,
	})

	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-50">
					Member Feedback
				</h2>
			</div>

			<div className="space-y-4">
				<div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
					<div className="p-4">
						{isLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-50"></div>
								<span className="ml-2 text-gray-500">Loading...</span>
							</div>
						) : (
							<DataTable
								columns={columns}
								data={data}
								hideFilterbar={true}
								onRowClick={(row) => setSelectedRow(row)}
							/>
						)}
					</div>
				</div>
			</div>

			<MemberFeedbackDialog
				isOpen={!!selectedRow}
				onClose={() => setSelectedRow(null)}
				data={selectedRow}
			/>
		</div>
	)
}