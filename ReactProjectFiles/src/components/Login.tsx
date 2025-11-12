import { useState } from "react";
import {
  Mail,
  Lock,
  User as UserIcon,
  Apple,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import logo from "figma:asset/ae280b92ceef7e198522f0872d65dd755e21ef9b.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface LoginProps {
  isSignup: boolean;
  onSuccess: () => void;
  onToggle: () => void;
}

export default function Login({
  isSignup,
  onSuccess,
  onToggle,
}: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1667791275929-5701d83734c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwYXRobGV0ZSUyMHJ1bm5pbmd8ZW58MXx8fHwxNzYyNDIxNjc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Fitness"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen p-6">
        {/* Logo at top */}
        <div className="">
          <img src={logo} alt="Goal Getter" className="w-40" />
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full pb-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-white mb-2">
              {isSignup ? "" : "Welcome Back"}
            </h1>
            <p className="text-white/60">
              {isSignup
                ? "Start your journey to consistency"
                : "Continue your streak"}
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center justify-center hover:bg-white/20 transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Mail className="w-6 h-6 text-white" />
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Apple className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-white/40">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/60 text-sm">
                  Full Name
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-12 py-6 bg-white/5 border-white/20 text-white rounded-xl placeholder:text-white/40 focus:bg-white/10 focus:border-[#00c2ff] transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/60 text-sm">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-12 py-6 bg-white/5 border-white/20 text-white rounded-xl placeholder:text-white/40 focus:bg-white/10 focus:border-[#00c2ff] transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/60 text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-12 pr-12 py-6 bg-white/5 border-white/20 text-white rounded-xl placeholder:text-white/40 focus:bg-white/10 focus:border-[#00c2ff] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {!isSignup && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm hover:underline"
                  style={{ color: "#00c2ff" }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full text-black py-6 rounded-xl mt-6 shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: "#00c2ff" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#00a8e0")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "#00c2ff")
              }
            >
              {isSignup ? "Create Account" : "Log In"}
            </Button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={onToggle}
              className="text-white/60 hover:text-white transition-colors"
            >
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <span style={{ color: "#00c2ff" }} className="hover:underline">Log in</span>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <span style={{ color: "#00c2ff" }} className="hover:underline">
                    Sign up
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Terms (for signup only) */}
          {isSignup && (
            <p className="mt-6 text-center text-xs text-white/40">
              By creating an account, you agree to our{" "}
              <button className="text-white/60 hover:text-white underline">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-white/60 hover:text-white underline">
                Privacy Policy
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
