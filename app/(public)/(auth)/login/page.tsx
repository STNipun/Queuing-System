"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Hospital, Loader2, LockKeyhole, User } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hook/useAuth";
import CInput from "@/components/ui/custom_ui/CInput";

// Zod form schema
const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters")
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function LoginPage()
{

  const { login } = useAuth();
  const router = useRouter();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  })

  const [isRedirecting, setIsRedirecting] = useState(false);
  const { isSubmitting } = form.formState;

  const isLoading = isSubmitting || isRedirecting;

  const getRoleRedirect = (role?: string): string =>
  {
    switch (role)
    {
      case "admin": return "/admin/users";
      case "doctor": return "/doctor";
      case "front_desk": return "/fornt-desk";
      case "user": return "/";
      default: return "/";
    }
  };

  const onSubmit = async (values: FormSchemaType) =>
  {
    try
    {
      const result = await login(values.username, values.password);

      if (result.success)
      {
        setIsRedirecting(true);
        router.push(getRoleRedirect(result.user?.role));
        router.refresh();
      }
      else
      {
        toast.error(result.error || "Failed to login")
      }
    } catch
    {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center mx-2 sm:mx-0">
      <Card className="w-full max-w-sm py-10">
        <CardHeader className="text-2xl font-bold text-center">
          <div className="flex px-4 justify-center gap-2 items-center">
            <Hospital className="w-5.5 h-5.5 text-primary mt-1" />
            <h1>Queuing System</h1>
          </div>
          <div>
            <h1>Login to your account</h1>
            <p className="text-sm text-muted-foreground font-medium mt-0.5">
              Welcome back! Please login to your account
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={isLoading} className="space-y-6">
              {/* ------Username Field------ */}
              {/* <Controller
                control={form.control}
                name="username"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Username</FieldLabel>
                    <FieldContent>
                      <InputGroup className={styles.input}>
                        <InputGroupInput
                          placeholder="Enter username"
                          {...field}
                          autoComplete="username"
                        />
                        <InputGroupAddon>
                          <User className="mt-0.4" />
                        </InputGroupAddon>
                      </InputGroup>
                    </FieldContent>
                  </Field>
                )}
              /> */}

              <CInput
                control={form.control}
                name="username"
                label="Username"
                placeholder="Enter username"
                type="text"
                icon={User}
                disabled={isLoading}
                className="w-full"
              />

              {/* ------Password Field------ */}
              {/* <Controller
                control={form.control}
                name="password"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Password</FieldLabel>
                    <FieldContent>
                      <InputGroup className={styles.input}>
                        <InputGroupAddon>
                          <LockKeyhole />
                        </InputGroupAddon>
                        <InputGroupInput
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
                          autoComplete="current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                      </InputGroup>
                    </FieldContent>
                  </Field>
                )}
              /> */}

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

            </fieldset>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            className="w-full"
            type="submit"
            form="login-form"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isRedirecting ? "Redirecting..." : "Loggin in..."}
              </>
            ) : (
              "Login"
            )}
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">
              Account creation is managed by administrators. Contact your clinic admin for access.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}