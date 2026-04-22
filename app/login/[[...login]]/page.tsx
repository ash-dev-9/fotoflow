import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#111827] px-4 py-16 text-slate-100">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5">
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/signup"
          forceRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: "#5B7CFF",
              colorBackground: "#0f172a",
              colorInputBackground: "#020617",
              colorInputText: "#f8fafc",
              colorText: "#f8fafc",
              colorTextSecondary: "#94a3b8",
              borderRadius: "12px",
            },
          }}
        />
        <Link
          href="/"
          className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition hover:border-white/40"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
