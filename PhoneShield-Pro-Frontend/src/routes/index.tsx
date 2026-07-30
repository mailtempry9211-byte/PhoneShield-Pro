import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/services/api";
import { authService } from "@/services/resources";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — PhoneShield Pro" },
      {
        name: "description",
        content:
          "Sign in to PhoneShield Pro to manage phone inventory, repairs, invoices and customers.",
      },
      { property: "og:title", content: "Sign in — PhoneShield Pro" },
      {
        property: "og:description",
        content: "Secure access to your mobile shop management dashboard.",
      },
    ],
  }),
  component: LoginPage,
});

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

const HIGHLIGHTS = [
  "Live inventory with IMEI-level tracking",
  "Repair jobs, technicians and delivery timelines",
  "GST invoices, WhatsApp sharing and reports",
];

function LoginPage() {
  const { login, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ defaultValues: { email: "", password: "", remember: true } });

  useEffect(() => {
    if (ready && isAuthenticated) navigate({ to: "/dashboard", replace: true });
  }, [ready, isAuthenticated, navigate]);

  useEffect(() => {
    const savedEmail = window.localStorage.getItem("phoneshield_email");
    if (savedEmail) setValue("email", savedEmail);
  }, [setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login(values.email.trim(), values.password, values.remember);
      toast.success("Welcome back");
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      const message = apiErrorMessage(error, "Invalid email or password");
      setServerError(message);
      toast.error(message);
    }
  });

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden gradient-brand p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -top-24 -left-20 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
        <Logo className="relative" size="lg" />
        <div className="relative max-w-md">
          <h2 className="text-4xl leading-tight font-semibold tracking-tight">
            Complete Mobile Shop Management System
          </h2>
          <p className="mt-4 text-sm/6 opacity-90">
            One workspace for stock, repairs, billing and customers — built for busy counters.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm opacity-95">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs opacity-70">
          © {new Date().getFullYear()} PhoneShield Pro. All rights reserved.
        </p>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden">
            <Logo size="md" />
          </div>

          <h1 className="mt-8 text-2xl font-semibold tracking-tight sm:text-3xl">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to open your PhoneShield Pro dashboard.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
            {serverError && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/8 p-3 text-sm text-destructive">
                <ExclamationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <EnvelopeIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@shop.com"
                  className="h-12 rounded-xl pl-10"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
                  })}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-12 rounded-xl pr-11 pl-10"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 4, message: "Password is too short" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={watch("remember")}
                  onCheckedChange={(checked) => setValue("remember", checked === true)}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl gradient-brand text-base font-medium shadow-glow transition-transform hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in <ArrowRightIcon className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Protected area. Access is limited to authorised shop staff.
          </p>
        </motion.div>
      </main>

      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
    </div>
  );
}

function ForgotPasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      toast.error("Enter your email address");
      return;
    }
    setBusy(true);
    try {
      await authService.forgotPassword(email.trim());
      toast.success("Reset instructions sent if the account exists");
      onOpenChange(false);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not start password reset"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>
            We'll email a reset link to the address registered with your account.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@shop.com"
          className="h-11 rounded-xl"
        />
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-xl" disabled={busy} onClick={submit}>
            {busy ? "Sending…" : "Send reset link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
