"use client"

import { useState } from "react"
import { DriverForm } from "@/components/admin/driver-form"
import { DriverList } from "@/components/admin/driver-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Driver } from "@/lib/types"

export default function DriversPage() {
  const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>()
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Driver Management</h1>
        <p className="text-muted-foreground">Manage and monitor your drivers</p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Driver List</TabsTrigger>
          <TabsTrigger value="add">Add Driver</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <DriverList key={refreshKey} onEdit={setSelectedDriver} />
        </TabsContent>

        <TabsContent value="add">
          <DriverForm onSuccess={() => setRefreshKey((k) => k + 1)} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
