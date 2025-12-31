"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Mail, Video } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { approveMeetingRequest, rejectMeetingRequest } from "@/actions/meetingRequest";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const MeetingRequestList = ({ requests, type, onUpdate }) => {
  const [rejecting, setRejecting] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleApprove = async (requestId) => {
    setProcessing(true);
    try {
      await approveMeetingRequest(requestId);
      toast.success(
        "Meeting approved! Google Meet link created and emails with calendar invites sent to both parties.",
        { autoClose: 5000 }
      );
      onUpdate();
    } catch (error) {
      console.error("Error approving meeting request:", error);
      toast.error("Failed to approve meeting request");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejecting) return;

    setProcessing(true);
    try {
      await rejectMeetingRequest(rejecting, rejectionReason || "No reason provided");
      toast.success("Meeting request declined. Notification email sent to the requester.");
      setRejecting(null);
      setRejectionReason("");
      onUpdate();
    } catch (error) {
      console.error("Error rejecting meeting request:", error);
      toast.error("Failed to reject meeting request");
    } finally {
      setProcessing(false);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          No {type} meeting requests
        </h2>
        <p className="text-lg text-gray-600">
          {type === "received"
            ? "You don't have any meeting requests to review"
            : "You haven't sent any meeting requests"}
        </p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
            <AlertCircle className="h-3 w-3" />
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            <CheckCircle className="h-3 w-3" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => {
          const isReceived = type === "received";
          const otherPersonName = isReceived ? request.requesterName : request.receiverName;
          const otherPersonEmail = isReceived ? request.requesterEmail : request.receiverEmail;
          const isPending = request.status === "PENDING";

          return (
            <Card
              key={request.id}
              className="flex flex-col justify-between shadow-lg rounded-2xl border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl text-gray-900">{request.title}</CardTitle>
                  {getStatusBadge(request.status)}
                </div>
                <CardDescription className="flex items-center gap-2 text-base mt-2">
                  <User className="h-4 w-4" />
                  <span>
                    {isReceived ? "from" : "to"} {otherPersonName}
                  </span>
                </CardDescription>
                <CardDescription className="text-sm text-gray-500">
                  {otherPersonEmail}
                </CardDescription>
                {request.description && (
                  <CardDescription className="mt-2 text-sm italic text-gray-600 bg-gray-50 p-2 rounded-lg">
                    &quot;{request.description}&quot;
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">
                    {format(new Date(request.startTime), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium">
                    {format(new Date(request.startTime), "h:mm a")} -{" "}
                    {format(new Date(request.endTime), "h:mm a")}
                  </span>
                </div>
                {request.status === "REJECTED" && (
                  <div className="mt-3 space-y-2">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-600" />
                        <div>
                          <p className="text-sm font-semibold text-red-800 mb-1">Request Declined</p>
                          {request.rejectionReason && (
                            <p className="text-xs text-red-700"><strong>Reason:</strong> {request.rejectionReason}</p>
                          )}
                          {!isReceived && (
                            <p className="text-xs text-red-700 mt-2">You received an email notification with the details. You can send a new request with a different time.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {request.status === "APPROVED" && (
                  <>
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-2 text-sm text-green-800">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                        <div>
                          <p className="font-semibold mb-1">Meeting Confirmed!</p>
                          <p className="text-xs">Both parties received an email with the Google Meet link and a calendar invitation (.ics file).</p>
                        </div>
                      </div>
                    </div>
                    {request.meetLink && (
                      <div className="mt-3 text-center">
                        <a
                          href={request.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          <Video className="h-4 w-4" />
                          Join Google Meet
                        </a>
                      </div>
                    )}
                  </>
                )}
                {!isReceived && isPending && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2 text-sm text-blue-800">
                      <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                      <div>
                        <p className="font-semibold mb-1">Awaiting Response</p>
                        <p className="text-xs">An email notification was sent. You'll receive an email when they respond with a Google Meet link or rejection reason.</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              {isReceived && isPending && (
                <>
                  <div className="px-6 pb-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2 text-xs text-amber-800">
                        <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Approve:</strong> Creates Google Meet link, sends calendar invites to both.<br/>
                          <strong>Decline:</strong> Notifies requester via email with your reason.
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardFooter className="border-t border-gray-100 pt-4 flex gap-2">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      disabled={processing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => setRejecting(request.id)}
                      disabled={processing}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </CardFooter>
                </>
              )}
            </Card>
          );
        })}
      </div>

      {/* Rejection Dialog */}
      <Dialog open={!!rejecting} onOpenChange={() => setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Meeting Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this meeting request (optional)
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejecting(null);
                setRejectionReason("");
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={processing}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MeetingRequestList;
