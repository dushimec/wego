'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Car, Driver } from '@/lib/types';
import { CarCard } from '@/components/car-card';
import { DriverCard } from '@/components/driver-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { AnimatedSection } from '@/components/animated-section';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

export function BrowseGrid() {
  const firestore = useFirestore();
  const carsQuery = useMemoFirebase(() => collection(firestore, 'cars'), [firestore]);
  const driversQuery = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);

  const { data: allCars, isLoading: carsLoading } = useCollection<Car>(carsQuery);
  const { data: allDrivers, isLoading: driversLoading } = useCollection<Driver>(driversQuery);

  const searchParams = useSearchParams();
  const [filteredCars, setFilteredCars] = useState<Car[] | null>(null);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[] | null>(null);

  const [serviceType, setServiceType] = useState('Cars');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [fuelType, setFuelType] = useState('all');
  const [brand, setBrand] = useState('all');
  const [seats, setSeats] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [sortOrder, setSortOrder] = useState('any');

  const brands = useMemo(() => {
    if (!allCars) return ['all'];
    return ['all', ...Array.from(new Set(allCars.map(car => car.brand)))];
  }, [allCars]);

  useEffect(() => {
    if (serviceType === 'Cars' && allCars) {
      let cars = [...allCars];

      if (searchTerm) {
        cars = cars.filter(car =>
          car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.model.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (fuelType !== 'all') {
        cars = cars.filter(car => car.fuelType === fuelType);
      }

      if (brand !== 'all') {
        cars = cars.filter(car => car.brand === brand);
      }

      if (seats !== 'all') {
        cars = cars.filter(car => car.seats >= parseInt(seats));
      }

      cars = cars.filter(car => car.pricePerDay >= priceRange[0] && car.pricePerDay <= priceRange[1]);

      if (sortOrder === 'low-to-high') {
        cars.sort((a, b) => a.pricePerDay - b.pricePerDay);
      } else if (sortOrder === 'high-to-low') {
        cars.sort((a, b) => b.pricePerDay - a.pricePerDay);
      }

      // ✅ FIX: Ensure every car has a stable unique key
      setFilteredCars(
        cars.map((car, index) => ({
          ...car,
          id: car.id ?? `car-${index}`,
        }))
      );

    } else if (serviceType === 'Drivers' && allDrivers) {
      let drivers = [...allDrivers];

      if (searchTerm) {
        drivers = drivers.filter(driver =>
          `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // ✅ FIX: Ensure every driver has a stable unique key
      setFilteredDrivers(
        drivers.map((driver, index) => ({
          ...driver,
          id: driver.id ?? `driver-${index}`,
        }))
      );
    }
  }, [
    serviceType,
    searchTerm,
    fuelType,
    brand,
    seats,
    priceRange,
    sortOrder,
    allCars,
    allDrivers
  ]);

  const isLoading = carsLoading || driversLoading;

  return (
    <AnimatedSection className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-headline font-bold mb-2">Browse Our Fleet</h1>
        <p className="text-lg text-muted-foreground">Find the perfect car or driver for your journey.</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <motion.aside variants={fadeInUp} className="lg:w-1/4">
          <div className="p-4 bg-card rounded-lg border space-y-6 sticky top-24">
            <h3 className="text-xl font-semibold">Search & Filter</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type</label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cars">Cars</SelectItem>
                  <SelectItem value="Drivers">Drivers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search by name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">search</span>
                <Input
                  placeholder={serviceType === 'Cars' ? "e.g., Toyota RAV4" : "e.g., John Doe"}
                  className="pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {serviceType === 'Cars' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fuel Type</label>
                  <Select value={fuelType} onValueChange={setFuelType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Gasoline">Gasoline</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand</label>
                  <Select value={brand} onValueChange={setBrand}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {brands.map(b => (
                        <SelectItem key={b} value={b}>
                          {b === 'all' ? 'All Brands' : b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Seats</label>
                  <Select value={seats} onValueChange={setSeats}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                      <SelectItem value="7">7+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Price Range (RWF/day)</label>
                  <Slider
                    min={0}
                    max={200000}
                    step={5000}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{priceRange[0].toLocaleString()}</span>
                    <span>{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort by price</label>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Relevance</SelectItem>
                      <SelectItem value="low-to-high">Low to High</SelectItem>
                      <SelectItem value="high-to-low">High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </motion.aside>

        <main className="lg:w-3/4">
          {isLoading ? (
            <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div variants={fadeInUp} key={`${serviceType}-${i}`}>
                  {serviceType === 'Cars' ?
                    <CarCard car={null} /> :
                    <DriverCard driver={null} />}
                </motion.div>
              ))}
            </AnimatedSection>
          ) : serviceType === 'Cars' && filteredCars ? (
            filteredCars.length > 0 ? (
              <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredCars.map((car) => (
                  <motion.div variants={fadeInUp} key={car.id}>
                    <CarCard car={car} />
                  </motion.div>
                ))}
              </AnimatedSection>
            ) : (
              <AnimatedSection className="flex flex-col items-center justify-center h-full text-center py-16 border-2 border-dashed rounded-lg">
                <h2 className="text-2xl font-semibold mb-2">No Cars Found</h2>
                <p className="text-muted-foreground">Try adjusting your filters to find the perfect car.</p>
              </AnimatedSection>
            )
          ) : serviceType === 'Drivers' && filteredDrivers ? (
            filteredDrivers.length > 0 ? (
              <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredDrivers.map((driver) => (
                  <motion.div variants={fadeInUp} key={driver.id}>
                    <DriverCard driver={driver} />
                  </motion.div>
                ))}
              </AnimatedSection>
            ) : (
              <AnimatedSection className="flex flex-col items-center justify-center h-full text-center py-16 border-2 border-dashed rounded-lg">
                <h2 className="text-2xl font-semibold mb-2">No Drivers Found</h2>
                <p className="text-muted-foreground">Try adjusting your search to find the perfect driver.</p>
              </AnimatedSection>
            )
          ) : null}
        </main>
      </div>
    </AnimatedSection>
  );
}
