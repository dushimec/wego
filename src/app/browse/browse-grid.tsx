'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { serviceTypeDetails } from '@/lib/types';
import { FeaturedServicesCarousel } from '@/components/featured-services-carousel';

const PAGE_SIZE = 6;

export function BrowseGrid() {
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultsGridRef = useRef<HTMLDivElement>(null);

  const carsQuery = useMemoFirebase(() => collection(firestore, 'cars'), [firestore]);
  const driversQuery = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);

  const { data: allCars, isLoading: carsLoading } = useCollection<Car>(carsQuery);
  const { data: allDrivers, isLoading: driversLoading } = useCollection<Driver>(driversQuery);

  const [serviceType, setServiceType] = useState(searchParams.get('service') || 'car-only');
  const [filteredData, setFilteredData] = useState<Array<Car | Driver> | null>(null);
  const [displayedItems, setDisplayedItems] = useState<Array<Car | Driver> | null>(null);
  const [page, setPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [fuelType, setFuelType] = useState('all');
  const [brand, setBrand] = useState('all');
  const [category, setCategory] = useState('all');
  const [seats, setSeats] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [sortOrder, setSortOrder] = useState('any');
  const [driverRating, setDriverRating] = useState(0);
  const [location, setLocation] = useState('all');
  const [driverPriceRange, setDriverPriceRange] = useState([0, 50000]);


  const brands = useMemo(() => {
    if (!allCars) return ['all'];
    return ['all', ...Array.from(new Set(allCars.map(car => car.brand)))];
  }, [allCars]);
  
    const categories = useMemo(() => {
    if (!allCars) return ['all'];
    return ['all', ...Array.from(new Set(allCars.map(car => car.category)))];
  }, [allCars]);

    const locations = useMemo(() => {
    if (!allCars) return ['all'];
    return ['all', ...Array.from(new Set(allCars.map(car => car.location)))];
  }, [allCars]);

  useEffect(() => {
    let data: Array<Car | Driver> = [];

    if (serviceType === 'car-only' && allCars) {
      data = allCars.filter(car => car.serviceOptions && car.serviceOptions.includes('car-only'));
    } else if (serviceType === 'car-with-driver' && allCars) {
      data = allCars.filter(car => car.serviceOptions && car.serviceOptions.includes('car-with-driver'));
    } else if (serviceType === 'driver-only' && allDrivers) {
      data = allDrivers.filter(driver => driver.serviceOptions && driver.serviceOptions.includes('driver-only'));
    }

    if (searchTerm) {
        data = data.filter(item => {
            if ('brand' in item) { // It's a Car
                return item.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       item.model.toLowerCase().includes(searchTerm.toLowerCase());
            } else { // It's a Driver
                return item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       item.lastName.toLowerCase().includes(searchTerm.toLowerCase());
            }
        });
    }

    if (serviceType !== 'driver-only') {
        let carData = data as Car[];
        if (fuelType !== 'all') {
            carData = carData.filter(car => car.fuelType === fuelType);
        }
        if (brand !== 'all') {
            carData = carData.filter(car => car.brand === brand);
        }
         if (category !== 'all') {
            carData = carData.filter(car => car.category === category);
        }
        if (seats !== 'all') {
            carData = carData.filter(car => car.seats >= parseInt(seats));
        }
         if (location !== 'all') {
            carData = carData.filter(car => car.location === location);
        }
        carData = carData.filter(car => car.pricePerDay >= priceRange[0] && car.pricePerDay <= priceRange[1]);
        if (sortOrder === 'low-to-high') {
            carData.sort((a, b) => a.pricePerDay - b.pricePerDay);
        } else if (sortOrder === 'high-to-low') {
            carData.sort((a, b) => b.pricePerDay - a.pricePerDay);
        }
        data = carData;
    } else {
        let driverData = data as Driver[];
        if (driverRating > 0) {
            driverData = driverData.filter(driver => (driver.rating || 0) >= driverRating);
        }
        driverData = driverData.filter(driver => (driver.experience * 2500) >= driverPriceRange[0] && (driver.experience * 2500) <= driverPriceRange[1]);
        data = driverData;
    }

    setFilteredData(data);
    setPage(1);
  }, [searchTerm, fuelType, brand, category, seats, priceRange, sortOrder, driverRating, allCars, allDrivers, serviceType, location, driverPriceRange]);

  useEffect(() => {
    if (filteredData) {
      setDisplayedItems(filteredData.slice(0, page * PAGE_SIZE));
    }
  }, [filteredData, page]);

  const handleServiceTypeChange = (value: string) => {
    setServiceType(value);
    router.push(`/browse?service=${value}`);
  };

  const handleBookNowClick = () => {
    resultsGridRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const isLoading = carsLoading || driversLoading;

  return (
    <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-headline font-bold mb-2">Find Your Perfect Ride.</h1>
            <p className="text-lg text-muted-foreground">Browse available cars and drivers for any service: Car + Driver, Car Only, or Driver Only.</p>
            <Button onClick={handleBookNowClick} className="mt-4">Book Now</Button>
        </div>
        
        <FeaturedServicesCarousel />

      <div className="mb-8">
          <Tabs value={serviceType} onValueChange={handleServiceTypeChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                  {serviceTypeDetails.map((service) => (
                      <TabsTrigger key={service.id} value={service.id}>
                          {service.name}
                      </TabsTrigger>
                  ))}
              </TabsList>
          </Tabs>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="lg:w-1/4">
          <div className="p-4 bg-card rounded-lg border space-y-6 sticky top-24">
            <h3 className="text-xl font-semibold">Search & Filter</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">search</span>
                <Input placeholder={serviceType === 'driver-only' ? "e.g., John Doe" : "e.g., Toyota RAV4"} className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>

            {serviceType === 'driver-only' ? (
                <>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Minimum Rating</label>
                        <Select value={driverRating.toString()} onValueChange={value => setDriverRating(Number(value))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Any</SelectItem>
                                <SelectItem value="4">4+ ★</SelectItem>
                                <SelectItem value="4.5">4.5+ ★</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-sm font-medium">Price Range (RWF/hr)</label>
                      <Slider
                        min={0}
                        max={50000}
                        step={1000}
                        value={driverPriceRange}
                        onValueChange={(value) => setDriverPriceRange(value as [number, number])}
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{driverPriceRange[0].toLocaleString()}</span>
                        <span>{driverPriceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                </>
            ) : (
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
                      {brands.map(b => <SelectItem key={b} value={b}>{b === 'all' ? 'All Brands' : b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All Categories' : c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                 <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {locations.map(l => <SelectItem key={l} value={l}>{l === 'all' ? 'All Locations' : l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Seats</label>
                    <Select value={seats} onValueChange={setSeats}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
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
        </aside>

        {/* Main Grid */}
        <main ref={resultsGridRef} className="lg:w-3/4">
            {isLoading || !displayedItems ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        serviceType === 'driver-only' ? <DriverCard key={i} driver={null} /> : <CarCard key={i} car={null} />
                    ))}
                </div>
            ) : displayedItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {displayedItems.map((item) => (
                      'brand' in item ? <CarCard key={item.id} car={item as Car} /> : <DriverCard key={item.id} driver={item as Driver} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-2xl font-semibold mb-2">No Results Found</h2>
                    <p className="text-muted-foreground">Try adjusting your filters.</p>
                </div>
            )}
            {filteredData && displayedItems && filteredData.length > displayedItems.length && (
                <div className="mt-8 text-center">
                    <Button onClick={loadMore}>Load More</Button>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}
