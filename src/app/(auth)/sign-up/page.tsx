import { AuthForm } from "@/components/auth/auth-form";

export default function SignUpPage() {
  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4 max-h-[calc(100vh-2rem)] overflow-y-auto spatial-scrollbar">
      <AuthForm mode="sign-up" />
    </div>
  );
}
