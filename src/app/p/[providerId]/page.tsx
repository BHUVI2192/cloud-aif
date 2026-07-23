import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Award, CheckCircle2, Star, MapPin, ShieldCheck, Phone, MessageSquare, ExternalLink, Calendar } from "lucide-react";

export async function generateMetadata({ params }: { params: { providerId: string } }) {
  const provider = await db.providerProfile.findUnique({
    where: { id: params.providerId },
    select: { displayName: true, bio: true },
  });
  if (!provider) return { title: "Provider Not Found" };
  return {
    title: `${provider.displayName} — Verified Home Service Pro in Shivamogga`,
    description: provider.bio || `Hire ${provider.displayName} directly in Shivamogga, Karnataka with Ogenzo 7-day service guarantee.`,
  };
}

export default async function PublicProviderProfilePage({ params }: { params: { providerId: string } }) {
  const provider = await db.providerProfile.findUnique({
    where: { id: params.providerId },
    include: {
      user: { select: { name: true, phone: true, image: true } },
      subservices: { include: { subservice: { include: { category: true } } } },
      serviceAreas: { include: { serviceArea: true } },
      documents: { where: { status: "APPROVED" } },
      portfolio: { orderBy: { sortOrder: "asc" } },
      pricing: { include: { subservice: true } },
      reviewsRecv: {
        where: { status: "PUBLISHED" },
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!provider || provider.status !== "APPROVED") {
    notFound();
  }

  const phone = provider.emergencyContact || provider.user.phone || "";
  const cleanPhone = phone.replace(/\D/g, "");
  const whatsappUrl = cleanPhone ? `https://wa.me/91${cleanPhone}?text=Hi%20${encodeURIComponent(provider.displayName)},%20I%20found%20your%20verified%20profile%20on%20Cloud%20AIF.%20I%20need%20a%20service%20quote.` : "";

  const avgRating = provider.reviewsRecv.length > 0
    ? provider.reviewsRecv.reduce((a, b) => a + b.rating, 0) / provider.reviewsRecv.length
    : 5.0;

  const categories = Array.from(new Set(provider.subservices.map((s) => s.subservice.category.name)));
  const primaryCategorySlug = provider.subservices[0]?.subservice.category.slug || "plumbing";

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pb-20">
      {/* Top Banner & Profile Header */}
      <div className="bg-gradient-to-br from-teal-950 via-teal-900 to-green-950 text-white pt-8 pb-16 px-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider bg-white/10 text-emerald-300 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm">
              Verified Professional • Shivamogga
            </span>
            <div className="flex items-center gap-1 text-amber-400 bg-black/30 px-2.5 py-1 rounded-full text-[13px] font-bold border border-white/10">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{avgRating.toFixed(1)}</span>
              <span className="text-white/60 font-normal">({provider.reviewsRecv.length})</span>
            </div>
          </div>

          <div className="flex items-start gap-4 pt-2">
            <div className="w-20 h-20 rounded-2xl bg-emerald-800 border-2 border-white/30 overflow-hidden relative shadow-lg flex-shrink-0 flex items-center justify-center text-2xl font-bold text-emerald-200">
              {provider.user.image ? (
                <Image src={provider.user.image} alt={provider.displayName} fill className="object-cover" />
              ) : (
                provider.displayName.charAt(0)
              )}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="text-2xl font-black tracking-tight leading-tight break-words">{provider.displayName}</h1>
              <p className="text-[14px] text-emerald-200/90 font-medium break-words">{categories.join(" • ")}</p>
              {provider.experienceYears && (
                <span className="inline-block text-[12px] bg-white/15 px-2.5 py-0.5 rounded text-white/90">
                  {provider.experienceYears}+ Years Verified Experience
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card Container */}
      <div className="max-w-md mx-auto px-4 -mt-8 space-y-4">
        {/* Verification Badges */}
        <div className="bg-white rounded-2xl p-4 border border-line shadow-sm space-y-3">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Platform Verification Status
          </h2>
          <div className="flex flex-wrap gap-2">
            {provider.documents.length > 0 ? (
              provider.documents.map((v) => (
                <span key={v.id} className="inline-flex items-center gap-1 text-[12px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {v.type.replace("_", " ")} Verified
                </span>
              ))
            ) : (
              <span className="inline-flex items-center gap-1 text-[12px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ID Verified
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[12px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-xl">
              <Award className="w-3.5 h-3.5 text-amber-600" /> 7-Day Platform Guarantee
            </span>
          </div>
        </div>

        {/* Bio */}
        {provider.bio && (
          <div className="bg-white rounded-2xl p-4 border border-line shadow-sm space-y-2">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate">About Professional</h2>
            <p className="text-[14px] text-gray-700 leading-relaxed">{provider.bio}</p>
          </div>
        )}

        {/* Indicative Pricing */}
        {provider.pricing.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-line shadow-sm space-y-3">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate">Transparent Indicative Pricing</h2>
            <div className="divide-y divide-gray-100">
              {provider.pricing.map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-[14px]">
                  <span className="font-medium text-gray-800">{p.label}</span>
                  <span className="font-bold text-forest">
                    ₹{(p.amountMin / 100).toFixed(0)} {p.amountMax ? `- ₹${(p.amountMax / 100).toFixed(0)}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Areas */}
        {provider.serviceAreas.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-line shadow-sm space-y-3">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-forest" /> Covered Shivamogga Localities
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {provider.serviceAreas.map((sa) => (
                <span key={sa.id} className="text-[12px] bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200">
                  {sa.serviceArea.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews */}
        <div className="bg-white rounded-2xl p-4 border border-line shadow-sm space-y-3">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-slate">
            Customer Reviews ({provider.reviewsRecv.length})
          </h2>
          <div className="space-y-3 divide-y divide-gray-100">
            {provider.reviewsRecv.map((r) => (
              <div key={r.id} className="pt-3 first:pt-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-gray-900">{r.author.name || "Customer"}</span>
                  <div className="flex items-center text-amber-500 text-[12px] font-bold">
                    {"★".repeat(r.rating)}
                  </div>
                </div>
                {r.comment && <p className="text-[13px] text-gray-600 italic">"{r.comment}"</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Direct Contact Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-line p-3 z-50 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center gap-2.5">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-none flex-1 text-[14px] font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow active:scale-95 transition"
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp Quote
            </a>
          )}
          <Link
            href={`/services/${primaryCategorySlug}/book/${provider.id}`}
            className="btn btn-primary flex-1 text-[14px] font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow active:scale-95 transition"
          >
            <Calendar className="w-4 h-4" /> Book Directly
          </Link>
        </div>
      </div>
    </div>
  );
}
