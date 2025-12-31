"use client";
import Testimonials from "@/components/Testimonials";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { features, howItWorks } from "@/constants";
import { ArrowRight, Calendar, Clock, Users, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGetStarted = () => {
    router.push("/sign-in");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-32 max-w-7xl mx-auto">
        <div className="lg:w-1/2 space-y-6">
          <div className="inline-block">
            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
              Professional Scheduling Made Simple
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold pb-4 gradient-title leading-tight">
            Schedule Meetings
            <br />
            Without the Hassle
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
            Stop the back-and-forth emails. Share your availability, let others book time with you,
            and get automatic calendar invites. Simple, fast, and professional.
          </p>
          <div className="flex gap-4 pt-4">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
              onClick={handleGetStarted}
            >
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </Link>
          </div>
          <div className="flex gap-8 pt-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm">Unlimited Bookings</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="text-sm">24/7 Available</span>
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-lg aspect-square">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl opacity-20"></div>
            <Image
              src="/poster.png"
              alt="Scheduler Poster"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-5xl font-bold text-blue-600 mb-2">10,000+</div>
            <div className="text-gray-600 font-medium">Meetings Scheduled</div>
          </div>
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-5xl font-bold text-blue-600 mb-2">5,000+</div>
            <div className="text-gray-600 font-medium">Active Users</div>
          </div>
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-5xl font-bold text-blue-600 mb-2">99.9%</div>
            <div className="text-gray-600 font-medium">Uptime</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="mb-32 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-gray-900">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make scheduling effortless and professional
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            return (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200"
              >
                <CardHeader>
                  <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-center text-xl text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mb-32 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-gray-900">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in minutes with our simple, intuitive process
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorks.map((step, index) => (
            <div key={index} className="text-center relative">
              {index < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-600 to-blue-300"></div>
              )}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                <span className="text-white font-bold text-2xl">
                  {index + 1}
                </span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">{step.step}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mb-32 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-gray-900">
            Trusted by Professionals
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what our users have to say about their experience
          </p>
        </div>
        <Testimonials />
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Scheduling?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of professionals who have simplified their workflow with Scheduler.
            Start managing your time better today.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-blue-600 text-lg px-8 py-6 hover:bg-white"
              onClick={handleGetStarted}
            >
              Start For Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-75">
            No credit card required • Free forever • Setup in 2 minutes
          </p>
        </div>
      </div>
    </main>
  );
}
