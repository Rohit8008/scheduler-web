"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, UserX, Check, X, Shield } from "lucide-react";
import { format } from "date-fns";
import {
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  blockConnection
} from "@/actions/connections";
import { toast } from "react-toastify";
import { useState } from "react";

export default function ConnectionsList({ connections, type, onUpdate }) {
  const [actioningId, setActioningId] = useState(null);

  const handleAccept = async (connectionId) => {
    setActioningId(connectionId);
    try {
      await acceptConnectionRequest(connectionId);
      toast.success("Connection accepted! You can now send meeting requests to each other.");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast.error("Failed to accept connection");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (connectionId) => {
    if (!window.confirm("Are you sure you want to decline this connection request?")) {
      return;
    }

    setActioningId(connectionId);
    try {
      await rejectConnectionRequest(connectionId);
      toast.success("Connection request declined");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error rejecting connection:", error);
      toast.error("Failed to reject connection");
    } finally {
      setActioningId(null);
    }
  };

  const handleRemove = async (connectionId) => {
    if (!window.confirm("Are you sure you want to disconnect? This action cannot be undone.")) {
      return;
    }

    setActioningId(connectionId);
    try {
      await removeConnection(connectionId);
      toast.success("Connection removed");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error removing connection:", error);
      toast.error("Failed to remove connection");
    } finally {
      setActioningId(null);
    }
  };

  const handleBlock = async (connectionId) => {
    if (!window.confirm("Are you sure you want to block this user? They won't be able to send you connection requests.")) {
      return;
    }

    setActioningId(connectionId);
    try {
      await blockConnection(connectionId);
      toast.success("User blocked");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
    } finally {
      setActioningId(null);
    }
  };

  if (connections.length === 0) {
    return (
      <Card className="shadow-lg border-gray-200">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {type === "active" && "No Active Connections"}
            {type === "pending-sent" && "No Pending Sent Requests"}
            {type === "pending-received" && "No Pending Received Requests"}
            {type === "blocked" && "No Blocked Users"}
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            {type === "active" && "You haven't connected with anyone yet. Send a connection request to get started!"}
            {type === "pending-sent" && "You haven't sent any connection requests yet."}
            {type === "pending-received" && "No one has sent you a connection request yet."}
            {type === "blocked" && "You haven't blocked any users."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {connections.map((connection) => {
        const otherUser = connection.senderName && connection.senderEmail ?
          { name: connection.senderName, email: connection.senderEmail } :
          { name: connection.receiverName, email: connection.receiverEmail };

        return (
          <Card key={connection.id} className="shadow-lg border-gray-200 hover:shadow-xl transition-all">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                {otherUser.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm">
                <Mail className="h-3 w-3" />
                {otherUser.email}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {connection.status === "ACCEPTED" && connection.connectedAt && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span>Connected {format(new Date(connection.connectedAt), "MMM d, yyyy")}</span>
                </div>
              )}

              {connection.status === "PENDING" && type === "pending-sent" && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  <span>Sent {format(new Date(connection.createdAt), "MMM d, yyyy")}</span>
                </div>
              )}

              {connection.status === "PENDING" && type === "pending-received" && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  <span>Received {format(new Date(connection.createdAt), "MMM d, yyyy")}</span>
                </div>
              )}

              {connection.message && type === "pending-received" && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-sm text-gray-700 italic">"{connection.message}"</p>
                </div>
              )}

              {connection.status === "BLOCKED" && (
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <Shield className="h-4 w-4" />
                  <span>Blocked</span>
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t border-gray-100 pt-3 flex gap-2">
              {type === "active" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(connection.id)}
                  disabled={actioningId === connection.id}
                  className="w-full gap-2"
                >
                  <UserX className="h-3 w-3" />
                  {actioningId === connection.id ? "Removing..." : "Disconnect"}
                </Button>
              )}

              {type === "pending-sent" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(connection.id)}
                  disabled={actioningId === connection.id}
                  className="w-full"
                >
                  {actioningId === connection.id ? "Canceling..." : "Cancel Request"}
                </Button>
              )}

              {type === "pending-received" && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAccept(connection.id)}
                    disabled={actioningId === connection.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <Check className="h-3 w-3" />
                    {actioningId === connection.id ? "Accepting..." : "Accept"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReject(connection.id)}
                    disabled={actioningId === connection.id}
                    className="flex-1 gap-2"
                  >
                    <X className="h-3 w-3" />
                    {actioningId === connection.id ? "Rejecting..." : "Reject"}
                  </Button>
                </>
              )}

              {type === "blocked" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(connection.id)}
                  disabled={actioningId === connection.id}
                  className="w-full"
                >
                  {actioningId === connection.id ? "Unblocking..." : "Unblock"}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
