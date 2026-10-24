import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Dog, Sunset, Waves, QrCode, MapPin, Clock, Phone, MessageCircle, Check } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { LanguageProvider } from "@/i18n/LanguageProvider";

// Import images from public folder
const heroImg = "/hero-sign.jpg";
const sunsetRed = "/sunset-red.jpg";
const parasolSandbar = "/parasol-sandbar.jpg";
const parasolLowTide = "/parasol-low-tide.jpg";
const casuarina = "/casuarina-tables.jpg";
const patrons = "/patrons-lounge.jpg";
const dish = "/dish-fish.jpg";
const cocktail = "/cocktail-branded.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

interface InfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}

function InfoCard({ icon: Icon, title, body }: InfoCardProps) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-secondary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function HomePage() {
  const { t } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "PONTAL Carapitangui — Praia Bar em Barra Grande";
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Pôr do sol vermelho sobre a foz do Rio Carapitangui"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        </div>
        <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center items-center px-4 pb-8 pt-16 sm:px-6 sm:pb-12 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <img
              src="/logo-pontal.webp"
              alt="Pontal Carapitangui Logo"
              className="h-48 md:h-56 object-contain mx-auto drop-shadow-lg"
            />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.25em] text-white font-semibold"
            style={{ textShadow: '0 3px 10px rgba(0, 0, 0, 0.9)' }}
          >
            {t.hero.eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-2 max-w-3xl font-display text-4xl leading-[1.05] text-white sm:text-6xl lg:text-7xl font-bold"
            style={{ textShadow: '0 6px 16px rgba(0, 0, 0, 0.95)' }}
          >
            {t.hero.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-3 max-w-xl text-base text-white sm:text-lg font-medium"
            style={{ textShadow: '0 3px 10px rgba(0, 0, 0, 0.9)' }}
          >
            {t.hero.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 flex flex-wrap gap-3 justify-center"
          >
            <button
              onClick={() => navigate("/menu")}
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:bg-primary/90"
            >
              {t.hero.cta}
            </button>
            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="rounded-full border border-background/40 bg-background/10 px-6 py-3 text-sm font-medium text-background backdrop-blur-sm transition-colors hover:bg-background/20"
            >
              {t.hero.ctaSecondary}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl">
            {t.sections.experienceTitle}
          </h2>
          <p className="mt-3 text-muted-foreground">{t.sections.experienceLead}</p>
        </motion.div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, ...t.features.family },
            { icon: Dog, ...t.features.pet },
            { icon: Sunset, ...t.features.sunset },
            { icon: Waves, ...t.features.sports },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-accent/40"
            >
              <f.icon className="h-6 w-6 text-secondary" aria-hidden />
              <h3 className="mt-4 font-display text-xl">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gastronomy split */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <motion.div {...fadeUp} className="order-2 lg:order-1">
            <p className="text-xs uppercase tracking-[0.25em] text-secondary">
              {t.sections.gastronomyTitle}
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              {t.sections.gastronomyLead}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <img
                src={dish}
                alt="Prato grelhado de peixe servido em chapa de ferro"
                className="aspect-[3/4] w-full rounded-2xl object-cover"
                loading="lazy"
              />
              <img
                src={cocktail}
                alt="Drink azul autoral em taça com logo do Pontal Carapitangui"
                className="aspect-[3/4] w-full rounded-2xl object-cover"
                loading="lazy"
              />
            </div>
            <button
              onClick={() => navigate("/menu")}
              className="mt-8 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
            >
              {t.sections.viewMenu}
            </button>
          </motion.div>
          <motion.div {...fadeUp} className="order-1 lg:order-2">
            <img
              src={patrons}
              alt="Clientes relaxando sob guarda-sóis Pontal à beira-mar"
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-xl"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      {/* Tide / sandbar */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.img
            {...fadeUp}
            src={parasolLowTide}
            alt="Banco de areia exposto durante a maré baixa em frente ao Pontal"
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl"
            loading="lazy"
          />
          <motion.div {...fadeUp}>
            <h2 className="font-display text-3xl sm:text-4xl">
              {t.sections.tideTitle}
            </h2>
            <p className="mt-4 text-muted-foreground">{t.sections.tideBody}</p>
          </motion.div>
        </div>
      </section>

      {/* Sunset banner */}
      <section className="relative isolate overflow-hidden">
        <img
          src={sunsetRed}
          alt="Pôr do sol vermelho sobre a foz do Rio Carapitangui"
          className="h-[60vh] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-foreground/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <p className="font-display text-3xl text-background sm:text-5xl">
            {t.features.sunset.title}
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.header {...fadeUp} className="mb-14">
          <h2 className="font-display text-3xl sm:text-4xl">{t.brochure.historyTitle}</h2>
          <p className="mt-4 text-muted-foreground">{t.brochure.historyBody}</p>
        </motion.header>

        <motion.img
          {...fadeUp}
          src={casuarina}
          alt="Mesas sob as casuarinas do Pontal Carapitangui"
          className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl"
          loading="lazy"
        />

        <section className="mt-20 rounded-3xl bg-muted/40 p-8 sm:p-12">
          <h2 className="font-display text-3xl">{t.brochure.structureTitle}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {t.brochure.structureItems.map((item) => (
              <li key={item} className="flex items-start gap-3 text-foreground/90">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 grid items-center gap-10 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-3xl">{t.brochure.eventsTitle}</h2>
            <p className="mt-4 text-muted-foreground">{t.brochure.eventsBody}</p>
            <a
              href="https://wa.me/5573999999999"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t.brochure.eventsCta}
            </a>
          </motion.div>
          <div className="grid grid-cols-2 gap-3">
            <img
              src={patrons}
              alt=""
              className="aspect-[3/4] w-full rounded-2xl object-cover"
              loading="lazy"
            />
            <img
              src={sunsetRed}
              alt=""
              className="aspect-[3/4] w-full rounded-2xl object-cover"
              loading="lazy"
            />
          </div>
        </section>
      </section>

      {/* Ordering System Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-secondary/10 p-4">
              <QrCode className="h-8 w-8 text-secondary" />
            </div>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl">
            {t.sections.orderingTitle}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t.sections.orderingLead}
          </p>
          <button
            onClick={() => navigate("/menu")}
            className="mt-8 inline-flex rounded-full bg-secondary px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:bg-secondary/90"
          >
            {t.sections.orderingCta}
          </button>
        </motion.div>
      </section>

      {/* Gallery teaser */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">
              {t.sections.galleryTitle}
            </h2>
            <p className="mt-2 text-muted-foreground">{t.sections.gallerySubtitle}</p>
          </div>
        </motion.div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[parasolSandbar, casuarina, patrons, sunsetRed].map((src, i) => (
            <motion.img
              key={i}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.05 }}
              src={src}
              alt=""
              loading="lazy"
              className="aspect-square w-full rounded-2xl object-cover"
            />
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.header {...fadeUp} className="mb-12">
          <h2 className="font-display text-4xl sm:text-5xl">{t.contact.title}</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">{t.contact.lead}</p>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <InfoCard icon={MapPin} title="Endereço / Address" body={t.contact.address} />
            <InfoCard icon={Clock} title={t.contact.hours} body="Segunda a domingo / Mon–Sun" />
            <InfoCard icon={Phone} title={t.contact.phone} body="+55 (73) 99999-9999" />
            <InfoCard
              icon={MessageCircle}
              title={t.contact.reservations}
              body={t.contact.reservationsBody}
            />
            <a
              href="https://wa.me/5573999999999"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <MessageCircle className="h-4 w-4" />
              {t.contact.whatsapp}
            </a>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border shadow-lg h-[420px]">
            <iframe
              title="Pontal Carapitangui - Praia Bar"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3934.8234567890123!2d-38.9667684!3d-13.9003565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x73e9500328d0351%3A0x6f3a13c3926dd50f!2sPontal%20Carapitangui%20Praia%20Bar!5e0!3m2!1spt-BR!2sbr!4v1713450000000"
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              aria-hidden="false"
              tabIndex={0}
            />
          </div>
        </div>

        <section className="mt-16 rounded-3xl bg-muted/40 p-8 sm:p-12">
          <h3 className="font-display text-2xl">{t.contact.directionsTitle}</h3>
          <p className="mt-3 text-muted-foreground">{t.contact.directionsBody}</p>
        </section>
      </section>
    </>
  );
}

const Landing = () => {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <HomePage />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Landing;
