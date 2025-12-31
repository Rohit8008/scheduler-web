"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Mail, Calendar, Video } from "lucide-react";
import { createMeetingRequest } from "@/actions/meetingRequest";
import { getUserAvailabilitySlots } from "@/actions/connections";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { syncBackendUser } from "@/lib/backendSync";
import { format, parseISO, addMinutes } from "date-fns";

const NewMeetingRequestModal = ({ onSuccess }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [backendUser, setBackendUser] = useState(null);

  const [formData, setFormData] = useState({
    receiverId: "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.uid && open) {
        try {
          // Sync current user to backend first
          const userData = await syncBackendUser(user);
          setBackendUser(userData);

          // Get auth token
          const token = await user.getIdToken();

          // Fetch connected users instead of all users
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/connections/accepted/${userData.id}`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch connections");
          }
          const connections = await response.json();

          // Map connections to user format for dropdown
          const connectedUsers = connections.map(conn => {
            // Determine which user in the connection is the "other" user
            const isCurrentUserSender = conn.senderId === userData.id;
            return {
              id: isCurrentUserSender ? conn.receiverId : conn.senderId,
              name: isCurrentUserSender ? conn.receiverName : conn.senderName,
              email: isCurrentUserSender ? conn.receiverEmail : conn.senderEmail,
            };
          });

          setUsers(connectedUsers);
        } catch (error) {
          console.error("Error fetching connections:", error);
          toast.error("Failed to load connections. Please try again.");
        }
      }
    };

    fetchUsers();
  }, [user, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!backendUser) {
      toast.error("User data not loaded");
      return;
    }

    if (!formData.receiverId || !formData.title || !selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields and select a time slot");
      return;
    }

    setLoading(true);
    try {
      // Combine selected date and time
      const startDateTime = parseISO(`${selectedDate}T${selectedTime}`);
      const endDateTime = addMinutes(startDateTime, 30); // 30 min duration

      const requestData = {
        requesterId: backendUser.id,
        receiverId: formData.receiverId,
        title: formData.title,
        description: formData.description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };

      await createMeetingRequest(requestData);
      toast.success("Meeting request sent! They'll receive an email notification.");
      setOpen(false);
      // Reset all form state
      setFormData({
        receiverId: "",
        title: "",
        description: "",
        startTime: "",
        endTime: "",
      });
      setSearchQuery("");
      setFilteredUsers([]);
      setShowDropdown(false);
      setSelectedUser(null);
      setAvailableDates([]);
      setSelectedDate(null);
      setSelectedTime(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating meeting request:", error);
      toast.error("Failed to send meeting request");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(true);

    if (query.trim() === "") {
      setFilteredUsers([]);
      return;
    }

    // Filter users by name or email
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setFormData((prev) => ({ ...prev, receiverId: user.id }));
    setSearchQuery(`${user.name} (${user.email})`);
    setShowDropdown(false);
    setFilteredUsers([]);

    // Fetch user's availability
    setLoadingSlots(true);
    try {
      const slots = await getUserAvailabilitySlots(user.id, 30); // 30 min default duration
      setAvailableDates(slots);
      if (slots.length > 0) {
        setSelectedDate(slots[0].date); // Auto-select first available date
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load user's availability");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery && filteredUsers.length > 0) {
      setShowDropdown(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.search-dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Request Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request a Meeting</DialogTitle>
          <DialogDescription>
            Send a meeting request to another user. They'll be notified by email to approve or decline.
          </DialogDescription>
        </DialogHeader>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-blue-900 text-sm flex items-center gap-2">
            <Mail className="h-4 w-4" />
            How it works:
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>They receive an email notification with your meeting request</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>If approved: Both receive a Google Meet link and calendar invite (.ics)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>If declined: You'll receive an email with their reason</span>
            </li>
          </ul>
        </div>

        {users.length === 0 ? (
          <div className="py-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-amber-900 font-semibold mb-2">No Connections Yet</p>
              <p className="text-amber-800 text-sm mb-3">
                You need to connect with users before you can send them meeting requests.
              </p>
              <a
                href="/connections"
                className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Go to Connections
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2 relative search-dropdown-container">
                <Label htmlFor="userSearch">Search User *</Label>
                <Input
                  id="userSearch"
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  placeholder="Search by name or email..."
                  required
                  className="w-full"
                  autoComplete="off"
                />

                {/* Dropdown Results */}
                {showDropdown && filteredUsers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {showDropdown && searchQuery && filteredUsers.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-50">
                    <p className="text-gray-600 text-sm text-center">No users found</p>
                  </div>
                )}

                {/* Hidden input for form validation */}
                <input
                  type="hidden"
                  name="receiverId"
                  value={formData.receiverId}
                  required
                />
              </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Meeting Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Project Discussion"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add details about the meeting..."
                className="min-h-[80px]"
              />
            </div>

            {/* Availability Section */}
            {selectedUser && (
              <div className="grid gap-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <Label className="text-base font-semibold">Select Date & Time</Label>
                </div>

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading available slots...</span>
                  </div>
                ) : availableDates.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                    <p className="text-amber-900 font-semibold">No Availability Set</p>
                    <p className="text-amber-800 text-sm mt-1">
                      This user hasn't configured their availability yet.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Date Selection */}
                    <div className="grid gap-2">
                      <Label>Select Date *</Label>
                      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                        {availableDates.map((dateSlot) => (
                          <button
                            key={dateSlot.date}
                            type="button"
                            onClick={() => {
                              setSelectedDate(dateSlot.date);
                              setSelectedTime(null); // Reset time when date changes
                            }}
                            className={`p-2 text-sm rounded-md border transition-colors ${
                              selectedDate === dateSlot.date
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white hover:bg-blue-50 border-gray-300"
                            }`}
                          >
                            <div className="font-medium">
                              {format(parseISO(dateSlot.date), "MMM d")}
                            </div>
                            <div className="text-xs opacity-75">
                              {format(parseISO(dateSlot.date), "EEE")}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Slot Selection */}
                    {selectedDate && (
                      <div className="grid gap-2">
                        <Label>Select Time *</Label>
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                          {availableDates
                            .find((d) => d.date === selectedDate)
                            ?.slots.map((slot) => (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => setSelectedTime(slot.time)}
                                className={`p-2 text-sm rounded-md border transition-colors ${
                                  selectedTime === slot.time
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white hover:bg-blue-50 border-gray-300"
                                }`}
                              >
                                {slot.time}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewMeetingRequestModal;
