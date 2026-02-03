"use client"

import { columns } from "@/app/(main)/staff/_components/data-table/columns"
import { DataTable } from "@/app/(main)/staff/_components/data-table/DataTable"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { User } from "@/data/schema"
import { api } from "@/lib/api"
import { useDropdownData } from "@/hooks/useDropdownData"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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

export default function StaffPage() {
  const [data, setData] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(20)
  const [totalRows, setTotalRows] = useState(0)
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const { data: locationOptions } = useDropdownData("TR LOCATION")
  const [createFormData, setCreateFormData] = useState({
    empId: "",
    name: "",
    email: "",
    password: "",
    role: "staff" as "staff" | "manager" | "superadmin",
    locationId: "",
  })

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await api.get("/auth", {
          params: { q: search || undefined, page: pageIndex + 1, limit: pageSize },
        })

        const items = response?.data?.items ?? response?.data?.data ?? response?.data
        const total = response?.data?.total ?? (Array.isArray(items) ? items.length : 0)
        
        if (isMounted) {
          setData(Array.isArray(items) ? items : [])
          setTotalRows(typeof total === "number" ? total : 0)
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load staff")
          setData([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [search, pageIndex, pageSize])

  const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCreateFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateStaff = async () => {
    if (!createFormData.empId || !createFormData.name || !createFormData.email || !createFormData.password || !createFormData.locationId) {
      toast.error("All fields are required")
      return
    }

    setIsCreating(true)
    try {
      await api.post("/auth", createFormData)
      toast.success("Staff created successfully")
      setIsCreateSheetOpen(false)
      setCreateFormData({
        empId: "",
        name: "",
        email: "",
        password: "",
        role: "staff",
        locationId: "",
      })
      window.location.reload()
    } catch (error) {
      console.error("Error creating staff:", error)
      toast.error("Failed to create staff")
    } finally {
      setIsCreating(false)
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
          <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
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
                onValueChange={(value) => setCreateFormData((prev) => ({ ...prev, role: value as "staff" | "manager" | "superadmin" }))}
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
    </>
  )
}
