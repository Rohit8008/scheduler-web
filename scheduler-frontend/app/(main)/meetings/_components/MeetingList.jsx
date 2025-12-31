import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, Clock, Video, User, CheckCircle } from "lucide-react";
import React from "react";
import CancelMeetingButton from "./CancelMeetingButton";

const MeetingList = ({ meetings, type }) => {
  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          No {type} meetings
        </h2>
        <p className="text-lg text-gray-600">
          {type === "upcoming"
            ? "You don't have any upcoming meetings scheduled"
            : "You don't have any past meetings"}
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {meetings.map((meeting) => {
        return (
          <Card
            key={meeting.id}
            className="flex flex-col justify-between shadow-lg rounded-2xl border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-xl text-gray-900">{meeting.event.title}</CardTitle>
                {meeting.isMeetingRequest && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    Approved Request
                  </span>
                )}
              </div>
              <CardDescription className="flex items-center gap-2 text-base mt-2">
                <User className="h-4 w-4" />
                <span>with {meeting.name}</span>
              </CardDescription>
              {meeting.additionalInfo && (
                <CardDescription className="mt-2 text-sm italic text-gray-600 bg-gray-50 p-2 rounded-lg">
                  &quot;{meeting.additionalInfo}&quot;
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium">
                  {format(new Date(meeting.startTime), "MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-medium">
                  {format(new Date(meeting.startTime), "h:mm a")} -{" "}
                  {format(new Date(meeting.endTime), "h:mm a")}
                </span>
              </div>
              {meeting.meetLink && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Video className="h-4 w-4 text-green-600" />
                  </div>
                  <a
                    href={meeting.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Join Meeting
                  </a>
                </div>
              )}
            </CardContent>
            {!meeting.isMeetingRequest && type === "upcoming" && (
              <CardFooter className="border-t border-gray-100 pt-4">
                <CancelMeetingButton meetingId={meeting.id}/>
              </CardFooter>
            )}
            {meeting.isMeetingRequest && (
              <CardFooter className="border-t border-gray-100 pt-4">
                <div className="text-sm text-gray-600 text-center w-full">
                  <p>This was created from an approved meeting request.</p>
                  <p className="text-xs mt-1">Contact {meeting.name} to reschedule.</p>
                </div>
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default MeetingList;
