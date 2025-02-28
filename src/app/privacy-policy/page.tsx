import PrivacyPolicy from "@/markdown/privacy-policy.mdx";

export default function TermsOfService() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex flex-col w-1/2 pt-24 gap-3">
        <PrivacyPolicy />
      </div>
    </main>
  );
}
