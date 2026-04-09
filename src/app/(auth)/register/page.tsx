"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userAuthSchema, type UserAuthInput } from "@/lib/validations/auth";
import { initiateRegistration, verifyOTPAndCreateUser } from "@/server/actions/auth.actions";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailForOTP, setEmailForOTP] = useState("");
    const [otpValue, setOtpValue] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UserAuthInput>({
        resolver: zodResolver(userAuthSchema),
    });

    const onSubmit = async (data: UserAuthInput) => {
        setIsLoading(true);
        setError(null);

        const result = await initiateRegistration(data);

        if (result.success) {
            setEmailForOTP(data.email);
            sessionStorage.setItem("tempHash", result.tempHash as string);
            setStep(2);
        } else {
            setError(result.error || "Something went wrong.");
        }

        setIsLoading(false);
    };

    const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (otpValue.length !== 6) {
            setError("Please enter a valid 6-digit code.");
            setIsLoading(false);
            return;
        }

        const tempHash = sessionStorage.getItem("tempHash");
        if (!tempHash) {
            setError("Session expired. Please try registering again.");
            setStep(1);
            setIsLoading(false);
            return;
        }

        const result = await verifyOTPAndCreateUser(emailForOTP, otpValue, tempHash);

        if (result.success) {
            sessionStorage.removeItem("tempHash");
            router.push("/login?registered=true"); // Redirect to login
        } else {
            setError(result.error || "Verification failed.");
        }

        setIsLoading(false);
    };

    return (
        <div className="flex flex-col space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {step === 1 ? "Create an account" : "Check your email"}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {step === 1
                        ? "Enter your email below to create your account"
                        : `We've sent a 6-digit code to ${emailForOTP}`}
                </p>
            </div>

            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md border border-red-200 dark:border-red-900">
                    {error}
                </div>
            )}

            {step === 1 && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="email">
                            Email
                        </label>
                        <input
                            {...register("email")}
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="password">
                            Password
                        </label>
                        <input
                            {...register("password")}
                            id="password"
                            type="password"
                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>
                    <button
                        disabled={isLoading}
                        className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4"
                        type="submit"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="otp">
                            Verification Code
                        </label>
                        <input
                            id="otp"
                            type="text"
                            maxLength={6}
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value)}
                            placeholder="123456"
                            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-center text-lg tracking-widest ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>
                    <button
                        disabled={isLoading}
                        className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4"
                        type="submit"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verify Account <CheckCircle2 className="ml-2 h-4 w-4" />
                    </button>
                </form>
            )}
        </div>
    );
}