import Header from '@/components/layout/Header'
import SearchForm from '@/components/ui/SearchForm'
import { ShieldCheck, BadgePercent, Headphones, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="bg-slate-50 text-slate-800">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative h-[68vh] min-h-[560px] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80')",
            }}
          >
            {/* Layered gradient overlay for stronger text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-medium ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5 text-accent-400" />
              Trusted by travellers worldwide
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
              Find your perfect stay
            </h1>
            <p className="mt-4 text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-slate-100/90">
              Discover great hotels worldwide with transparent pricing and seamless booking.
            </p>

            <div className="mt-10 max-w-4xl mx-auto">
              <SearchForm />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-700">
                Why TripSync
              </p>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
                Booking, simplified
              </h2>
              <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
                A modern, secure, and affordable way to plan and book your next trip.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<BadgePercent className="h-7 w-7" />}
                title="Best price guarantee"
                description="Real-time comparisons across top providers ensure you always get the best available rate."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-7 w-7" />}
                title="Secure booking"
                description="Bank-level security keeps your payments and personal information fully protected."
              />
              <FeatureCard
                icon={<Headphones className="h-7 w-7" />}
                title="24/7 support"
                description="A dedicated support team available around the clock, whenever you need us."
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group relative p-8 bg-white rounded-2xl border border-slate-200 hover:border-primary-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="w-14 h-14 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  )
}
