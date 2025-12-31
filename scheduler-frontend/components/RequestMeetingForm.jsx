"use client";

import { createMeetingRequest } from "@/actions/meetingRequest";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import useFetch from "@/hooks/useFetch";
import { format, addDays, parseISO, addMinutes, isBefore, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar, Clock, CheckCircle2, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { syncBackendUser } from "@/lib/backendSync";

const RequestMeetingForm = ({ availability, username, userId }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [backendUser, setBackendUser] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    // No validation needed - we're only using date/time/additionalInfo
    // and date/time are required by the UI flow
  });

  // Generate available dates (next 30 days based on availability)
  const generateAvailableDates = () => {
    if (!availability) return [];

    const dates = [];
    const startDate = startOfDay(new Date());
    const endDate = addDays(startDate, 30);

    for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
      const dayOfWeek = format(date, "EEEE").toLowerCase();
      const dayAvailability = availability[dayOfWeek];

      if (dayAvailability && dayAvailability.isAvailable) {
        dates.push({
          value: format(date, "yyyy-MM-dd"),
          label: format(date, "EEEE, MMMM d, yyyy"),
          dayOfWeek: dayOfWeek,
        });
      }
    }

    return dates;
  };

  // Generate available time slots for selected date
  const generateTimeSlots = (dateStr) => {
    if (!dateStr || !availability) return [];

    const date = parseISO(dateStr);
    const dayOfWeek = format(date, "EEEE").toLowerCase();
    const dayAvailability = availability[dayOfWeek];

    if (!dayAvailability || !dayAvailability.isAvailable) {
      return [];
    }

    const slots = [];
    const startTime = parseISO(`${dateStr}T${dayAvailability.startTime}`);
    const endTime = parseISO(`${dateStr}T${dayAvailability.endTime}`);
    const slotDuration = 30; // Default 30 minutes
    const timeGap = availability.timeGap || 0;

    let currentTime = startTime;

    // If the date is today, start from the next available slot after the current time
    const now = new Date();
    if (format(now, "yyyy-MM-dd") === dateStr) {
      currentTime = isBefore(currentTime, now)
        ? addMinutes(now, timeGap)
        : currentTime;
    }

    while (currentTime < endTime) {
      const slotEnd = addMinutes(currentTime, slotDuration);

      if (slotEnd <= endTime) {
        const timeStr = format(currentTime, "HH:mm");
        const isSlotAvailable = !availability.bookings?.some((booking) => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          const slotStart = parseISO(`${dateStr}T${timeStr}`);

          return (
            (slotStart >= bookingStart && slotStart < bookingEnd) ||
            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
            (slotStart <= bookingStart && slotEnd >= bookingEnd)
          );
        });

        if (isSlotAvailable) {
          slots.push({
            value: timeStr,
            label: format(currentTime, "h:mm a"),
          });
        }
      }

      currentTime = slotEnd;
    }

    return slots;
  };

  const availableDates = generateAvailableDates();
  const availableTimeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  // Sync backend user on mount
  useEffect(() => {
    const syncUser = async () => {
      if (user?.uid) {
        try {
          const userData = await syncBackendUser(user);
          setBackendUser(userData);
        } catch (error) {
          console.error("Error syncing backend user:", error);
        }
      }
    };
    syncUser();
  }, [user]);

  useEffect(() => {
    if (selectedDate) {
      setValue("date", selectedDate);
      setSelectedTime(""); // Reset time when date changes
      setValue("time", "");
    }
  }, [selectedDate, setValue]);

  useEffect(() => {
    if (selectedTime) {
      setValue("time", selectedTime);
    }
  }, [selectedTime, setValue]);

  const { loading, data, fn: fnCreateMeetingRequest } = useFetch(createMeetingRequest);

  const onSubmit = async (formData) => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    if (!backendUser) {
      console.error("Backend user not loaded");
      return;
    }

    const startTime = parseISO(`${selectedDate}T${selectedTime}`);
    const endTime = addMinutes(startTime, 30); // Default 30 minute meeting

    const meetingRequestData = {
      requesterId: backendUser.id,
      receiverId: userId,
      title: `Meeting with ${username}`,
      description: formData.additionalInfo || "Meeting request",
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };

    await fnCreateMeetingRequest(meetingRequestData);
  };

  const handleClose = () => {
    setIsOpen(false);
    reset();
    setSelectedDate("");
    setSelectedTime("");
  };

  if (data) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button size="lg" className="w-full sm:w-auto">
            <Calendar className="mr-2 h-5 w-5" />
            Request Meeting
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2 text-blue-600">
              <Mail className="h-6 w-6" />
              Meeting Request Sent!
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-6 space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900 font-semibold mb-2">
                Your meeting request has been sent to {username}
              </p>
              <p className="text-sm text-blue-700">
                They've received an email notification and can approve or decline your request.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-gray-900 mb-2">What happens next?</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>If approved:</strong> Both of you will receive an email with a Google Meet link and calendar invitation (.ics file)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span><strong>If declined:</strong> You'll receive an email with their reason so you can try a different time</span>
                </li>
              </ul>
            </div>

            <p className="text-center text-sm text-gray-600">
              You can track the status in your <strong>Dashboard → Meetings → Sent</strong> tab
            </p>
          </div>
          <DrawerFooter>
            <Button onClick={handleClose}>Close</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Show login prompt if user is not logged in
  if (!user) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button size="lg" className="w-full sm:w-auto">
            <Calendar className="mr-2 h-5 w-5" />
            Request Meeting
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Login Required</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 text-center">
            <p className="text-gray-700 mb-4">
              Please log in to send a meeting request.
            </p>
            <Button onClick={() => window.location.href = '/sign-in'}>
              Go to Login
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          <Calendar className="mr-2 h-5 w-5" />
          Request Meeting
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Request a Meeting with {username}</DrawerTitle>
          <DrawerDescription>
            Send a meeting request. They'll receive an email notification to approve or decline.
          </DrawerDescription>
        </DrawerHeader>

        {/* Info Banner */}
        <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2 text-sm text-blue-800">
            <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>How it works:</strong> {username} will receive an email. If approved, both of you get a Google Meet link and calendar invite. If declined, you'll be notified with their reason.
            </div>
          </div>
        </div>

        <div className="overflow-y-auto px-6 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Date <span className="text-red-500">*</span>
              </label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a date" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      No available dates
                    </div>
                  ) : (
                    availableDates.map((date) => (
                      <SelectItem key={date.value} value={date.value}>
                        {date.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Time <span className="text-red-500">*</span>
                </label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">
                        No available time slots for this date
                      </div>
                    ) : (
                      availableTimeSlots.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {slot.label}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.time && (
                  <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
                )}
              </div>
            )}

            {/* Additional Notes */}
            {selectedTime && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  {...register("additionalInfo")}
                  placeholder="Any specific topics or agenda items?"
                  rows={4}
                />
              </div>
            )}

            {/* Submit Button */}
            {selectedTime && (
              <DrawerFooter className="px-0">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Scheduling..." : "Schedule Meeting"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            )}
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default RequestMeetingForm;
