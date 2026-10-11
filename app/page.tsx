
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
    const supabase = await createClient()

    const { data: listings } = await supabase
        .from("listings")
        .select(
            "id, title, description, listing_type, price, location, image_url"
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(6)

    return (
        <main className="min-h-screen bg-gray-50">

            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">

                    <Link
                        href="/"
                        className="text-2xl font-bold tracking-tight text-gray-900"
                    >
                        Odini
                    </Link>

                    <div className="flex items-center gap-3">

                        <Link
                            href="/auth/login"
                            className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:text-[#e8365d]"
                        >
                            Log in
                        </Link>

                        <Link
                            href="/auth/signup"
                            className="rounded-full bg-[#e8365d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d02d50]"
                        >
                            Sign up
                        </Link>

                    </div>

                </div>
            </nav>


            {/* Hero */}
            <section className="px-6 py-20 md:px-10 md:py-28">

                <div className="mx-auto max-w-7xl">

                    <div className="max-w-3xl">

                        <span className="inline-block rounded-full bg-[#e8365d]/10 px-4 py-2 text-sm font-semibold text-[#d02d50]">
                            Discover something different
                        </span>

                        <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900 md:text-7xl">
                            Discover places,
                            <br />
                            <span className="text-[#e8365d]">
                                experiences & moments.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-500">
                            Find stays, events, activities and services
                            around you. Discover something worth experiencing
                            with Odini.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">

                            <a
                                href="#explore"
                                className="rounded-full bg-[#e8365d] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d02d50]"
                            >
                                Explore Experiences
                            </a>

                            <Link
                                href="/auth/signup"
                                className="rounded-full border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:border-[#e8365d] hover:text-[#e8365d]"
                            >
                                Join Odini
                            </Link>

                        </div>

                    </div>

                </div>

            </section>


            {/* Explore */}
            <section
                id="explore"
                className="border-t border-gray-100 bg-white px-6 py-16 md:px-10"
            >

                <div className="mx-auto max-w-7xl">

                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

                        <div>

                            <p className="text-sm font-semibold text-[#e8365d]">
                                EXPLORE
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-gray-900">
                                Experiences worth discovering
                            </h2>

                            <p className="mt-2 text-gray-500">
                                Explore what hosts are offering on Odini.
                            </p>

                        </div>

                    </div>


                    {/* Listings */}
                    {listings && listings.length > 0 ? (

                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                            {listings.map((listing) => (

                                <Link
                                    key={listing.id}
                                    href={`/listing/${listing.id}`}
                                    className="group overflow-hidden rounded-2xl bg-gray-50 transition hover:-translate-y-1 hover:shadow-md"
                                >

                                    {/* Image */}
                                    <div className="relative h-56 overflow-hidden bg-gray-200">

                                        {listing.image_url ? (
                                            <img
                                                src={listing.image_url}
                                                alt={listing.title}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                                Listing photo coming soon
                                            </div>
                                        )}

                                        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold capitalize text-[#d02d50] shadow-sm">
                                            {listing.listing_type}
                                        </span>

                                    </div>


                                    {/* Details */}
                                    <div className="p-5">

                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {listing.title}
                                        </h3>

                                        {listing.description && (
                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                                                {listing.description}
                                            </p>
                                        )}

                                        <div className="mt-4 flex items-center justify-between gap-3">

                                            <span className="text-sm text-gray-500">
                                                {listing.location || "Location unavailable"}
                                            </span>

                                            <span className="font-semibold text-gray-900">
                                                {listing.price != null
                                                    ? `K${listing.price.toLocaleString()}`
                                                    : "Price on request"}
                                            </span>

                                        </div>

                                    </div>

                                </Link>

                            ))}

                        </div>

                    ) : (

                        <div className="mt-8 rounded-2xl bg-gray-50 p-12 text-center">

                            <h3 className="font-semibold text-gray-900">
                                Experiences are coming soon
                            </h3>

                            <p className="mt-2 text-sm text-gray-500">
                                We're getting the first experiences ready
                                for Odini.
                            </p>

                        </div>

                    )}

                </div>

            </section>


            {/* CTA */}
            <section className="px-6 py-20 md:px-10">

                <div className="mx-auto max-w-7xl">

                    <div className="rounded-3xl bg-[#e8365d] px-6 py-14 text-center md:px-10">

                        <h2 className="text-3xl font-bold text-white">
                            Ready to discover something new?
                        </h2>

                        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/80">
                            Create your Odini account and start exploring
                            experiences from local hosts.
                        </p>

                        <Link
                            href="/auth/signup"
                            className="mt-7 inline-block rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#d02d50] transition hover:bg-gray-100"
                        >
                            Create an account
                        </Link>

                    </div>

                </div>

            </section>


            {/* Footer */}
            <footer className="border-t border-gray-100 bg-white px-6 py-8">

                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-gray-400 md:flex-row">

                    <p>
                        © {new Date().getFullYear()} Odini
                    </p>

                    <p>
                        Discover. Experience. Connect.
                    </p>

                </div>

            </footer>

        </main>
    )
}

