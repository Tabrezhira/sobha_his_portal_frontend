import Link from "next/link"

import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
// import { ProgressBar } from "@/components/ProgressBar"
import {
  RiBarChart2Line,
  RiEmotionHappyLine,
  RiFileList2Line,
  RiHospitalLine,
  RiPhoneLine,
  RiUserVoiceLine,
} from "@remixicon/react"

const summaryCards = [
  {
    name: "Open Cases",
    value: "7",
    subtitle: "Case Resolution",
    icon: RiFileList2Line,
    tone: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
  },
  {
    name: "Active Admissions",
    value: "0",
    subtitle: "IP + Hospital Cases",
    icon: RiHospitalLine,
    tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  },
  {
    name: "Grievance Pending",
    value: "0",
    subtitle: "Not closed",
    icon: RiUserVoiceLine,
    tone: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
  },
  {
    name: "Happiness Survey",
    value: "0",
    subtitle: "Yesterday",
    icon: RiEmotionHappyLine,
    tone: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-400/10 dark:text-fuchsia-300",
  },
  {
    name: "Calls Made",
    value: "7 / 50",
    subtitle: "Member Feedback",
    icon: RiPhoneLine,
    tone: "bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300",
  },
]

const modules = [
  {
    name: "HIS Portal",
    description: "Open HIS portal",
    href: "/",
    icon: RiBarChart2Line,
    badge: "Dashboard",
    gradient:
      "from-indigo-50 via-white to-indigo-100 dark:from-indigo-500/10 dark:via-gray-950 dark:to-indigo-500/10",
  },
  {
    name: "Case Resolution",
    description: "New / update cases",
    href: "/h&i/caseResolution",
    icon: RiFileList2Line,
    badge: "Tracker",
    gradient:
      "from-amber-50 via-white to-amber-100 dark:from-amber-500/10 dark:via-gray-950 dark:to-amber-500/10",
  },
  {
    name: "IP Admission",
    description: "Admissions tracker",
    href: "/h&i/ipAdmission",
    icon: RiHospitalLine,
    badge: "IP",
    gradient:
      "from-emerald-50 via-white to-emerald-100 dark:from-emerald-500/10 dark:via-gray-950 dark:to-emerald-500/10",
  },
  {
    name: "Member Feedback",
    description: "Call & record feedback",
    href: "/h&i/memberFeedback",
    icon: RiPhoneLine,
    badge: "Survey",
    gradient:
      "from-cyan-50 via-white to-cyan-100 dark:from-cyan-500/10 dark:via-gray-950 dark:to-cyan-500/10",
  },
  {
    name: "Grievance",
    description: "Register & track issues",
    href: "/h&i/grievance",
    icon: RiUserVoiceLine,
    badge: "Grievance",
    gradient:
      "from-rose-50 via-white to-rose-100 dark:from-rose-500/10 dark:via-gray-950 dark:to-rose-500/10",
  },
  {
    name: "Happiness Score",
    description: "Survey & save score",
    href: "/h&i/happinessScore",
    icon: RiEmotionHappyLine,
    badge: "Score",
    gradient:
      "from-fuchsia-50 via-white to-fuchsia-100 dark:from-fuchsia-500/10 dark:via-gray-950 dark:to-fuchsia-500/10",
  },
]

export default function Page() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 p-6 shadow-sm dark:border-gray-900 dark:from-indigo-500/10 dark:via-gray-950 dark:to-fuchsia-500/10 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
              Manager Summary
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50">
              H&amp;I Portal Overview
            </h2>
          </div>
          <Badge variant="neutral">Today: {new Date().toLocaleDateString("en-GB")}</Badge>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {summaryCards.map((item) => (
            <Card
              key={item.name}
              className="flex items-center justify-between gap-3 border-none bg-white/90 p-4 shadow-sm dark:bg-gray-950/80"
            >
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {item.name}
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {item.subtitle}
                </p>
              </div>
              <span
                className={`inline-flex size-10 items-center justify-center rounded-full ${item.tone}`}
              >
                <item.icon className="size-5" aria-hidden="true" />
              </span>
            </Card>
          ))}
        </div>

        {/* <div className="mt-6 rounded-2xl bg-white/90 p-5 shadow-sm dark:bg-gray-950/80">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              Your Data Accuracy
            </p>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              99%
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={99} max={100} variant="success" />
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Summary updated.
          </p>
        </div> */}
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
            Modules
          </h3>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Tap a card to open
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((item) => (
            <Link key={item.name} href={item.href} className="group">
              <Card
                className={`h-full border-none bg-gradient-to-br ${item.gradient} p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/90 text-gray-900 shadow-sm dark:bg-gray-950/70 dark:text-gray-50">
                    <item.icon className="size-6" aria-hidden="true" />
                  </span>
                  <Badge variant="neutral">{item.badge}</Badge>
                </div>
                <h4 className="mt-4 text-base font-semibold text-gray-900 dark:text-gray-50">
                  {item.name}
                </h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
