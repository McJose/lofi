export default function VerifyEmailPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="text-muted-foreground">
          We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
      </div>
    </div>
  );
}
