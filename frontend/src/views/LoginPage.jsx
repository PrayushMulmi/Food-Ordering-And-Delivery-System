import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "../shared/ui";
import { Input } from "../shared/ui";
import { Label } from "../shared/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../shared/ui";
import imgLogo from "../assets/43f7673940367781fb7ec14544ebbbad91e6ffee.png";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = (e) => {
    e.preventDefault();
    toast.success("Login successful!");
    navigate("/dashboard");
  };

  const handleSignup = (e) => {
    e.preventDefault();
    toast.success("Account created successfully!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={imgLogo} alt="Annaya" className="h-24 w-auto" />
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-full p-1 border-4 border-black">
            <button
              onClick={() => setActiveTab("signup")}
              className={`px-8 py-2 rounded-full text-lg font-medium transition-colors ${
                activeTab === "signup"
                  ? "bg-[#22C55E] text-black"
                  : "bg-white text-black"
              }`}
            >
              SignUp
            </button>
            <button
              onClick={() => setActiveTab("login")}
              className={`px-8 py-2 rounded-full text-lg font-medium transition-colors ${
                activeTab === "login"
                  ? "bg-[#22C55E] text-black"
                  : "bg-white text-black"
              }`}
            >
              Login
            </button>
          </div>
        </div>

        {/* Forms Container */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Signup Form */}
          <div
            className={`bg-[#22C55E] rounded-3xl p-12 transition-all duration-300 ${
              activeTab === "signup" ? "opacity-100 scale-100" : "opacity-50 scale-95"
            }`}
          >
            <h2 className="text-5xl font-bold text-black mb-4">Signup</h2>
            <p className="text-3xl text-black mb-8">Create an Account!</p>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <Input
                  placeholder="Full Name"
                  className="bg-white/90 h-14 text-base"
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="bg-white/90 h-14 text-base"
                  required
                />
              </div>
              <div>
                <Input
                  type="tel"
                  placeholder="Contact Number"
                  className="bg-white/90 h-14 text-base"
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Location"
                  className="bg-white/90 h-14 text-base"
                  required
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-5 h-5 border-2 border-black"
                  required
                />
                <label htmlFor="terms" className="text-black text-base">
                  I agree terms & conditions
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white h-14 text-xl font-semibold"
              >
                Sign up
              </Button>
            </form>
          </div>

          {/* Login Form */}
          <div
            className={`bg-white border-4 border-[#22C55E] rounded-3xl p-12 transition-all duration-300 ${
              activeTab === "login" ? "opacity-100 scale-100" : "opacity-50 scale-95"
            }`}
          >
            <h2 className="text-5xl font-bold text-black mb-4">Login</h2>
            <p className="text-3xl text-black mb-8">Welcome Back!</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Input
                  placeholder="Username"
                  className="bg-white h-14 text-base border-gray-300"
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  className="bg-white h-14 text-base border-gray-300"
                  required
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white h-14 text-xl font-semibold"
                >
                  Sign In
                </Button>
              </div>

              <div className="text-center">
                <a href="#" className="text-sm text-gray-600 hover:text-[#22C55E]">
                  Forgot password?
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="text-center mt-8 text-gray-600">
          <p>
            {activeTab === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setActiveTab("signup")}
                  className="text-[#22C55E] font-semibold hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setActiveTab("login")}
                  className="text-[#22C55E] font-semibold hover:underline"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
