"use client";
import { getUserAvailability } from "@/actions/availability";
import React, { useEffect, useState } from "react";
import { defaultAvailability } from "./data";
import AvailabilityForm from "./_components/AvailabilityForm";
import { useAuth } from "@/contexts/AuthContext";
import { PulseLoader } from "react-spinners";
import { Clock, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AvailabilityPage = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (user?.uid) {
        try {
          const data = await getUserAvailability(user.uid);
          setAvailability(data);
        } catch (error) {
          console.error("Error fetching availability:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAvailability();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Availability</h1>
        <p className="text-lg text-gray-600">
          Set your weekly availability for meetings
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
            <Info className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">How it works</h3>
            <p className="text-gray-700 text-sm">
              Select the days you're available and specify your working hours for each day.
              Add a minimum gap between meetings to give yourself buffer time.
              These settings will apply to all your event types.
            </p>
          </div>
        </div>
      </div>

      {/* Availability Form Card */}
      <Card className="shadow-lg rounded-2xl border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl text-gray-900">Weekly Schedule</CardTitle>
          </div>
          <CardDescription className="text-base mt-2">
            Configure your available time slots for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AvailabilityForm initialData={availability || defaultAvailability} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityPage;
