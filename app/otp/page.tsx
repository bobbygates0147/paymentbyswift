"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PortalHeader from "../components/portal-header";
import { getCurrentLoginUser, clearCurrentLoginUser, verifyOTPFromDB } from "../utils/auth";

export default function OtpPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [verified, setVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser] = useState<string | null>(() => getCurrentLoginUser());
  const fieldClass =
    "h-[58px] w-full border border-[#c7ccd3] bg-white px-4 text-[18px] text-[#2f3a48] outline-none placeholder:text-[#6b7580] focus:border-[#f47c20] focus:shadow-[inset_4px_0_0_#f47c20] md:h-[68px] md:px-5 md:text-[16px]";

  const submitOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    if (!currentUser) {
      setVerified(false);
      setErrorMessage("Session expired. Go back and sign on again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await verifyOTPFromDB(currentUser, code.trim());

      if (result?.success) {
        setVerified(true);
        // Keep user session for checkout page - don't clear here
        // clearCurrentLoginUser();
        // Redirect to payment checkout page after successful OTP verification
        setTimeout(() => {
          router.push("/payment/checkout");
        }, 1500);
      } else {
        setVerified(false);
        setErrorMessage(result?.message || "Try again or OTP expired.");
      }
    } catch {
      setVerified(false);
      setErrorMessage("Unable to verify OTP right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efefef] text-[#2f3a48]">
      <PortalHeader />

      <main className="mx-auto w-full max-w-[1180px] px-3 py-5 md:px-5 md:py-12">
        <section className="mx-auto w-full max-w-[700px] border border-[#e1e1e1] bg-[#f3f3f3] px-4 py-6 md:px-10 md:py-10">
          <h1 className="mb-3 text-[30px] leading-tight font-normal md:text-[44px]">
            Enter One-Time Passcode
          </h1>

          <form onSubmit={submitOtp}>
            <label
              htmlFor="otpCode"
              className="mb-2 block text-[18px] text-[#2f3a48] md:text-[16px]"
            >
              OTP code
            </label>
            <input
              id="otpCode"
              name="otpCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              minLength={6}
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              className={fieldClass}
            />

            {errorMessage && (
              <p className="mt-2 text-[16px] text-[#bd2a2a] md:mt-3 md:text-[15px]">
                {errorMessage}
              </p>
            )}
            {verified && (
              <p className="mt-2 text-[16px] text-[#0f7a3f] md:mt-3 md:text-[15px]">
                Code verified. Redirecting to checkout...
              </p>
            )}

            <div className="mt-4 grid gap-3 md:mt-6 md:gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-[58px] w-full rounded border border-[#c7ccd3] bg-[#d7dbe2] text-[18px] font-semibold text-[#2f3a48] md:h-[68px] md:text-[18px]"
              >
                {isSubmitting ? "Verifying..." : "Verify Code"}
              </button>
              <Link className="text-[17px] text-[#06569d] md:text-[15px]" href="/">
                Back to Sign On
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
