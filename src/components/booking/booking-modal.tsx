import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingForm } from "./booking-form";
import type { Car, Driver } from "@/lib/types";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  car: Car | null;
  driver?: Driver | null;
}

export function BookingModal({ open, onOpenChange, car, driver }: BookingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Your Ride</DialogTitle>
        </DialogHeader>
        {car && <BookingForm car={car} driver={driver} onBookingConfirmed={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}
