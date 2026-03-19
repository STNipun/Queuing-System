"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hospital } from "lucide-react";

export default function SignUpPage()
{
  return (
    <div className="flex min-h-screen items-center justify-center mx-2 sm:mx-0">
      <Card className="w-full max-w-md py-10">
        <CardHeader className="text-center">
          <div className="flex px-4 justify-center gap-2 items-center mb-2">
            <Hospital className="w-5.5 h-5.5 text-primary mt-1" />
            <h1 className="text-2xl font-bold">Queuing System</h1>
          </div>
          <h2 className="text-xl font-semibold">Account Registration Disabled</h2>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground text-center">
            Public sign up is disabled. New staff accounts are created by administrators only.
          </p>

          <div className="flex justify-center">
            <Button asChild>
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}