
import Link from "next/link"
import { redirect } from "next/navigation"

import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  FilePenLine,
  ImageIcon,
  Images,
  LayoutGrid,
  MapPin,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import ListingStatusToggle from "./ListingStatusToggle"
import DeleteListingButton from "./DeleteListingButton"

const PRICE_UNIT: Record<string, string> = {
  stay: "/ night",
  event: "/ ticket",
  activity: "/ person",
  service: "/ service",
}

const TABS = [
  { value: "all", label: "All listings", icon: LayoutGrid },
  {
    value: "published",
    label: "Published",
    icon: CheckCircle2,
  },
  { value: "draft", label: "Drafts", icon: FilePenLine },
] as const

type Tab = (typeof TABS)[number]["value"]

const CATEGORIES = [
  { value: "all", label: "All categories" },
  { value: "stay", label: "Stays" },
  { value: "event", label: "Events" },
  { value: "activity", label: "Activities" },
  { value: "service", label: "Services" },
] as const

type Props = {
  searchParams: Promise<{
    show?: string
    saved?: string
    deleted?: string
    q?: string
    type?: string
  }>
}

export default async function HostListingsPage({
  searchParams,
}: Props) {
  const { show, saved, deleted, q, type } =
    await searchParams

  const tab: Tab = TABS.some((item) => item.value === show)
    ? (show as Tab)
    : "all"

  const query = (q ?? "").trim().slice(0, 100)
  const searchTerm = query.toLowerCase()

  const category = CATEGORIES.some(
    (item) => item.value === type
  )
    ? type!
    : "all"

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/host/listings")
  }

  // Keep the original host-specific listing query.
  const { data: listings, error } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      listing_type,
      price,
      location,
      is_active,
      image_url,
      photos,
      created_at
    `)
    .eq("host_id", user.id)
    .order("created_at", { ascending: false })

  const all = listings ?? []

  const counts: Record<Tab, number> = {
    all: all.length,
    published: all.filter((item) => item.is_active).length,
    draft: all.filter((item) => !item.is_active).length,
  }

  // Server-side filtering of this host's retrieved listings.
  const shown = all.filter((listing) => {
    const matchesStatus =
      tab === "all" ||
      (tab === "published" && listing.is_active) ||
      (tab === "draft" && !listing.is_active)

    const matchesCategory =
      category === "all" ||
      listing.listing_type === category

    const matchesSearch =
      !searchTerm ||
      listing.title.toLowerCase().includes(searchTerm) ||
      (listing.location ?? "")
        .toLowerCase()
        .includes(searchTerm)

    return (
      matchesStatus &&
      matchesCategory &&
      matchesSearch
    )
  })

  const hasFilters =
    Boolean(query) || category !== "all"

  // Preserve search and category when switching status tabs.
  function tabHref(value: Tab) {
    const params = new URLSearchParams()

    if (value !== "all") {
      params.set("show", value)
    }

    if (query) {
      params.set("q", query)
    }

    if (category !== "all") {
      params.set("type", category)
    }

    const search = params.toString()

    return search
      ? `/host/listings?${search}`
      : "/host/listings"
  }

  const successMessage =
    deleted === "true"
      ? "Listing deleted successfully."
      : saved === "published"
        ? "Your listing is published and visible to guests."
        : saved === "draft"
          ? "Listing saved as a draft."
          : saved === "updated"
            ? "Your listing changes have been saved."
            : null

  const summary = [
    {
      label: "Total listings",
      value: counts.all,
      icon: LayoutGrid,
      background: "bg-[#F7EDEF]",
      color: "text-[#7A1F2B]",
    },
    {
      label: "Published",
      value: counts.published,
      icon: CheckCircle2,
      background: "bg-emerald-50",
      color: "text-emerald-700",
    },
    {
      label: "Drafts",
      value: counts.draft,
      icon: FilePenLine,
      background: "bg-amber-50",
      color: "text-amber-700",
    },
  ]

  return (
    <main className="min-h-screen bg-[#F8F7F7]">

      {/* PAGE HEADER */}
      <section className="relative overflow-hidden bg-[#3D0F15]">

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#D4A64A]/10 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-[#A8384A]/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A64A]/20 bg-[#D4A64A]/10 px-3 py-1.5">

                <Sparkles
                  size={13}
                  className="text-[#D4A64A]"
                />

                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#EBC778]">
                  Host Workspace
                </span>

              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Your Listings
                <span className="text-[#D4A64A]">.</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                Manage your stays, events, and activities.
                Keep your offerings updated and ready
                for guests to discover.
              </p>

            </div>

            <Link
              href="/host/listings/new"
              className="inline-flex min-h-11 w-fit shrink-0 items-center justify-center gap-2 rounded-xl bg-[#D4A64A] px-5 py-3 text-sm font-bold text-[#3D0F15] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#E7BD67]"
            >
              <Plus size={18} />
              Create Listing
              <ArrowUpRight size={16} />
            </Link>

          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">

        {/* SUMMARY CARDS */}
        <section
          aria-label="Listing overview"
          className="-mt-9 grid gap-4 sm:grid-cols-3"
        >
          {summary.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.label}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-[#3D0F15]">
                      {error ? "—" : stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${stat.background} ${stat.color}`}
                  >
                    <Icon size={21} strokeWidth={1.9} />
                  </div>

                </div>
              </div>
            )
          })}
        </section>

        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div
            role="status"
            className="mt-7 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800"
          >
            <CheckCircle2
              size={20}
              className="shrink-0"
            />
            {successMessage}
          </div>
        )}

        {/* SECTION HEADER */}
        <div className="mt-10 flex flex-wrap items-end justify-between gap-3">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7A1F2B]">
              Your business
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#3D0F15]">
              Manage Listings
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Search, organize, publish, and update
              your offerings.
            </p>
          </div>

          {!error && (
            <div className="rounded-full border border-[#7A1F2B]/10 bg-white px-4 py-2 text-xs font-semibold text-[#7A1F2B]">
              {shown.length}{" "}
              {shown.length === 1 ? "listing" : "listings"} shown
            </div>
          )}

        </div>

        {/* FILTER PANEL */}
        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">

          {/* STATUS TABS */}
          <nav
            aria-label="Filter listings by status"
            className="flex gap-2 overflow-x-auto border-b border-gray-100 pb-4"
          >
            {TABS.map((item) => {
              const active = tab === item.value
              const Icon = item.icon

              return (
                <Link
                  key={item.value}
                  href={tabHref(item.value)}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                    active
                      ? "bg-[#7A1F2B] text-white shadow-sm"
                      : "bg-gray-50 text-gray-500 hover:bg-[#F7EDEF] hover:text-[#7A1F2B]"
                  }`}
                >
                  <Icon size={16} />

                  {item.label}

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-white text-gray-500"
                    }`}
                  >
                    {error ? "—" : counts[item.value]}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* SEARCH AND CATEGORY */}
          <form
            action="/host/listings"
            method="GET"
            className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-end"
          >
            <input
              type="hidden"
              name="show"
              value={tab}
            />

            <div className="flex-1">
              <label
                htmlFor="listing-search"
                className="mb-2 block text-xs font-semibold text-gray-600"
              >
                Search listings
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="listing-search"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder="Search by listing name or location..."
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7A1F2B] focus:bg-white focus:ring-2 focus:ring-[#7A1F2B]/10"
                />
              </div>
            </div>

            <div className="lg:w-56">
              <label
                htmlFor="listing-category"
                className="mb-2 block text-xs font-semibold text-gray-600"
              >
                Category
              </label>

              <div className="relative">
                <SlidersHorizontal
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  id="listing-category"
                  name="type"
                  defaultValue={category}
                  className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-8 text-sm text-gray-700 outline-none transition focus:border-[#7A1F2B] focus:bg-white focus:ring-2 focus:ring-[#7A1F2B]/10"
                >
                  {CATEGORIES.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3D0F15] px-6 text-sm font-bold text-white transition hover:bg-[#7A1F2B]"
            >
              <Search size={17} />
              Apply Filters
            </button>

            {hasFilters && (
              <Link
                href={tabHref(tab).split("?")[0] +
                  (tab === "all"
                    ? ""
                    : `?show=${tab}`)}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Clear
              </Link>
            )}

          </form>
        </section>

        {/* RESULTS */}
        {error ? (
          <div className="mt-7 rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-600">
            Unable to load your listings.
            Please refresh the page.
          </div>
        ) : shown.length === 0 ? (

          /* EMPTY STATE */
          <div className="mt-7 rounded-3xl border border-dashed border-[#7A1F2B]/20 bg-white px-6 py-14 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7EDEF]">
              {hasFilters ? (
                <Search
                  size={27}
                  className="text-[#7A1F2B]"
                />
              ) : (
                <LayoutGrid
                  size={27}
                  className="text-[#7A1F2B]"
                />
              )}
            </div>

            <h3 className="mt-6 text-xl font-bold text-[#3D0F15]">
              {hasFilters
                ? "No matching listings"
                : tab === "published"
                  ? "Nothing published yet"
                  : tab === "draft"
                    ? "No drafts yet"
                    : "Your first listing starts here"}
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              {hasFilters
                ? "Try another search term or category to find what you're looking for."
                : tab === "all"
                  ? "Create your first stay, event, or activity to begin showcasing your business on Odini."
                  : "Try another status tab to view your other listings."}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {hasFilters ? (
                <Link
                  href="/host/listings"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5E1721]"
                >
                  View All Listings
                  <ArrowRight size={16} />
                </Link>
              ) : tab === "all" ? (
                <Link
                  href="/host/listings/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5E1721]"
                >
                  <Plus size={17} />
                  Create Your First Listing
                </Link>
              ) : (
                <Link
                  href="/host/listings"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#7A1F2B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5E1721]"
                >
                  View All Listings
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        ) : (

          /* LISTING CARDS */
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {shown.map((listing) => {
              const photoCount =
                listing.photos?.length ||
                (listing.image_url ? 1 : 0)

              const coverImage =
                listing.image_url ||
                listing.photos?.[0] ||
                null

              return (
                <article
                  key={listing.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-1 hover:border-[#7A1F2B]/20 hover:shadow-xl hover:shadow-[#3D0F15]/[0.06]"
                >

                  {/* LISTING IMAGE */}
                  <div className="relative h-48 overflow-hidden bg-[#F7EDEF]">

                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-3 text-[#7A1F2B]/50">
                        <ImageIcon size={32} strokeWidth={1.5} />

                        <span className="text-xs font-medium">
                          No photo uploaded yet
                        </span>
                      </div>
                    )}

                    {/* CATEGORY */}
                    <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-[#3D0F15]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                      {listing.listing_type}
                    </span>

                    {/* PHOTO COUNT */}
                    {photoCount > 1 && (
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
                        <Images size={13} />
                        {photoCount} photos
                      </span>
                    )}

                  </div>

                  {/* DETAILS */}
                  <div className="flex flex-1 flex-col p-5">

                    {/* PUBLISH STATUS */}
                    <div className="mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                          listing.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            listing.is_active
                              ? "bg-emerald-500"
                              : "bg-gray-400"
                          }`}
                        />

                        {listing.is_active
                          ? "Published"
                          : "Draft"}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-[#3D0F15]">
                      {listing.title}
                    </h3>

                    <div className="mt-2 flex min-h-5 items-center gap-1.5 text-sm text-gray-500">
                      <MapPin
                        size={15}
                        className="shrink-0 text-[#7A1F2B]"
                      />

                      <span className="truncate">
                        {listing.location ||
                          "Location not specified"}
                      </span>
                    </div>

                    {/* PRICE */}
                    <div className="mt-5 rounded-xl bg-[#F8F7F7] px-4 py-3">

                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Listed Price
                      </p>

                      <div className="mt-1 flex flex-wrap items-baseline gap-1">

                        <span className="text-xl font-bold tracking-tight text-[#7A1F2B]">
                          {listing.price != null
                            ? `K${listing.price.toLocaleString("en-ZM")}`
                            : "On request"}
                        </span>

                        {listing.price != null &&
                          PRICE_UNIT[listing.listing_type] && (
                            <span className="text-xs text-gray-500">
                              {PRICE_UNIT[listing.listing_type]}
                            </span>
                          )}

                      </div>
                    </div>

                    {/* PUBLISH CONTROL */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">

                      <span className="text-xs font-semibold text-gray-600">
                        Listing visibility
                      </span>

                      <ListingStatusToggle
                        listingId={listing.id}
                        isActive={listing.is_active}
                      />

                    </div>

                    {/* ACTIONS */}
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">

                      {listing.is_active && (
                        <Link
                          href={`/user/listings/${listing.id}`}
                          aria-label={`View ${listing.title} as a guest`}
                          title="View as guest"
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-[#7A1F2B]/30 hover:bg-[#F7EDEF] hover:text-[#7A1F2B]"
                        >
                          <Eye size={17} />
                        </Link>
                      )}

                      <Link
                        href={`/host/listings/${listing.id}/edit`}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#7A1F2B] px-4 text-sm font-semibold text-white transition hover:bg-[#5E1721]"
                      >
                        <Pencil size={15} />
                        Edit Listing
                      </Link>

                      <DeleteListingButton
                        listingId={listing.id}
                        listingTitle={listing.title}
                      />

                    </div>
                  </div>

                </article>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}
