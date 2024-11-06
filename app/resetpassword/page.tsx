"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleX } from "lucide-react";
import Link from "next/link";
import { resetPassword } from "@/lib/actions/user.actions";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

const formSchema = z
  .object({
    password: z.string(),
    confirm_password: z.string(),
  })
  .superRefine(({ confirm_password, password }, ctx) => {
    if (confirm_password !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

const page = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [tokenData, setTokenData] = useState({
    id: "",
    email: "",
    iat: 0,
    exp: 0,
  });
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    try {
      const decodedToken = jwt.verify(
        token as string,
        process.env.NEXT_PUBLIC_TOKEN_SECRET as string
      ) as { id: string; email: string; iat: number; exp: number };
      setTokenData(decodedToken);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const isEmpty = (obj: Object) => {
    return Object.keys(obj).length === 0;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const user = await resetPassword({
        id: tokenData.id,
        password: values.password,
      });

      if (user) {
        toast({
          title: "Password updated successfully!",
          description: "Redirecting in 3 seconds",
          action: (
            <ToastAction
              altText="redirect"
              onClick={() => router.push("/login")}
            >
              redirect
            </ToastAction>
          ),
        });
        setInterval(() => {
          router.push("/login");
        }, 3000);
      } else {
        toast({
          variant: "destructive",
          title: "Password should not be same as previous password",
          action: <ToastAction altText="Try Again">Try Again</ToastAction>,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something unexpected happened!!",
        action: <ToastAction altText="Try Again">Try Again</ToastAction>,
      });
    }
    form.reset();
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="border p-6 w-[400px] absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-md space-y-4"
      >
        <h1 className="text-3xl text-center font-bold">Reset Password</h1>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="password"
                  placeholder="enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="confirm password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isEmpty(tokenData) || form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
        </Button>
        {isEmpty(tokenData) && (
          <Alert variant={"destructive"}>
            <CircleX className="h-4 w-4" />
            <AlertTitle>Invalid Password Reset Link</AlertTitle>
            <AlertDescription>
              Password reset link is invalid or has been expired. Please{" "}
              <Link href={"/login?query=reset"} className="underline">
                try again
              </Link>
            </AlertDescription>
          </Alert>
        )}
      </form>
    </Form>
  );
};

export default page;
