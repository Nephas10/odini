import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Terms and Conditions | ODINI",
}

const EFFECTIVE_DATE = "9 October 2026"
const LAST_UPDATED = "9 October 2026"

// Each section: a heading and its paragraphs, word for word from the ODINI terms document.
const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: "Agreement and company information",
    paragraphs: [
      "These Terms govern use of the ODINI website, applications and related services operated by ODINI Technologies Limited (“ODINI”, “we”, “us”). By creating an account or using the platform, you agree to these Terms and our Privacy Policy.",
      "Registered company number: 120251038014. Incorporated on 23 December 2025 in Zambia. Legal correspondence address: Plot 2786, Off Airport Road, Meanwood Ndeke, Lusaka, Lusaka Province, Zambia. Contact email: odinizambia@gmail.com. Telephone: +260 967 047 847 / +260 778 002 538.",
    ],
  },
  {
    title: "What ODINI provides",
    paragraphs: [
      "ODINI is a discovery and booking platform for stays, events and activities in Zambia. Independent accommodation providers, event organisers and activity operators (“Partners”) ordinarily provide the underlying experiences. ODINI does not provide transport.",
      "Some platform features may be in testing or unavailable. Descriptions of future AI concierge, verification or safety functionality must not be presented as active until implemented.",
    ],
  },
  {
    title: "Eligibility and accounts",
    paragraphs: [
      "You must be legally capable of entering into the relevant transaction, or have appropriate parent/guardian authorisation where lawful. Partners must have authority to act for their business. You must provide accurate details, protect account credentials and promptly report suspected unauthorised access.",
      "We may suspend accounts for fraud, serious misuse, legal requirements or security risks, subject to applicable law and fair review where appropriate.",
    ],
  },
  {
    title: "Listings, availability and Partner obligations",
    paragraphs: [
      "Partners are responsible for the accuracy of listing descriptions, dates, prices, capacity, eligibility rules, venue details, licences and permits, safety arrangements and delivery of their services. ODINI may review, request evidence for, reject or remove listings.",
      "Partners must not post misleading, unlawful, discriminatory or unsafe offerings, counterfeit tickets or content infringing third-party rights. Any verification indicator reflects only checks actually performed and is not a guarantee of safety or quality.",
    ],
  },
  {
    title: "Booking process and contract",
    paragraphs: [
      "Before checkout, users should be able to review the listing, dates, quantities, full payable amount, relevant restrictions and cancellation terms, and correct errors. A booking request is not confirmed merely because a payment method is selected.",
      "A confirmed booking requires the applicable provider acceptance and/or verified successful payment as described at checkout. We will issue a booking reference or confirmation after the required steps complete. Partners must honour valid confirmed bookings subject to disclosed restrictions and applicable law.",
    ],
  },
  {
    title: "Prices, fees and payments",
    paragraphs: [
      "Prices will be shown in Zambian kwacha (ZMW) unless otherwise indicated. The checkout will disclose the total price, taxes and applicable service or processing fees before payment.",
      "ODINI may charge Partners commissions or ticketing fees under separate written Partner terms. Proposed current commercial structure: 8% on event ticketing and 10% on stays and activities, subject to final approval and any disclosed changes. These are Partner-facing terms, not an undisclosed consumer surcharge.",
      "Payments may be handled by authorised third-party processors, including mobile money and card providers when enabled. No booking may be marked paid until payment is verified. ODINI will provide the applicable processor disclosures before launch.",
    ],
  },
  {
    title: "Cancellations, refunds and rescheduling",
    paragraphs: [
      "Each listing must display its applicable cancellation and refund conditions before purchase, together with the identity of the responsible provider and a support route. These conditions remain subject to mandatory consumer rights under Zambian law.",
      "If a Partner cancels, substantially changes or cannot deliver a confirmed service, the Partner and ODINI will cooperate to provide legally required remedies, which may include refunds or alternatives accepted by the customer. No blanket “all sales final” statement overrides mandatory rights.",
      "Refund processing method, time frames, allocation of processing fees, no-show treatment and chargeback responsibilities require an approved ODINI Refund Policy and Partner Agreement before live payments.",
    ],
  },
  {
    title: "Events and admission",
    paragraphs: [
      "Event organisers are responsible for event licences, lawful capacity, admission rules, venue safety, scheduling, performer and attendee communications, and ticket validation. Users must comply with reasonable venue rules and applicable law.",
      "Age restrictions, accessibility information and material attendance conditions must be disclosed on the event listing.",
    ],
  },
  {
    title: "Stays and activities",
    paragraphs: [
      "Accommodation Partners must disclose check-in/check-out times, occupancy limits, house rules, mandatory charges and cancellation terms. Activity Partners must describe prerequisites, accessibility, scheduling, safety guidance and any material restrictions.",
      "Users must provide accurate participant details and follow reasonable, lawful safety instructions. Nothing in these Terms excludes liability that cannot lawfully be excluded.",
    ],
  },
  {
    title: "Content and acceptable use",
    paragraphs: [
      "Users and Partners retain ownership of content they submit, but grant ODINI a limited, non-exclusive licence to host, display and process that content to operate and promote the relevant listing or platform, subject to privacy law.",
      "Do not upload unlawful, deceptive, infringing or malicious content; scrape protected information; interfere with security; impersonate others; or manipulate bookings, reviews, referrals or payouts.",
    ],
  },
  {
    title: "Recommendations and AI",
    paragraphs: [
      "Search rankings and recommendations may reflect relevance, availability, preferences and other disclosed signals. They are suggestions, not guarantees. Any AI-generated information should be checked against Partner details before purchase.",
      "If third-party AI features are activated, ODINI will publish additional notices covering relevant inputs, processing and limitations. Do not submit another person’s sensitive information to optional AI tools.",
    ],
  },
  {
    title: "Communications and privacy",
    paragraphs: [
      "Transactional messages may be sent to manage bookings, security and service changes. Promotional communications will follow applicable consent and opt-out requirements. Personal information is handled under ODINI’s Privacy Policy.",
    ],
  },
  {
    title: "Service availability and changes",
    paragraphs: [
      "We may maintain, update or temporarily interrupt the platform. We will take reasonable steps to address errors and communicate material changes. We do not guarantee uninterrupted access.",
    ],
  },
  {
    title: "Responsibility and liability",
    paragraphs: [
      "Partners are responsible for the services they supply, while ODINI remains responsible for its own conduct and obligations under applicable law. Nothing in these Terms excludes liability for fraud, wilful misconduct, or rights that cannot lawfully be excluded.",
      "Any limitation of liability, indemnity or allocation of chargeback risk must be separately reviewed by Zambia-qualified counsel and must not override mandatory consumer protection law. No arbitrary monetary liability cap is adopted in this draft.",
    ],
  },
  {
    title: "Complaints and dispute resolution",
    paragraphs: [
      "Contact odinizambia@gmail.com with your booking reference and details of the problem. We will acknowledge complaints and seek resolution with the relevant Partner.",
      "These Terms are governed by the laws of Zambia, subject to any mandatory rights or jurisdictional rules. Parties may seek appropriate remedies through competent Zambian authorities and courts.",
    ],
  },
  {
    title: "Changes and termination",
    paragraphs: [
      "We may update these Terms prospectively, with appropriate notice for material changes. The version applicable to a completed transaction will remain available where required. You may request account closure, subject to unsettled transactions and lawful recordkeeping.",
    ],
  },
  {
    title: "Contact and related documents",
    paragraphs: [
      "ODINI Technologies Limited — Plot 2786, Off Airport Road, Meanwood Ndeke, Lusaka, Lusaka Province, Zambia, odinizambia@gmail.com, +260 967 047 847 / +260 778 002 538.",
      "Related documents to finalise: Privacy Policy; Refund & Cancellation Policy; Event Organizer / Business Partner Agreement; Payment & Payout Terms; Cookie Notice (if applicable).",
    ],
  },
]

// Public page (outside /user) so people can read it before they sign up.
export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header band */}
      <section className="bg-[#7A1F2B]">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#F7EDEF]/80 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-[#F7EDEF]/80">
            ODINI
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Terms and Conditions
          </h1>
          <p className="mt-3 text-[#F7EDEF]/90">
            Rules for using the ODINI platform and booking experiences
          </p>
          <p className="mt-4 text-sm text-[#F7EDEF]/70">
            Effective date: {EFFECTIVE_DATE} &nbsp;|&nbsp; Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Draft notice */}
        <div className="rounded-xl border border-[#D4A64A]/40 bg-[#D4A64A]/10 px-4 py-3 text-sm text-gray-700">
          <strong className="font-semibold text-gray-900">Draft:</strong> these terms are under
          legal and operational review and may change before ODINI launches publicly.
        </div>

        {/* Contents */}
        <nav
          aria-label="Contents"
          className="mt-8 rounded-2xl border border-[#7A1F2B]/15 bg-white p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#7A1F2B]">
            Contents
          </h2>
          <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {SECTIONS.map((section, i) => (
              <li key={section.title}>
                <a href={`#section-${i + 1}`} className="text-gray-600 hover:text-[#7A1F2B]">
                  {i + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="mt-8 space-y-8 rounded-2xl bg-white p-6 shadow-sm sm:p-10">
          {SECTIONS.map((section, i) => (
            <section key={section.title} id={`section-${i + 1}`} className="scroll-mt-24">
              <h2 className="text-lg font-semibold text-gray-900">
                <span className="text-[#7A1F2B]">{i + 1}.</span> {section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="leading-7 text-gray-600">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}