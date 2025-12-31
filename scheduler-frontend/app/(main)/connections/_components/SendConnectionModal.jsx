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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Mail } from "lucide-react";
import { sendConnectionRequest, checkConnection } from "@/actions/connections";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { syncBackendUser } from "@/lib/backendSync";

const SendConnectionModal = ({ onSuccess }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [backendUser, setBackendUser] = useState(null);

  const [formData, setFormData] = useState({
    receiverId: "",
    message: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.uid && open) {
        try {
          // Sync current user to backend first
          const userData = await syncBackendUser(user);
          setBackendUser(userData);

          // Get auth token
          const token = await user.getIdToken();

          // Fetch all backend users with authentication
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/users`, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch users");
          }
          const allUsers = await response.json();

          // Filter out current user
          const otherUsers = allUsers.filter(u => u.id !== userData.id);
          setUsers(otherUsers);
        } catch (error) {
          console.error("Error fetching users:", error);
          toast.error("Failed to load users. Please try again.");
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

    if (!formData.receiverId) {
      toast.error("Please select a user");
      return;
    }

    setLoading(true);
    try {
      await sendConnectionRequest(formData.receiverId, formData.message);
      toast.success("Connection request sent! They'll receive an email notification.");
      setOpen(false);
      // Reset all form state
      setFormData({
        receiverId: "",
        message: "",
      });
      setSearchQuery("");
      setFilteredUsers([]);
      setShowDropdown(false);
      setSelectedUser(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast.error(error.message || "Failed to send connection request");
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

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setFormData((prev) => ({ ...prev, receiverId: user.id }));
    setSearchQuery(`${user.name} (${user.email})`);
    setShowDropdown(false);
    setFilteredUsers([]);
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
          <UserPlus className="h-4 w-4 mr-2" />
          Send Connection Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Connection Request</DialogTitle>
          <DialogDescription>
            Connect with other users to send and receive meeting requests.
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
              <span>They receive an email with your connection request</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>If accepted: Both of you can send meeting requests to each other</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>If declined: You'll be notified via email</span>
            </li>
          </ul>
        </div>

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
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Add a personal message..."
                className="min-h-[80px]"
              />
            </div>
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
      </DialogContent>
    </Dialog>
  );
};

export default SendConnectionModal;
