"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
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
import { RiLogoutBoxLine, RiUserLine } from "@remixicon/react"

export function HiNavbar({ mobileMenu }: { mobileMenu?: React.ReactNode }) {
  const router = useRouter()
  const { user, profile, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const userName = user?.name || profile?.name || "User"
  const userEmail = user?.email || profile?.email || ""

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left Side - Logo */}
        <div className="flex items-center gap-2">
          {mobileMenu}
          <Image
            src="/sobha-constructions-original.webp"
            alt="Sobha Constructions"
            width={120}
            height={40}
            className="hidden h-10 w-auto sm:block"
            priority
          />
        </div>

        {/* Right Side - User Info, Download, Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex sm:flex-col">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              H&I PORTAL
            </span>
          </div>

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
