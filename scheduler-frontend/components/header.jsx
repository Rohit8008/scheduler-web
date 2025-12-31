"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { PenBox } from "lucide-react";
import UserMenu from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const Header = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  return (
    <nav className="mx-auto py-2 px-4 flex justify-between items-center shadow-md border-b-2">
      <Link href={"/"} className="flex items-center">
        <Image src="/logo.png" alt="Scheduler logo" width="150" height="60" />
      </Link>

      <div className="flex items-center gap-4">
        {user && (
          <Link href="/events?create=true">
            <Button className="flex items-center gap-2">
              <PenBox size={18} /> Create Event
            </Button>
          </Link>
        )}
        {!loading && (
          <>
            {!user ? (
              <Button variant="outline" onClick={() => router.push('/sign-in')}>
                Login
              </Button>
            ) : (
              <UserMenu />
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;
