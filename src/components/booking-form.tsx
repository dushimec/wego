import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Car, Driver } from "@/lib/types";

interface BookingFormProps {
    car: Car;
    driver?: Driver | null;
    onBookingConfirmed: () => void;
}

export function BookingForm({ car, driver, onBookingConfirmed }: BookingFormProps) {
    // TODO: Implement actual booking logic
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold">{car.brand} {car.model}</h3>
                {driver && <p className="text-sm text-muted-foreground">With {driver.firstName} {driver.lastName}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Location</Label>
                <Input id="pickup" placeholder="Enter pickup location" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dropoff">Dropoff Location</Label>
                <Input id="dropoff" placeholder="Enter dropoff location" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" />
                </div>
            </div>
            <Button onClick={onBookingConfirmed} className="w-full">Confirm & Pay</Button>
        </div>
    )
}
