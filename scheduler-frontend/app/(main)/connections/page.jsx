"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ActiveConnections from "./_components/ActiveConnections";
import PendingSentConnections from "./_components/PendingSentConnections";
import PendingReceivedConnections from "./_components/PendingReceivedConnections";
import BlockedConnections from "./_components/BlockedConnections";
import SendConnectionModal from "./_components/SendConnectionModal";

export default function ConnectionsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Connections</h1>
          <p className="text-lg text-gray-600">
            Manage your professional network
          </p>
        </div>
        <SendConnectionModal onSuccess={handleRefresh} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending-sent">Pending Sent</TabsTrigger>
          <TabsTrigger value="pending-received">Pending Received</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ActiveConnections key={`active-${refreshTrigger}`} onUpdate={handleRefresh} />
        </TabsContent>

        <TabsContent value="pending-sent">
          <PendingSentConnections key={`sent-${refreshTrigger}`} onUpdate={handleRefresh} />
        </TabsContent>

        <TabsContent value="pending-received">
          <PendingReceivedConnections key={`received-${refreshTrigger}`} onUpdate={handleRefresh} />
        </TabsContent>

        <TabsContent value="blocked">
          <BlockedConnections key={`blocked-${refreshTrigger}`} onUpdate={handleRefresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
