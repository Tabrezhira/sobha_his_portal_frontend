"use client"

import { columns } from "@/app/(main)/staff/_components/data-table/columns"
import { DataTable } from "@/app/(main)/staff/_components/data-table/DataTable"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Checkbox } from "@/components/Checkbox"
import { User } from "@/data/schema"
import { useDropdownData } from "@/hooks/useDropdownData"
import { api } from "@/lib/api"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/Select"

export default function StaffPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(20)
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const { data: locationOptions } = useDropdownData("TR LOCATION")
  const [createFormData, setCreateFormData] = useState({
    empId: "",
    name: "",
    email: "",
    password: "",
    role: "staff" as "staff" | "manager" | "superadmin",
    locationId: "",
    managerLocation: [] as string[],
  })
  const [editFormData, setEditFormData] = useState({
    _id: "",
    empId: "",
    name: "",
    email: "",
    password: "",
    role: "staff" as "staff" | "manager" | "superadmin",
    locationId: "",
    managerLocation: [] as string[],
  })

  const { data: response, isLoading, isFetching, error } = useQuery({
    queryKey: ["staff", { search, pageIndex, pageSize }],
    queryFn: async () => {
      const response = await api.get("/auth", {
        params: { q: search || undefined, page: pageIndex + 1, limit: pageSize },
      })

      const items = response?.data?.items ?? response?.data?.data ?? response?.data
      const total = response?.data?.total ?? (Array.isArray(items) ? items.length : 0)

      return {
        items: Array.isArray(items) ? (items as User[]) : [],
        total: typeof total === "number" ? total : 0,
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const data = response?.items ?? []
  const totalRows = response?.total ?? 0

  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCreateFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLocationToggle = (location: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditFormData((prev) => ({
        ...prev,
        managerLocation: prev.managerLocation.includes(location)
          ? prev.managerLocation.filter((loc) => loc !== location)
          : [...prev.managerLocation, location],
      }))
    } else {
      setCreateFormData((prev) => ({
        ...prev,
        managerLocation: prev.managerLocation.includes(location)
          ? prev.managerLocation.filter((loc) => loc !== location)
          : [...prev.managerLocation, location],
      }))
    }
  }

  const handleRoleChange = (value: "staff" | "manager" | "superadmin", isEdit: boolean = false) => {
    if (isEdit) {
      setEditFormData((prev) => ({
        ...prev,
        role: value,
        managerLocation: value === "manager" ? prev.managerLocation : [],
      }))
    } else {
      setCreateFormData((prev) => ({
        ...prev,
        role: value,
        managerLocation: value === "manager" ? prev.managerLocation : [],
      }))
    }
  }

  const handleEditStaff = (user: User) => {
    if (!user._id) return
    setEditingUserId(user._id)
    setEditFormData({
      _id: user._id,
      empId: user.empId || "",
      name: user.name || "",
      email: user.email || "",
      password: "", // Don't pre-fill password
      role: (user.role || "staff") as "staff" | "manager" | "superadmin",
      locationId: user.locationId || "",
      managerLocation: (user.role === "manager" && user.managerLocation) ? user.managerLocation : [],
    })
    setIsEditSheetOpen(true)
  }

  const handleCreateStaff = async () => {
    if (!createFormData.empId || !createFormData.name || !createFormData.email || !createFormData.password || !createFormData.locationId) {
      toast.error("All fields are required")
      return
    }

    if (createFormData.role === "manager" && createFormData.managerLocation.length === 0) {
      toast.error("Please select at least one location for manager role")
      return
    }

    setIsCreating(true)
    try {
      const payload = {
        empId: createFormData.empId,
        name: createFormData.name,
        email: createFormData.email,
        password: createFormData.password,
        role: createFormData.role,
        locationId: createFormData.locationId,
        ...(createFormData.role === "manager" && { managerLocation: createFormData.managerLocation }),
      }

      await api.post("/auth", payload)
      toast.success("Staff created successfully")
      setIsCreateSheetOpen(false)
      setCreateFormData({
        empId: "",
        name: "",
        email: "",
        password: "",
        role: "staff",
        locationId: "",
        managerLocation: [],
      })
      await queryClient.invalidateQueries({ queryKey: ["staff"] })
    } catch (error) {
      console.error("Error creating staff:", error)
      toast.error("Failed to create staff")
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateStaff = async () => {
    if (!editFormData.empId || !editFormData.name || !editFormData.email || !editFormData.locationId) {
      toast.error("All fields are required")
      return
    }

    if (editFormData.role === "manager" && editFormData.managerLocation.length === 0) {
      toast.error("Please select at least one location for manager role")
      return
    }

    setIsUpdating(true)
    try {
      const payload: any = {
        empId: editFormData.empId,
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role,
        locationId: editFormData.locationId,
      }

      // Only include password if it's not empty
      if (editFormData.password) {
        payload.password = editFormData.password
      }

      // Only include managerLocation if role is manager
      if (editFormData.role === "manager") {
        payload.managerLocation = editFormData.managerLocation
      }

      await api.put(`/auth/${editFormData._id}`, payload)
      toast.success("Staff updated successfully")
      setIsEditSheetOpen(false)
      setEditFormData({
        _id: "",
        empId: "",
        name: "",
        email: "",
        password: "",
        role: "staff",
        locationId: "",
        managerLocation: [],
      })
      await queryClient.invalidateQueries({ queryKey: ["staff"] })
    } catch (error) {
      console.error("Error updating staff:", error)
      toast.error("Failed to update staff")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
          Staff List
        </h1>
        <Button variant="secondary" onClick={() => setIsCreateSheetOpen(true)}>
          Create Staff
        </Button>
      </div>
      <Card className="mt-4 sm:mt-6 lg:mt-10">
        {isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading staff...
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-500">
            Failed to load staff
          </p>
        )}
        {!isLoading && isFetching && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Updating results...
          </p>
        )}
        <DataTable
          data={data}
          columns={columns}
          onSearch={(value) => {
            setSearch(value)
            setPageIndex(0)
          }}
          pagination={{
            pageIndex,
            pageSize,
            pageCount: Math.max(1, Math.ceil(totalRows / pageSize)),
            totalRows,
            onPaginationChange: (updater) => {
              setPageIndex((prev) =>
                typeof updater === "function" ? updater({ pageIndex: prev, pageSize }).pageIndex : updater.pageIndex,
              )
            },
          }}
          onEditRow={handleEditStaff}
        />
      </Card>

      <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Create Staff</SheetTitle>
            <SheetDescription>
              Add a new staff member below
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="create-empId"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Employee ID <span className="text-red-600">*</span>
              </label>
              <input
                id="create-empId"
                name="empId"
                type="text"
                value={createFormData.empId}
                onChange={handleCreateInputChange}
                placeholder="Enter employee ID"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="create-name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Name <span className="text-red-600">*</span>
              </label>
              <input
                id="create-name"
                name="name"
                type="text"
                value={createFormData.name}
                onChange={handleCreateInputChange}
                placeholder="Enter name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="create-email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Email <span className="text-red-600">*</span>
              </label>
              <input
                id="create-email"
                name="email"
                type="email"
                value={createFormData.email}
                onChange={handleCreateInputChange}
                placeholder="Enter email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="create-password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Password <span className="text-red-600">*</span>
              </label>
              <input
                id="create-password"
                name="password"
                type="password"
                value={createFormData.password}
                onChange={handleCreateInputChange}
                placeholder="Enter password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="create-role"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Role
              </label>
              <Select
                value={createFormData.role}
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
                htmlFor="create-locationId"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Location ID <span className="text-red-600">*</span>
              </label>
              <Select
                value={createFormData.locationId}
                onValueChange={(value) => setCreateFormData((prev) => ({ ...prev, locationId: value }))}
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

            {createFormData.role === "manager" && (
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
                          id={`manager-loc-${location}`}
                          checked={createFormData.managerLocation.includes(location)}
                          onCheckedChange={() => handleLocationToggle(location)}
                        />
                        <label
                          htmlFor={`manager-loc-${location}`}
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
          </div>

          <SheetFooter className="mt-6">
            <Button
              variant="secondary"
              onClick={() => setIsCreateSheetOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateStaff} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Staff"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
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
                htmlFor="edit-empId"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Employee ID <span className="text-red-600">*</span>
              </label>
              <input
                id="edit-empId"
                name="empId"
                type="text"
                value={editFormData.empId}
                onChange={handleEditInputChange}
                placeholder="Enter employee ID"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Name <span className="text-red-600">*</span>
              </label>
              <input
                id="edit-name"
                name="name"
                type="text"
                value={editFormData.name}
                onChange={handleEditInputChange}
                placeholder="Enter name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Email <span className="text-red-600">*</span>
              </label>
              <input
                id="edit-email"
                name="email"
                type="email"
                value={editFormData.email}
                onChange={handleEditInputChange}
                placeholder="Enter email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Password (leave blank to keep current)
              </label>
              <input
                id="edit-password"
                name="password"
                type="password"
                value={editFormData.password}
                onChange={handleEditInputChange}
                placeholder="Enter new password"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="edit-role"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Role
              </label>
              <Select
                value={editFormData.role}
                onValueChange={(value) => handleRoleChange(value as "staff" | "manager" | "superadmin", true)}
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
                htmlFor="edit-locationId"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Location ID <span className="text-red-600">*</span>
              </label>
              <Select
                value={editFormData.locationId}
                onValueChange={(value) => setEditFormData((prev) => ({ ...prev, locationId: value }))}
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

            {editFormData.role === "manager" && (
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
                          id={`edit-loc-${location}`}
                          checked={editFormData.managerLocation.includes(location)}
                          onCheckedChange={() => handleLocationToggle(location, true)}
                        />
                        <label
                          htmlFor={`edit-loc-${location}`}
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
          </div>

          <SheetFooter className="mt-6">
            <Button
              variant="secondary"
              onClick={() => setIsEditSheetOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStaff} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Staff"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
