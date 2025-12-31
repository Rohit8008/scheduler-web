import { getUserByUsername } from "@/actions/users";
import { getUserAvailabilityByUsername } from "@/actions/availability";
import EventCard from "@/components/EventCard";
import RequestMeetingForm from "@/components/RequestMeetingForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, User } from "lucide-react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata({ params }) {
  const { username } = await params;

  const user = await getUserByUsername(username);
  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  return{
    title:`${user.name}'s Profile | Scheduler`,
    description:`Book an event with ${user.name}. View available public events and schedules.`,
  }
}

const UserPage = async ({ params }) => {
  const { username } = await params;

  const user = await getUserByUsername(username);
  if (!user) {
    notFound();
  }

  // Fetch user availability
  const availability = await getUserAvailabilityByUsername(username);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Avatar className="w-32 h-32 border-4 border-blue-100 shadow-md">
              <AvatarImage src={user.imageUrl} alt={user.name} />
              <AvatarFallback className="text-4xl bg-blue-600 text-white">
                {user.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-3 text-gray-900">{user.name}</h1>
              <p className="text-lg text-gray-600 mb-4">
                Welcome to my scheduling page. Select an event below to book time with me.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
                  <User className="h-4 w-4" />
                  <span className="text-sm">@{username}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{user.events?.length || 0} Public Events</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Section */}
        {availability && (
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-3xl font-bold text-gray-900">My Availability</h2>
              <RequestMeetingForm
                availability={availability}
                username={user.name}
                userId={availability.userId}
              />
            </div>
            <Card className="shadow-lg border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Weekly Schedule
                </CardTitle>
                <CardDescription>
                  Available time slots for booking meetings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
                    const dayData = availability[day];
                    const isAvailable = dayData?.isAvailable;

                    return (
                      <div
                        key={day}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border ${
                          isAvailable
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2 sm:mb-0">
                          <div className={`w-3 h-3 rounded-full ${
                            isAvailable ? "bg-green-500" : "bg-gray-300"
                          }`} />
                          <span className="font-semibold text-gray-900 capitalize min-w-[100px]">
                            {day}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-6 sm:ml-0">
                          {isAvailable ? (
                            <>
                              <Clock className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-gray-700">
                                {dayData.startTime} - {dayData.endTime}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">Not Available</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {availability.timeGap > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Minimum {availability.timeGap} minutes gap between meetings
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Events Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Available Events</h2>
          {user.events.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">No Public Events Available</p>
              <p className="text-gray-500">
                This user hasn&apos;t created any public events yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {user.events.map((event) => {
                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    username={username}
                    isPublic
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
