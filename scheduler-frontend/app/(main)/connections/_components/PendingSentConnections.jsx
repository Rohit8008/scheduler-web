"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getPendingSentConnections } from "@/actions/connections";
import { syncBackendUser } from "@/lib/backendSync";
import ConnectionsList from "./ConnectionsList";
import { PulseLoader } from "react-spinners";

export default function PendingSentConnections({ onUpdate }) {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      if (user?.uid) {
        try {
          setLoading(true);
          const backendUser = await syncBackendUser(user);
          const data = await getPendingSentConnections(backendUser.id);
          setConnections(data);
        } catch (error) {
          console.error("Error fetching pending sent connections:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchConnections();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <PulseLoader color="#3498db" size={15} />
      </div>
    );
  }

  return <ConnectionsList connections={connections} type="pending-sent" onUpdate={onUpdate} />;
}
