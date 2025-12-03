"use client"

import { HeroSearchForm } from "@/components/hero-search-form"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { CarCard } from "@/components/car-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { collection } from "firebase/firestore"
import type { Car } from "@/lib/types"
import { useLanguage } from "@/hooks/use-language"
import { useTranslation } from "@/lib/i18n"

export default function Home() {
  const firestore = useFirestore()
  const carsQuery = useMemoFirebase(() => collection(firestore, "cars"), [firestore])
  const { data: cars, isLoading } = useCollection<Car>(carsQuery)
  const featuredCars = cars?.slice(0, 3) || []

  const { language } = useLanguage()
  const t = useTranslation(language)

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-screen overflow-hidden">
        <video
          src="https://res.cloudinary.com/drwi9cpdi/video/upload/v1760387629/202510132120_siq18y.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center text-white">
        <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 animate-fade-in-up">
            <span className="text-white">We</span><span className="text-primary">Go</span>
            <span className="text-white"> – Your Journey, Your Car</span>
        </h1>
          <p className="text-base md:text-lg text-primary-foreground/90 max-w-3xl mb-4 animate-fade-in-up animation-delay-300 leading-relaxed">
            <span className="font-semibold block mb-2">{t("hero.subtitle")}</span>
            {t("hero.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up animation-delay-600">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/booking">{t("hero.bookCarWithDriver")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 border-white text-white hover:bg-white/10 bg-transparent"
            >
              <Link href="/browse">{t("hero.browseCarOnly")}</Link>
            </Button>
          </div>
          <div className="w-full max-w-4xl animate-fade-in-up animation-delay-600">
            <HeroSearchForm />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t("hero.howitworks")}</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary mb-4">
                <span className="material-symbols-outlined text-4xl text-primary">search</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("hero.findCar")}</h3>
              <p className="text-muted-foreground">{t("hero.findCarDesc")}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary mb-4">
                <span className="material-symbols-outlined text-4xl text-primary">calendar_month</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("hero.bookEase")}</h3>
              <p className="text-muted-foreground">{t("hero.bookEaseDesc")}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary mb-4">
                <span className="material-symbols-outlined text-4xl text-primary">directions_car</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("hero.enjoyRide")}</h3>
              <p className="text-muted-foreground">{t("hero.enjoyRideDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">{t("hero.featuredCars")}</h2>
            <p className="text-muted-foreground mt-2">{t("hero.featuredCarsDesc")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <CarCard key={i} car={null} />)
              : featuredCars.map((car) => <CarCard key={car.id} car={car} generateImage={true} />)}
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/browse">{t("hero.browseAllCars")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">{t("hero.aboutUs")}</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <span className="material-symbols-outlined text-4xl text-primary">track_changes</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">{t("hero.ourMission")}</h3>
              <p className="text-muted-foreground">{t("hero.ourMissionDesc")}</p>
            </div>
            <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <span className="material-symbols-outlined text-4xl text-primary">visibility</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">{t("hero.ourVision")}</h3>
              <p className="text-muted-foreground">{t("hero.ourVisionDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t("hero.whyChooseUs")}</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <span className="material-symbols-outlined text-4xl text-primary">thumb_up</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("hero.simpleBooking")}</h3>
              <p className="text-muted-foreground">{t("hero.simpleBookingDesc")}</p>
            </div>
            <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <span className="material-symbols-outlined text-4xl text-primary">verified_user</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("hero.verifiedOwners")}</h3>
              <p className="text-muted-foreground">{t("hero.verifiedOwnersDesc")}</p>
            </div>
            <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <span className="material-symbols-outlined text-4xl text-primary">schedule</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("hero.clearAvailability")}</h3>
              <p className="text-muted-foreground">{t("hero.clearAvailabilityDesc")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
