"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { RiAddLine, RiEdit2Line } from "@remixicon/react";
import NewCaseForm from "./_components/NewCaseForm";
import UpdateCaseList from "./_components/UpdateCaseList";

type View = "options" | "new" | "update";

export default function Page() {
  const [view, setView] = useState<View>("options");

  return (
    <div className="space-y-6">
      {view === "options" && (
        <div>
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Case Resolution
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              onClick={() => setView("new")}
              className="group"
            >
              <Card className="border-2 border-dashed border-gray-300 bg-white p-8 transition-all duration-200 hover:border-amber-400 hover:bg-amber-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-amber-500/10">
                <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 group-hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:group-hover:bg-amber-500/30">
                  <RiAddLine className="size-7" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
                  New Case
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Register a new case resolution
                </p>
              </Card>
            </button>

            <button
              onClick={() => setView("update")}
              className="group"
            >
              <Card className="border-2 border-dashed border-gray-300 bg-white p-8 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-blue-500/10">
                <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 group-hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:group-hover:bg-blue-500/30">
                  <RiEdit2Line className="size-7" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Update Case
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  View and update existing cases
                </p>
              </Card>
            </button>
          </div>
        </div>
      )}

      {view === "new" && (
        <NewCaseForm onBack={() => setView("options")} />
      )}

      {view === "update" && (
        <UpdateCaseList onBack={() => setView("options")} />
      )}
    </div>
  );
}
