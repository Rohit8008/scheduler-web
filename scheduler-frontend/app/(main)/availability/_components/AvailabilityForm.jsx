"use client";

import { availablitySchema } from "@/app/lib/validators";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { timeSlots } from "../data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/useFetch";
import { updateAvailability } from "@/actions/availability";
import { useAuth } from "@/contexts/AuthContext";

const AvailabilityForm = ({ initialData }) => {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(availablitySchema),
    defaultValues: { ...initialData },
  });

  const {
    fn: fnupdateAvailablity,
    loading,
    error,
  } = useFetch(updateAvailability);

  const onSubmit = async (data) => {
    if (!user?.uid) {
      console.error("User not authenticated");
      return;
    }
    await fnupdateAvailablity(data, user.uid);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Days Schedule */}
      <div className="space-y-4">
        {[
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ].map((day) => {
          const isAvailable = watch(`${day}.isAvailable`);

          return (
            <div
              key={day}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                isAvailable
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 sm:w-40">
                <Controller
                  name={`${day}.isAvailable`}
                  control={control}
                  render={({ field }) => {
                    return (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          setValue(`${day}.isAvailable`, checked);
                          if (!checked) {
                            setValue(`${day}.startTime`, "09:00");
                            setValue(`${day}.endTime`, "17:00");
                          }
                        }}
                        className="border-2"
                      />
                    );
                  }}
                />
                <span className="font-semibold text-gray-900 capitalize min-w-[90px]">
                  {day}
                </span>
              </div>

              {isAvailable && (
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <Controller
                    name={`${day}.startTime`}
                    control={control}
                    render={({ field }) => {
                      return (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-32 bg-white border-gray-300">
                            <SelectValue placeholder="Start Time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => {
                              return (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  <span className="text-gray-600 font-medium">to</span>
                  <Controller
                    name={`${day}.endTime`}
                    control={control}
                    render={({ field }) => {
                      return (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-32 bg-white border-gray-300">
                            <SelectValue placeholder="End Time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => {
                              return (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      );
                    }}
                  />
                  {errors[day]?.endTime && (
                    <span className="text-red-500 text-sm font-medium">
                      {errors[day].endTime.message}
                    </span>
                  )}
                </div>
              )}
              {!isAvailable && (
                <span className="text-gray-500 text-sm ml-8 sm:ml-0">
                  Not Available
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Time Gap Setting */}
      <div className="pt-6 border-t border-gray-200">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <label className="block font-semibold text-gray-900 mb-3 text-lg">
            Minimum Gap Between Meetings
          </label>
          <p className="text-gray-600 text-sm mb-4">
            Add buffer time between meetings to prepare or take a break
          </p>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              {...register("timeGap", {
                valueAsNumber: true,
              })}
              className="w-32 bg-white border-gray-300"
              min="0"
            />
            <span className="text-gray-700 font-medium">minutes</span>
          </div>
          {errors?.timeGap && (
            <p className="text-red-500 text-sm mt-2 font-medium">
              {errors.timeGap.message}
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 font-medium">{error?.message}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg shadow-lg"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Availability"}
        </Button>
      </div>
    </form>
  );
};

export default AvailabilityForm;
