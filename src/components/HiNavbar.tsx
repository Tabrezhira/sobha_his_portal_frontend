"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import { Button } from "@/components/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/Dropdown"
import { RiDownloadCloud2Line, RiLogoutBoxLine, RiUserLine } from "@remixicon/react"

export function HiNavbar({ mobileMenu }: { mobileMenu?: React.ReactNode }) {
  const router = useRouter()
  const { user, profile, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleDownload = () => {
    // Placeholder for download functionality
    alert("Download functionality to be implemented")
  }

  const userName = user?.name || profile?.name || "User"
  const userEmail = user?.email || profile?.email || ""

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left Side - Logo */}
        <div className="flex items-center gap-2">
          {mobileMenu}
          <div className="hidden size-10 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500 sm:flex">
            <span className="text-lg font-bold">M</span>
          </div>
          <div className="hidden sm:flex sm:flex-col">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              HAI PORTAL
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Dr MIRSHAD
            </span>
          </div>
        </div>

        {/* Right Side - User Info, Download, Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Download Button */}
          <Button
            variant="ghost"
            onClick={handleDownload}
            className="hidden sm:inline-flex"
          >
            <RiDownloadCloud2Line
              className="size-4 shrink-0"
              aria-hidden="true"
            />
            <span className="ml-2 hidden md:inline">Download</span>
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden flex-col text-left sm:flex">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-50">
                    {userName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {userEmail}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-1">
                <span className="text-sm font-semibold">{userName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {userEmail}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <RiUserLine className="mr-2 size-4" aria-hidden="true" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <RiLogoutBoxLine className="mr-2 size-4" aria-hidden="true" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
