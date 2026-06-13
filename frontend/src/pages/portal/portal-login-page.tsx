import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, PiggyBank } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import * as portalApi from "@/api/portal.api";
import { getApiErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useIsPortalAuthenticated, usePortalSetSession } from "@/hooks/use-portal-auth";

const loginSchema = z.object({
  phone: z.string().trim().regex(/^\d{10}$/, "Enter your 10-digit phone number"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function PortalLoginPage() {
  const isAuthenticated = useIsPortalAuthenticated();
  const setSession = usePortalSetSession();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/portal";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: portalApi.login,
    onSuccess: ({ token, customer }) => {
      setSession(token, customer);
      toast.success(`Welcome, ${customer.name.split(" ")[0]}`);
      navigate(from, { replace: true });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Login failed")),
  });

  if (isAuthenticated) return <Navigate to="/portal" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <PiggyBank className="size-6" />
          </div>
          <CardTitle className="text-xl">ChitFund Pro</CardTitle>
          <CardDescription>Member sign in</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="10-digit number" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Sign in
              </Button>
            </form>
          </Form>

          <div className="mt-4 space-y-1 rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Demo member</p>
            <p>Phone 9876500001 · Customer@123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
