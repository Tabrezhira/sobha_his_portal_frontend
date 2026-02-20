import { Card } from "@/components/Card"
import { RiAddLine, RiArrowRightSLine, RiCheckLine, RiEdit2Line } from "@remixicon/react"

const options = [
	{
		title: "New Visit",
		description: "Create new IP admission",
		icon: RiAddLine,
		cardClass:
			"border-2 border-dashed border-gray-300 bg-white p-8 transition-all duration-200 hover:border-amber-400 hover:bg-amber-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-amber-500/10",
		iconClass:
			"inline-flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 group-hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:group-hover:bg-amber-500/30",
	},
	{
		title: "Repeat Visit",
		description: "Follow-up / revisit",
		icon: RiEdit2Line,
		cardClass:
			"border-2 border-dashed border-gray-300 bg-white p-8 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-blue-500/10",
		iconClass:
			"inline-flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 group-hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:group-hover:bg-blue-500/30",
	},
	{
		title: "Mark Discharged",
		description: "Close admission",
		icon: RiCheckLine,
		cardClass:
			"border-2 border-dashed border-gray-300 bg-white p-8 transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-emerald-500/10",
		iconClass:
			"inline-flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:group-hover:bg-emerald-500/30",
	},
	{
		title: "Change Case Type",
		description: "Normal / Critical",
		icon: RiArrowRightSLine,
		cardClass:
			"border-2 border-dashed border-gray-300 bg-white p-8 transition-all duration-200 hover:border-violet-400 hover:bg-violet-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-violet-500/10",
		iconClass:
			"inline-flex size-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 group-hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-400 dark:group-hover:bg-violet-500/30",
	},
]

export default function Page() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-50">
					IP Admission
				</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{options.map((option) => (
						<button key={option.title} type="button" className="group">
							<Card
								className={option.cardClass}
							>
								<span className={option.iconClass}>
									<option.icon className="size-7" />
								</span>
								<h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
									{option.title}
								</h3>
								<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
									{option.description}
								</p>
							</Card>
						</button>
					))}
				</div>
			</div>
		</div>
	)
}