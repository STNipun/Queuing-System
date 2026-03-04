"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Hospital, Loader2, LockKeyhole, Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useState } from "react";
import { useAuth } from "@/hook/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useResendCooldown } from "@/hook/useResendCooldown";
import Link from "next/link";
import CInput from "@/components/ui/custom_ui/CInput";

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(1, "Confirm password is required").min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Password do not match",
  path: ["confirm_password"]
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function SingUp()
{
  const { signup } = useAuth();
  const router = useRouter();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      password: "",
      confirm_password: "",
    }
  });

  const { startCooldown } = useResendCooldown();
  const [isRedirecting, setRedirecting] = useState(false);
  const { isSubmitting } = form.formState;
  const isLoading = isSubmitting || isRedirecting;

  const onSubmit = async (value: FormSchemaType) =>
  {
    try
    {
      const result = await signup(
        value.username,
        value.password,
        value.first_name,
        value.last_name,
      );

      if (result.success)
      {
        toast.success("Account created successfully");
        setRedirecting(true);
        startCooldown();

        router.push("/login");
        router.refresh();
      } else
      {
        toast.error(result.error || "Failed to Sign Up");
      }
    } catch (error)
    {
      console.log(error);
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <div className="flex flex-col min-h-screen justify-center items-center mx-2 sm:max-0">
      <Card className="w-full max-w-sm py-10">
        <CardHeader className="text-2xl font-bold text-center">
          <div className="flex px-4 justify-center gap-2 items-center">
            <Hospital className="w-5.5 h-5.5 text-primary mt-1" />
            <h1 className="text-2xl">Queuing System</h1>
          </div>
          <div className="flex flex-col justify-center items-center space-y-1">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-muted-foreground text-sm font-medium">
              Fill in the details below to get started
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form id="signup-form" onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={isLoading} className="space-y-6">

              <CInput
                control={form.control}
                name="first_name"
                label="First Name"
                placeholder="Enter your first name"
                type="text"
                icon={User}
                disabled={isLoading}
                className="w-full"
              />

              <CInput
                control={form.control}
                name="last_name"
                label="Last Name"
                placeholder="Enter your last name"
                type="text"
                icon={User}
                disabled={isLoading}
                className="w-full"
              />

              <CInput
                control={form.control}
                name="username"
                label="Username"
                placeholder="Enter your username"
                type="text"
                icon={Mail}
                disabled={isLoading}
                className="w-full"
              />

              <CInput
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
                icon={LockKeyhole}
                disabled={isLoading}
                className="w-full"
              />

              <CInput
                control={form.control}
                name="confirm_password"
                label="Confirm Password"
                placeholder="Enter your confirm password"
                type="password"
                icon={LockKeyhole}
                disabled={isLoading}
                className="w-full"
              />

            </fieldset>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            className="w-full cursor-pointer"
            type="submit"
            form="signup-form"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isRedirecting ? "Redirecting..." : "Signing up..."}
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
          <div className="mt-4">
            <p className="text-muted-foreground text-sm font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}