"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { HiNavbar } from "@/components/HiNavbar"
import { TabNavigation, TabNavigationLink } from "@/components/TabNavigation"

const navigation = [
	{ name: "Case Resolution", href: "/h&i/caseResolution" },
	{ name: "Grievance", href: "/h&i/grievance" },
	{ name: "Happiness Score", href: "/h&i/happinessScore" },
	{ name: "IP Admission", href: "/h&i/ipAdmission" },
	{ name: "Member Feedback", href: "/h&i/memberFeedback" },
]

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const pathname = usePathname()

	return (
		<div className="flex min-h-screen flex-col">
			<HiNavbar />
			<div className="flex-1 p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
				{/* <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
					H&amp;I
				</h1> */}
				{/* <TabNavigation className="mt-4 sm:mt-6 lg:mt-10">
					{navigation.map((item) => (
						<TabNavigationLink
							key={item.name}
							asChild
							active={pathname === item.href}
						>
							<Link href={item.href}>{item.name}</Link>
						</TabNavigationLink>
					))}
				</TabNavigation> */}
				<div className="pt-6">{children}</div>
			</div>
		</div>
	)
}
