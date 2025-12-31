"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userNameSchema } from "@/app/lib/validators";
import { useEffect, useState } from "react";
import useFetch from "@/hooks/useFetch";
import { updateUserName } from "@/actions/users";
import { BarLoader } from "react-spinners";
import { getLatestUpdates } from "@/actions/dashboard";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Link as LinkIcon, Users, ArrowRight } from "lucide-react";

const Dashboard = () => {
  const { loading, userData, user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userNameSchema),
  });
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (userData?.username) {
      setValue("username", userData.username);
    }
  }, [userData, setValue]);

  const {
    data: responseData,
    error,
    loading: loadingUsername,
    fn: fnUpdateUsername,
  } = useFetch(updateUserName);

  const {
    loading: loadingUpdates,
    data: upcomingMeetings,
    fn: fnUpdates,
  } = useFetch(getLatestUpdates);

  useEffect(() => {
    if (user?.uid) {
      (async () => await fnUpdates(user.uid))();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (responseData) {
      toast.success("Username updated successfully!");
    }
  }, [responseData]);

  const onSubmit = async (data) => {
    try {
      if (!user?.uid) {
        toast.error("Please sign in to update username");
        return;
      }
      await fnUpdateUsername(data.username, user.uid);
    } catch (err) {
      console.log(err);
      toast.error("Something Went Wrong");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {userData?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-lg text-gray-600">
          Here's an overview of your scheduling activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
        <Card className="shadow-lg rounded-2xl border-blue-100 hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Meetings</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {upcomingMeetings?.length || 0}
                </h3>
              </div>
              <div className="bg-blue-100 p-4 rounded-2xl">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl border-purple-100 hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {userData?.events?.length || 0}
                </h3>
              </div>
              <div className="bg-purple-100 p-4 rounded-2xl">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl border-green-100 hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Link</p>
                <h3 className="text-xl font-bold text-gray-900 mt-2 truncate">
                  {userData?.username ? `/${userData.username}` : 'Set username'}
                </h3>
              </div>
              <div className="bg-green-100 p-4 rounded-2xl">
                <LinkIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings Section */}
      <Card className="shadow-lg rounded-2xl border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl text-gray-900">Upcoming Meetings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {!loadingUpdates ? (
            <div>
              {upcomingMeetings && upcomingMeetings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => {
                    return (
                      <div
                        key={meeting.id}
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300"
                      >
                        <div className="bg-blue-600 text-white p-3 rounded-lg flex-shrink-0">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {meeting.event.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            with <span className="font-medium">{meeting.name}</span>
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(new Date(meeting.startTime), "MMM d, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(new Date(meeting.startTime), "h:mm a")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-xl text-gray-600 mb-2">No Upcoming Meetings</p>
                  <p className="text-gray-500">
                    Your upcoming meetings will appear here
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your Unique Link Section */}
      <Card className="shadow-lg rounded-2xl border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl text-gray-900">Your Unique Link</CardTitle>
          </div>
          <p className="text-gray-600 mt-2">
            Share this link with others so they can book time with you
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Profile URL
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-600 font-medium">{origin}/</span>
                <Input
                  {...register("username")}
                  placeholder="username"
                  className="flex-1 bg-white border-gray-300"
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span className="font-medium">Error:</span> {errors.username.message}
                </p>
              )}
              {error && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span className="font-medium">Error:</span> {error?.message}
                </p>
              )}
            </div>
            {loadingUsername && (
              <BarLoader className="mb-4" width={"100%"} color="#2563eb" />
            )}
            <Button
              type="submit"
              disabled={loadingUsername}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              {loadingUsername ? "Updating..." : "Update Username"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default Dashboard;
