"use client"

import { Button } from "@/components/Button"
import { Checkbox } from "@/components/Checkbox"
import { RiMoreFill } from "@remixicon/react"
import { Row } from "@tanstack/react-table"
import { useState } from "react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/Dropdown"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select"

import { User } from "@/data/schema"
import { api } from "@/lib/api"
import { useDropdownData } from "@/hooks/useDropdownData"
import { useAuthStore } from "@/store/auth"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const user = row.original as User
  const { data: locationOptions } = useDropdownData("TR LOCATION")
  const { user: currentUser } = useAuthStore()
  
  const [formData, setFormData] = useState({
    empId: user.empId || "",
    name: user.name || "",
    email: user.email || "",
    role: user.role || "staff",
    locationId: user.locationId || "",
    password: "",
    managerLocation: (user.role === "manager" && user.managerLocation) ? user.managerLocation : [],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: "staff" | "manager" | "superadmin") => {
    setFormData((prev) => ({
      ...prev,
      role: value,
      managerLocation: value === "manager" ? prev.managerLocation : [],
    }))
  }

  const handleLocationToggle = (location: string) => {
    setFormData((prev) => ({
      ...prev,
      managerLocation: prev.managerLocation.includes(location)
        ? prev.managerLocation.filter((loc) => loc !== location)
        : [...prev.managerLocation, location],
    }))
  }

  const handleSave = async () => {
    if (!user.empId) {
      toast.error("User ID is missing")
      return
    }

    if (formData.role === "manager" && formData.managerLocation.length === 0) {
      toast.error("Please select at least one location for manager role")
      return
    }

    setIsLoading(true)
    try {
      const updateData: any = {
        empId: formData.empId,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        locationId: formData.locationId,
      }
      
      if (formData.password) {
        updateData.password = formData.password
      }

      if (formData.role === "manager") {
        updateData.managerLocation = formData.managerLocation
      }

      await api.put(`/auth/${user._id}`, updateData)
      toast.success("Staff updated successfully")
      setIsSheetOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Error updating staff:", error)
      toast.error("Failed to update staff")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user.empId) {
      toast.error("User ID is missing")
      return
    }

    if (!confirm(`Are you sure you want to delete ${user.name || user.email}?`)) {
      return
    }

    setIsLoading(true)
    try {
      await api.delete(`/auth/${user._id}`)
      toast.success("Staff deleted successfully")
      window.location.reload()
    } catch (error) {
      console.error("Error deleting staff:", error)
      toast.error("Failed to delete staff")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="group aspect-square p-1.5 hover:border hover:border-gray-300 data-[state=open]:border-gray-300 data-[state=open]:bg-gray-50 hover:dark:border-gray-700 data-[state=open]:dark:border-gray-700 data-[state=open]:dark:bg-gray-900"
          >
            <RiMoreFill
              className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-data-[state=open]:text-gray-700 group-hover:dark:text-gray-300 group-data-[state=open]:dark:text-gray-300"
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem onClick={() => setIsSheetOpen(true)}>
            Update
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDelete}
            disabled={currentUser?.empId === user.empId}
            className="text-red-600 focus:text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Update Staff</SheetTitle>
            <SheetDescription>
              Update staff information below
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="empId"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Employee ID
              </label>
              <input
                id="empId"
                name="empId"
                type="text"
                disabled
                value={formData.empId}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="role"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Role
              </label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="locationId"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Location ID
              </label>
              <Select
                value={formData.locationId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, locationId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.role === "manager" && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Manage Locations <span className="text-red-600">*</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select locations this manager can manage
                </p>
                <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                  {locationOptions.length > 0 ? (
                    locationOptions.map((location) => (
                      <div key={location} className="flex items-center gap-2">
                        <Checkbox
                          id={`edit-manager-loc-${location}`}
                          checked={formData.managerLocation.includes(location)}
                          onCheckedChange={() => handleLocationToggle(location)}
                        />
                        <label
                          htmlFor={`edit-manager-loc-${location}`}
                          className="cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {location}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No locations available</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Password (leave blank to keep current)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button
              variant="secondary"
              onClick={() => setIsSheetOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
