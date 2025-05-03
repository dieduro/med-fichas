import {GoogleSignInButton} from "@/components/auth/google-signin-button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Sign in to your account using one of the methods below</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <GoogleSignInButton />
        </CardContent>
      </Card>
    </div>
  );
}
