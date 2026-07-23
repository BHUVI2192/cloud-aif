"use client";
import { useState } from "react";
import Link from "next/link";
import { Star, ShieldCheck, MapPin, Search } from "lucide-react";

interface Provider {
  id: string;
  displayName: string;
  headline: string;
  bio: string;
  experienceYears: number;
  profileImage: string;
  ratingAverage: number;
  ratingCount: number;
  jobsCompleted: number;
  primaryCategoryName: string;
  primaryCategorySlug: string;
  subservices: string[];
  localities: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BookProviderDirectoryProps {
  providers: Provider[];
  categories: Category[];
}

export default function BookProviderDirectory({
  providers,
  categories,
}: BookProviderDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("");

  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subservices.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      !selectedCategorySlug || p.primaryCategorySlug === selectedCategorySlug;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Filters Area */}
      <div className="card space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
            <input
              type="text"
              placeholder="Search by name, service or keyword..."
              className="input pl-10 text-[14px] w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-64">
            <select
              className="input text-[14px] w-full"
              value={selectedCategorySlug}
              onChange={(e) => setSelectedCategorySlug(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      {filteredProviders.length === 0 ? (
        <div className="card text-center py-12 text-slate">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-[15px] font-semibold">No service providers found matching your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProviders.map((p) => (
            <div key={p.id} className="card flex flex-col justify-between hover:shadow-md transition duration-200">
              <div className="space-y-3.5">
                {/* Header Info */}
                <div className="flex items-start gap-4">
                  <div className="relative h-14 w-14 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-lg text-forest border border-outline-variant">
                    {p.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.profileImage} alt={p.displayName} className="h-full w-full object-cover" />
                    ) : (
                      p.displayName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-[16px] truncate text-forest leading-tight">{p.displayName}</h3>
                      <span className="shrink-0 text-emerald-600" title="Verified Professional">
                        <ShieldCheck className="h-4 w-4 fill-current" />
                      </span>
                    </div>
                    <p className="text-[12px] font-bold text-brand uppercase tracking-wider">{p.primaryCategoryName}</p>
                    
                    {/* Stars / Rating */}
                    <div className="flex items-center gap-1 text-[13px] font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{p.ratingAverage.toFixed(1)}</span>
                      <span className="text-slate font-medium text-[12px]">({p.ratingCount} reviews)</span>
                      <span className="text-outline-variant mx-1">•</span>
                      <span className="text-slate font-medium text-[12px]">{p.jobsCompleted} jobs completed</span>
                    </div>
                  </div>
                </div>

                {/* Subtag line or bio snippet */}
                {p.headline && (
                  <p className="text-[13px] font-semibold text-forest leading-tight italic">
                    &ldquo;{p.headline}&rdquo;
                  </p>
                )}
                
                {p.bio && (
                  <p className="text-[13px] text-slate line-clamp-2 leading-relaxed">
                    {p.bio}
                  </p>
                )}

                {/* Experience & Subservices tags */}
                <div className="space-y-1.5 pt-1.5 border-t border-outline-variant">
                  <p className="text-[12px] text-slate">
                    <strong>Experience:</strong> {p.experienceYears}+ years verified
                  </p>
                  
                  {p.subservices.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.subservices.slice(0, 3).map((sub) => (
                        <span key={sub} className="text-[10px] font-semibold bg-surface-container border border-outline-variant text-on-surface px-2 py-0.5 rounded-full">
                          {sub}
                        </span>
                      ))}
                      {p.subservices.length > 3 && (
                        <span className="text-[10px] font-semibold bg-surface-container border border-outline-variant text-on-surface px-2 py-0.5 rounded-full">
                          +{p.subservices.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {p.localities.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-slate pt-1">
                      <MapPin className="h-3 w-3 text-forest shrink-0" />
                      <span className="truncate">Covers: {p.localities.slice(0, 4).join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-outline-variant">
                <Link
                  href={`/p/${p.id}`}
                  className="btn btn-ghost flex-1 text-[12px] !py-2 text-center"
                >
                  View Profile
                </Link>
                <Link
                  href={`/services/${p.primaryCategorySlug}/book/${p.id}`}
                  className="btn btn-primary flex-1 text-[12px] !py-2 text-center font-bold"
                >
                  Book Directly
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
