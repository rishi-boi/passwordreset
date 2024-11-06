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
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordLink } from "@/lib/actions/user.actions";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "invalid email" }),
  password: z.string(),
});

const page = () => {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (query == "reset") {
      try {
        const email = await resetPasswordLink({
          email: values.email,
        });

        if (email?.accepted) {
          toast({
            title: "Email Sent Successfully!",
            action: (
              <ToastAction
                altText="open inbox"
                onClick={() => router.push("https://mail.google.com/")}
              >
                Open Inbox
              </ToastAction>
            ),
          });
        }
      } catch (error) {
        console.log(error);
        toast({
          variant: "destructive",
          title: "Something unexpected happened!!",
          action: <ToastAction altText="try again">Try Again</ToastAction>,
        });
      }
    } else {
      console.log("Normal Logic");
    }

    form.reset();
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="border p-6 w-[400px] absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 rounded-md space-y-4"
      >
        <h1 className="text-3xl text-center font-bold">
          {query == "reset" ? "Reset Password" : "Login"}
        </h1>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!(query == "reset") && (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="enter your password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Link
              href={"?query=reset"}
              className="float-right hover:underline text-gray-500"
            >
              Forget Password?
            </Link>
          </>
        )}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {query == "reset"
            ? form.formState.isSubmitting
              ? "Sending..."
              : "Send Reset Link"
            : form.formState.isSubmitting
            ? "Logging in..."
            : "Login"}
        </Button>
      </form>
    </Form>
  );
};

export default page;
