"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/store/auth"
import { ClinicHistoryResponse } from "@/data/h&Ischema"
import { Card } from "@/components/Card"

interface ClinicHistoryProps {
    empId: string;
    className?: string;
}

export default function ClinicHistory({ empId, className = "" }: ClinicHistoryProps) {
    const { token } = useAuthStore()

    const { data, isLoading, error } = useQuery<ClinicHistoryResponse>({
        queryKey: ["clinicHistory", empId, token],
        queryFn: async () => {
            if (!empId) return { data: [] }
            const url = new URL(`${process.env.NEXT_PUBLIC_DROPDOWN_API_URL}/clinic/history/${empId}`)
            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                if (response.status === 404) return { data: [] }
                throw new Error("Failed to fetch clinic history")
            }

            return await response.json()
        },
        enabled: !!token && !!empId,
        staleTime: 5 * 60 * 1000,
    })

    const historyItems = data?.data || [];

    return (
        <Card className={`flex flex-col p-0 overflow-hidden ${className}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50 flex items-center justify-between">
                    <span>Clinical History</span>
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {historyItems.length} records
                    </span>
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-50"></div>
                        <span className="ml-2 text-sm text-gray-500">Loading history...</span>
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                        <p className="text-sm text-red-600 dark:text-red-400">Failed to load history</p>
                    </div>
                )}

                {!isLoading && !error && historyItems.length === 0 && (
                    <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No previous clinical history found.</p>
                    </div>
                )}

                {!isLoading && !error && historyItems.map((item, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                        <div className="flex justify-between items-start mb-3 border-b border-gray-100 dark:border-gray-800/60 pb-2">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Date of Visit</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                                    {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div className="text-right max-w-[50%]">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Provider</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate" title={item.providerName}>
                                    {item.providerName || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Primary Diagnosis</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2" title={item.primaryDiagnosis}>
                                    {item.primaryDiagnosis || '-'}
                                </p>
                            </div>

                            {item.secondaryDiagnosis && item.secondaryDiagnosis.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Secondary Diagnosis</p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2" title={item.secondaryDiagnosis.join(', ')}>
                                        {item.secondaryDiagnosis.join(', ')}
                                    </p>
                                </div>
                            )}

                            {item.referral && (
                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/60 bg-blue-50/50 dark:bg-blue-900/10 -mx-4 -mb-4 p-4 rounded-b-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="flex-shrink-0 size-2 bg-blue-500 rounded-full"></span>
                                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Referral</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-blue-600/70 dark:text-blue-300/60">Type</p>
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{item.referralType || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-600/70 dark:text-blue-300/60">Visit Date</p>
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                                {item.visitDateReferral ? new Date(item.visitDateReferral).toLocaleDateString() : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
