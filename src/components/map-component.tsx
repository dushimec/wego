'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Car, Location } from '@/lib/types';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';

// Fix for default icon path issue with webpack
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Custom user icon with a different color
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


type MapComponentProps = {
    center: [number, number];
    cars: Car[];
    locations: Location[];
    userLocation: [number, number] | null;
    nearestLocation: Location | null;
};

function MapFlyTo({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(position, 13);
    }, [map, position]);
    return null;
}

export default function MapComponent({ center, cars, locations, userLocation, nearestLocation }: MapComponentProps) {
    return (
        <MapContainer center={center} zoom={9} scrollWheelZoom={true} style={{ height: '600px', width: '100%' }}>
            {nearestLocation && <MapFlyTo position={nearestLocation.position} />}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map(location => (
              <Marker key={location.id} position={location.position} opacity={nearestLocation && nearestLocation.id !== location.id ? 0.5 : 1}>
                <Popup>
                    <div className="p-2">
                        <h3 className="font-bold text-lg mb-2">{location.name}</h3>
                        <div className="space-y-2">
                           <p className="font-semibold">Available Cars:</p>
                           {location.carIds.map(carId => {
                               const car = cars.find(c => c.id === carId);
                               if (!car) return null;
                               return (
                                   <Card key={car.id} className="p-2">
                                       <CardTitle className="text-sm">{car.name}</CardTitle>
                                       <CardContent className="p-0 mt-1">
                                           <p className="text-xs text-muted-foreground">{car.pricePerDay.toLocaleString()} RWF/day</p>
                                           <Button asChild variant="link" className="p-0 h-auto text-xs mt-1">
                                               <Link href={`/browse/${car.id}`}>View Details</Link>
                                           </Button>
                                       </CardContent>
                                   </Card>
                               )
                           })}
                        </div>
                    </div>
                </Popup>
              </Marker>
            ))}
             {userLocation && (
              <Marker position={userLocation} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
            )}
        </MapContainer>
    )
}
