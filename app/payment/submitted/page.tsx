import Link from "next/link";
import PortalHeader from "../../components/portal-header";

export default function PaymentSubmittedPage() {
  return (
    <div className="min-h-screen bg-[#ebebed] text-[#2f3a48]">
      <PortalHeader />

      <main className="mx-auto flex w-full max-w-[960px] px-5 py-10 md:py-16">
        <section className="w-full rounded-[6px] border border-[#d4d8df] bg-[#f6f7f9] px-6 py-12 text-center shadow-[0_0_0_1px_#d4d8df] md:px-16 md:py-16">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#d6f0dd] text-[#0f7a3f]">
            <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden="true">
              <path
                d="M5 12.5 9.2 17 19 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-[34px] font-bold text-[#1f2942] md:text-[42px]">
            Payment Submitted Successfully
          </h1>
          <p className="mx-auto mt-4 max-w-[520px] text-[17px] leading-[1.6] text-[#5e6777]">
            Your payment details have been submitted. You can close this page or
            return to the sign-on screen.
          </p>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex h-[52px] items-center justify-center rounded-[5px] bg-[#1cbe5a] px-8 text-[17px] font-semibold text-white transition hover:bg-[#14a44d]"
            >
              Return to Sign On
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
