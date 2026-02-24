"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { HiNavbar } from "@/components/HiNavbar"
import { Button } from "@/components/Button"
import {
	Drawer,
	DrawerBody,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/Drawer"
import { RiHomeLine, RiArrowRightSLine, RiMenuLine } from "@remixicon/react"

const modules = [
	{
		name: "Your Dashboard",
		href: "/h&i",
		icon: "RiBarChart2Line",
	},
	{
		name: "Case Resolution",
		href: "/h&i/caseResolution",
		icon: "RiFileList2Line",
	},
	{
		name: "IP Admission",
		href: "/h&i/ipAdmission",
		icon: "RiHospitalLine",
	},
	{
		name: "Member Feedback",
		href: "/h&i/memberFeedback",
		icon: "RiPhoneLine",
	},
	{
		name: "Grievance",
		href: "/h&i/grievance",
		icon: "RiUserVoiceLine",
	},
	{
		name: "Happiness Score",
		href: "/h&i/happinessScore",
		icon: "RiEmotionHappyLine",
	},
]

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const pathname = usePathname()
	const isMainPage = pathname === "/h&i"
	// const currentModule = modules.find((m) => m.href === pathname)

	return (
		<div className="flex min-h-screen flex-col">
			<HiNavbar
				mobileMenu={
					!isMainPage ? (
						<div className="lg:hidden">
							<Drawer>
								<DrawerTrigger asChild>
									<Button variant="ghost" className="flex items-center gap-2">
										<RiMenuLine className="size-5" aria-hidden="true" />
										<span className="sr-only">Menu</span>
									</Button>
								</DrawerTrigger>
								<DrawerContent className="sm:max-w-lg">
									<DrawerHeader>
										<DrawerTitle>H&amp;I Modules</DrawerTitle>
									</DrawerHeader>
									<DrawerBody>
										<nav className="flex flex-1 flex-col space-y-2">
											<DrawerClose asChild>
												<Link
													href="/h&i"
													className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
												>
													<RiHomeLine className="size-5" />
													Home
												</Link>
											</DrawerClose>
											<div className="my-2 border-t border-gray-200 dark:border-gray-800" />
											{modules.map((module) => (
												<DrawerClose asChild key={module.href}>
													<Link
														href={module.href}
														className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === module.href
																? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400"
																: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
															}`}
													>
														<RiArrowRightSLine className="size-4" />
														{module.name}
													</Link>
												</DrawerClose>
											))}
										</nav>
									</DrawerBody>
								</DrawerContent>
							</Drawer>
						</div>
					) : null
				}
			/>
			<div className="flex flex-1">
				{/* Sidebar Navigation */}
				{!isMainPage && (
					<div className="hidden w-64 border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900 lg:block">
						<div className="sticky top-16 space-y-1 overflow-y-auto p-4">
							<Link
								href="/h&i"
								className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
							>
								<RiHomeLine className="size-5" />
								Home
							</Link>

							<div className="my-4 border-t border-gray-200 dark:border-gray-800" />

							<p className="px-4 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
								Modules
							</p>

							{modules.map((module) => {
								const isActive = pathname === module.href
								return (
									<Link
										key={module.href}
										href={module.href}
										className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isActive
												? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400"
												: "text-gray-600 hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
											}`}
									>
										<RiArrowRightSLine
											className={`size-4 ${isActive ? "opacity-100" : "opacity-0"}`}
										/>
										{module.name}
									</Link>
								)
							})}
						</div>
					</div>
				)}

				{/* Main Content */}
				<div className="flex-1 min-w-0 p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
					<div className="pt-4 sm:pt-6">{children}</div>
				</div>
			</div>
		</div>
	)
}
