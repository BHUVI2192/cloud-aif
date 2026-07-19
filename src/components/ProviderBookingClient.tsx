"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

interface Subservice {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  subservices: Subservice[];
}

interface ProviderProfile {
  id: string;
  displayName: string;
  experienceYears: number;
}

interface ServiceArea {
  id: string;
  name: string;
}

interface ProviderBookingClientProps {
  category: Category;
  provider: ProviderProfile;
  areas: ServiceArea[];
}

export default function ProviderBookingClient({
  category,
  provider,
  areas,
}: ProviderBookingClientProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const isKn = language === "kn";

  // Date and slots state
  const [selectedDateISO, setSelectedDateISO] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [slots, setSlots] = useState<{ slot: string; isBooked: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isProviderAvailable, setIsProviderAvailable] = useState(true);

  // Form inputs state
  const [selectedSubserviceId, setSelectedSubserviceId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [serviceAreaId, setServiceAreaId] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [landmark, setLandmark] = useState("");
  const [phone, setPhone] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate next 14 days
  const dateOptions = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dateOptions.push(d);
  }

  // Pre-select today
  useEffect(() => {
    const todayISO = new Date().toISOString().split("T")[0];
    setSelectedDateISO(todayISO);
  }, []);

  // Fetch slots whenever selectedDateISO changes
  useEffect(() => {
    if (!selectedDateISO) return;
    setLoadingSlots(true);
    setSelectedTimeSlot("");
    fetch(`/api/provider/${provider.id}/slots?date=${selectedDateISO}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.isAvailable) {
          setSlots(data.slots || []);
          setIsProviderAvailable(true);
        } else {
          setSlots([]);
          setIsProviderAvailable(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching slots:", err);
        setSlots([]);
        setIsProviderAvailable(false);
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  }, [selectedDateISO, provider.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedDateISO || !selectedTimeSlot) {
      setErrorMsg(isKn ? "ದಯವಿಟ್ಟು ದಿನಾಂಕ ಮತ್ತು ಸಮಯದ ಸ್ಲಾಟ್ ಆಯ್ಕೆಮಾಡಿ." : "Please select a date and time slot.");
      return;
    }
    if (!serviceAreaId) {
      setErrorMsg(isKn ? "ದಯವಿಟ್ಟು ಸ್ಥಳ ಆಯ್ಕೆಮಾಡಿ." : "Please select a locality.");
      return;
    }
    if (phone.length < 10) {
      setErrorMsg(isKn ? "ಸರಿಯಾದ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ." : "Please enter a valid 10-digit phone number.");
      return;
    }

    setLoadingSubmit(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: category.id,
          subserviceId: selectedSubserviceId || undefined,
          title: title || `${category.name} Request for ${provider.displayName}`,
          description: description || `Direct booking with ${provider.displayName}`,
          serviceAreaId,
          addressLine,
          landmark,
          preferredDate: selectedDateISO,
          preferredTime: selectedTimeSlot,
          providerId: provider.id,
          phone,
        }),
      });

      if (res.ok) {
        router.push("/customer");
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || (isKn ? "ಬುಕಿಂಗ್ ವಿಫಲವಾಗಿದೆ." : "Failed to create booking."));
      }
    } catch {
      setErrorMsg(isKn ? "ದೋಷ ಸಂಭವಿಸಿದೆ. ನಂತರ ಪ್ರಯತ್ನಿಸಿ." : "An error occurred. Please try again.");
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Date Selector */}
      <div className="card">
        <h3 className="text-[15px] font-bold mb-3 text-forest">
          {isKn ? "೧. ಸೇವಾ ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ" : "1. Select Date"}
        </h3>
        
        {/* Horizontal scroll container for mobile */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {dateOptions.map((date) => {
            const iso = date.toISOString().split("T")[0];
            const isSelected = selectedDateISO === iso;
            const dayName = date.toLocaleDateString(isKn ? "kn-IN" : "en-US", { weekday: "short" });
            const dayNum = date.getDate();
            const monthName = date.toLocaleDateString(isKn ? "kn-IN" : "en-US", { month: "short" });

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedDateISO(iso)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-150 min-w-[70px] ${
                  isSelected
                    ? "bg-mist border-brand text-brand"
                    : "bg-white border-line text-slate hover:border-slate/30"
                }`}
                style={{ minHeight: "80px" }}
              >
                <span className="text-[11px] font-semibold opacity-80 uppercase">{dayName}</span>
                <span className="text-[18px] font-extrabold my-0.5">{dayNum}</span>
                <span className="text-[11px] font-medium opacity-80">{monthName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Slots Selector */}
      <div className="card">
        <h3 className="text-[15px] font-bold mb-3 text-forest">
          {isKn ? "೨. ಸಮಯದ ಸ್ಲಾಟ್ ಆಯ್ಕೆಮಾಡಿ" : "2. Select Time Slot"}
        </h3>

        {loadingSlots ? (
          <div className="text-[13px] text-slate py-4">{isKn ? "ಸ್ಲಾಟ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." : "Loading slots..."}</div>
        ) : !isProviderAvailable ? (
          <div className="text-[14px] text-red-600 font-semibold py-2">
            ⚠️ {isKn ? "ಆಯ್ದ ದಿನದಂದು ವೃತ್ತಿಪರರು ಲಭ್ಯವಿಲ್ಲ." : "Provider is unavailable on the selected day."}
          </div>
        ) : slots.length === 0 ? (
          <div className="text-[13px] text-slate py-2">{isKn ? "ಲಭ್ಯವಿರುವ ಸಮಯಗಳಿಲ್ಲ." : "No slots generated."}</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {slots.map((s) => {
              const isSelected = selectedTimeSlot === s.slot;
              return (
                <button
                  key={s.slot}
                  type="button"
                  disabled={s.isBooked}
                  onClick={() => setSelectedTimeSlot(s.slot)}
                  className={`p-3 text-[13px] font-semibold rounded-xl border text-center transition-all duration-150 ${
                    s.isBooked
                      ? "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                      : isSelected
                      ? "bg-mist border-brand text-brand"
                      : "bg-white border-line text-slate hover:border-slate/30"
                  }`}
                  style={{ minHeight: "44px" }}
                >
                  {s.slot} {s.isBooked && `(${isKn ? "ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ" : "Busy"})`}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Booking Details Form */}
      <div className="card space-y-4">
        <h3 className="text-[15px] font-bold text-forest border-b pb-2 mb-1" style={{ borderColor: "var(--line)" }}>
          {isKn ? "೩. ಬುಕಿಂಗ್ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ" : "3. Enter Booking Details"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="label font-semibold text-slate-700">{isKn ? "ಸೇವಾ ವಿಭಾಗ" : "Service Category"}</label>
            <input
              type="text"
              className="input text-[14px] bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed font-medium"
              value={category.name}
              disabled
              readOnly
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{isKn ? "ವಿಶಿಷ್ಟ ಕೆಲಸ (ಐಚ್ಛಿಕ)" : "Specific Task (optional)"}</label>
              <select
                className="input text-[14px]"
                value={selectedSubserviceId}
                onChange={(e) => setSelectedSubserviceId(e.target.value)}
              >
                <option value="">{isKn ? "ಎಲ್ಲಾ ಸೇವೆಗಳು..." : "All services in this category"}</option>
                {category.subservices.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">{isKn ? "ಸ್ಥಳ (ವಾರ್ಡ್/ಬಡಾವಣೆ)" : "Locality"}</label>
              <select
                className="input text-[14px]"
                value={serviceAreaId}
                onChange={(e) => setServiceAreaId(e.target.value)}
                required
              >
                <option value="">{isKn ? "ಸ್ಥಳ ಆಯ್ಕೆಮಾಡಿ..." : "Select locality..."}</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="label">{isKn ? "ಶೀರ್ಷಿಕೆ (ಉದಾ: ನಲ್ಲಿ ರಿಪೇರಿ)" : "Request Title"}</label>
          <input
            type="text"
            className="input text-[14px]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isKn ? "ಉದಾ: ಕಿಚನ್ ನಲ್ಲಿ ಸೋರುತ್ತಿದೆ" : "e.g. Tap leaking in kitchen"}
            required
            minLength={4}
          />
        </div>

        <div>
          <label className="label">{isKn ? "ವಿವರಣೆ (ಸಮಸ್ಯೆಯ ಮಾಹಿತಿ)" : "Description"}</label>
          <textarea
            className="input min-h-[80px] text-[14px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isKn ? "ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ವಿವರವಾಗಿ ಬರೆಯಿರಿ..." : "Describe the issue in detail..."}
            required
            minLength={10}
            style={{ fontSize: "16px" }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{isKn ? "ಮನೆ ಸಂಖ್ಯೆ/ಬೀದಿ ವಿಳಾಸ" : "Address Line"}</label>
            <input
              type="text"
              className="input text-[14px]"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. #24, 2nd Main Road"
              required
            />
          </div>

          <div>
            <label className="label">{isKn ? "ಗುರುತು (ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್)" : "Landmark (optional)"}</label>
            <input
              type="text"
              className="input text-[14px]"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Ganapathi Temple"
            />
          </div>
        </div>

        <div>
          <label className="label">{isKn ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (ಸಂಪರ್ಕಕ್ಕಾಗಿ)" : "Primary Contact Number"}</label>
          <input
            type="tel"
            inputMode="numeric"
            className="input text-[14px]"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile number"
            required
            minLength={10}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-[13px] font-semibold border border-red-200">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Pinned Bottom Submit Button for Mobile Thumb zone */}
      <div className="sticky-bottom-bar md:static md:mt-6 md:p-0 md:bg-transparent md:shadow-none md:border-0">
        <button
          type="submit"
          className="btn btn-primary w-full !py-3 text-[14px] font-extrabold uppercase tracking-wide"
          disabled={loadingSubmit || !selectedTimeSlot || !serviceAreaId}
        >
          {loadingSubmit
            ? (isKn ? "ಕಾಯ್ದಿರಿಸಲಾಗುತ್ತಿದೆ..." : "Booking...")
            : (isKn ? "ಬುಕಿಂಗ್ ಖಚಿತಪಡಿಸಿ" : "Confirm Booking")}
        </button>
      </div>
    </form>
  );
}
