import ListingForm from "./ListingForm"

export default function NewListingPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#e8365d]">
            Host
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Create Listing
          </h1>

          <p className="mt-2 text-gray-500">
            Add the details of what you want to offer on Odini.
          </p>
        </div>

        <ListingForm />
      </div>
    </main>
  )
}