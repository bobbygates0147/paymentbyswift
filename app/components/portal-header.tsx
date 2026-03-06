"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function BrandMark({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className="flex items-center">
      <Image
        src="/logo.svg"
        alt="Logo"
        width={mobile ? 96 : 150}
        height={mobile ? 28 : 44}
        className={mobile ? "h-7 w-auto" : "h-11 w-auto"}
        priority
      />
    </div>
  );
}

export default function PortalHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full">
      <div className="hidden md:block">
        <div className="bg-[#3F4A53]">
          <div className="mx-auto flex h-[80px] w-full max-w-[1400px] items-stretch">
            <div className="flex w-[232px] shrink-0 items-center justify-center bg-[] px-6">
              <BrandMark />
            </div>

            <nav
              className="header-nav-caps flex flex-1 items-center text-white"
              aria-label="Top"
            >
              <Link
                href="#"
                className="flex h-full items-center border-t-[8px] border-[#f47c20] bg-[#34404a] px-4 lg:px-7"
              >
                Personal
              </Link>
              <Link href="#" className="flex h-full items-center px-4 lg:px-7">
                Small Business
              </Link>
              <Link href="#" className="flex h-full items-center px-4 lg:px-7">
                Corporate and Institutional
              </Link>
              <Link href="#" className="flex h-full items-center px-4 lg:px-7">
                About
              </Link>
            </nav>

            <div className="header-top-links hidden items-center gap-6 px-6 text-white xl:flex">
              <Link href="#" className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <ellipse cx="12" cy="12" rx="4.5" ry="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M3 12h18M5.2 7.5h13.6M5.2 16.5h13.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                <span>Espanol</span>
              </Link>
              <Link href="#">Customer Service</Link>
              <Link href="#">Locations</Link>
              <Link href="#">Security</Link>
            </div>
          </div>
        </div>

        <div className="bg-[#34404a]">
          <div className="mx-auto flex h-[74px] w-full max-w-[1400px] items-center px-6">
            <nav
              className="header-nav-caps ml-10 flex items-center gap-8 text-white lg:ml-24 lg:gap-12 xl:ml-28"
              aria-label="Main"
            >
              <Link href="#">Products and Services</Link>
              <Link href="#">Learning</Link>
              <Link href="#">Support</Link>
              <Link href="#">Offers</Link>
            </nav>

            <div className="ml-auto flex items-center gap-14 text-white">
              <button type="button" className="header-nav-caps flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" fill="none" />
                  <line
                    x1="16.2"
                    y1="16.2"
                    x2="22"
                    y2="22"
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
                <span>Search</span>
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded border border-[#a6afb9] bg-[#f7f8fa] px-5 py-2 text-[16px] font-semibold text-[#1f2a38]"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                  <path d="M12 11a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6Zm0 1.8c-4.2 0-7.6 2.3-7.6 5.2v1.1h15.2V18c0-2.9-3.4-5.2-7.6-5.2Z" />
                </svg>
                Sign On
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative md:hidden">
        <div className="bg-[#3f4a53]">
          <div className="mx-auto flex h-[70px] w-full max-w-[760px] items-center justify-between px-3">
            <button
              className="flex h-9 w-9 items-center justify-center"
              type="button"
              aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              {isMobileMenuOpen ? (
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" aria-hidden="true">
                  <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
                  <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2" />
                </svg>
              ) : (
                <span className="grid w-6 gap-1" aria-hidden="true">
                  <span className="h-[2px] rounded bg-white" />
                  <span className="h-[2px] rounded bg-white" />
                  <span className="h-[2px] rounded bg-white" />
                </span>
              )}
            </button>

            <BrandMark mobile />

            <button
              type="button"
              className="h-[30px] rounded border border-[#c0c7d0] bg-white px-2.5 text-[12px] font-semibold uppercase tracking-[0.2px] text-[#1f2a38]"
            >
              Sign On
            </button>
          </div>
        </div>

        {!isMobileMenuOpen && (
          <div className="border-y border-[#d3d6db] bg-[#f4f5f6] px-2 py-2">
            <button
              type="button"
              className="flex h-[40px] w-full items-center gap-2 border border-[#d2d6dc] bg-[#eceef0] px-3 text-left text-[16px] text-[#7d8792]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="#606a75" strokeWidth="2" fill="none" />
                <line
                  x1="16.2"
                  y1="16.2"
                  x2="22"
                  y2="22"
                  stroke="#606a75"
                  strokeWidth="2"
                />
              </svg>
              Search
            </button>
          </div>
        )}

        {isMobileMenuOpen && (
          <div className="absolute inset-x-0 top-[70px] z-50">
            <div className="relative min-h-[calc(100vh-70px)] bg-[#53565a]">
              <button
                type="button"
                className="absolute inset-0"
                aria-label="Close menu backdrop"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <div className="relative w-[88%] max-w-[282px] border-b-[4px] border-[#f47c20] bg-[#efefef]">
                <div className="border-y border-[#d3d6db] bg-[#f4f5f6] px-2 py-2">
                  <button
                    type="button"
                    className="flex h-[40px] w-full items-center gap-2 border border-[#d2d6dc] bg-[#eceef0] px-3 text-left text-[16px] text-[#7d8792]"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" stroke="#606a75" strokeWidth="2" fill="none" />
                      <line
                        x1="16.2"
                        y1="16.2"
                        x2="22"
                        y2="22"
                        stroke="#606a75"
                        strokeWidth="2"
                      />
                    </svg>
                    Search
                  </button>
                </div>

                <nav className="px-9 pt-4 text-[16px] leading-[1.4] uppercase text-[#2f3a48]" aria-label="Mobile">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-1.5 text-left font-semibold"
                  >
                    <span>Personal</span>
                    <span className="text-[19px] leading-none text-[#5c6270]">{">"}</span>
                  </button>
                  <Link href="#" className="block py-1.5">
                    Small Business
                  </Link>
                  <Link href="#" className="block py-1.5">
                    Corporate & Institutional
                  </Link>
                  <Link href="#" className="block py-1.5">
                    About
                  </Link>
                </nav>

                <div className="mx-9 mt-3 border-t border-[#c3c8cf] pt-4 pb-5 text-[16px] text-[#2f3a48]">
                  <Link href="#" className="block py-1.5">
                    Espanol
                  </Link>
                  <Link href="#" className="block py-1.5">
                    Customer Service
                  </Link>
                  <Link href="#" className="block py-1.5">
                    Locations
                  </Link>
                  <Link href="#" className="block py-1.5">
                    Security
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
