export type UserRole = "admin" | "manager" | "driver" | "renter";

export type User = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  profileImage?: string;
  dateOfBirth?: string;
  nationalId?: string;
  nationalIdExpiry?: string;
  driverLicenseNumber?: string;
  driverLicenseExpiry?: string;
  documents?: {
    type: "id" | "license" | "registration" | "insurance";
    url: string;
    uploadedAt: string;
    verified: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

export type Car = {
  id: string;
  managerId: string;
  ownerId?: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  category: "SUV" | "Sedan" | "Van" | "Economy" | "Luxury" | "Minibus";
  fuelType: "Gasoline" | "Electric" | "Hybrid" | "Diesel";
  transmission: "Automatic" | "Manual";
  seats: number;
  images: string[];
  cloudinaryUrl?: string;
  fileUrl?: string;
  location: string;
  available: boolean;
  unavailabilityReason?: string;
  availabilityDates?: { start: string; end: string }[];
  description: string;
  features: string[];
  registrationNumber: string;
  registrationExpiry: string;
  insurance?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  maintenanceSchedule?: {
    lastServiceDate: string;
    nextServiceDate: string;
    mileage: number;
  };
  serviceOptions: ("car-only" | "car-with-driver")[];
  createdAt: string;
  updatedAt: string;
};

export type BookingExtra = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "navigation" | "safety" | "convenience" | "other";
};

export type Booking = {
  id: string;
  carId?: string;
  driverId?: string;
  customerId: string;
  managerId?: string;
  bookingType: "car-only" | "car-with-driver" | "driver-only";
  pickupLocation: string;
  dropoffLocation: string;
  startDate: string;
  endDate: string;
  pickupTime?: string;
  dropoffTime?: string;
  basePrice: number;
  extras?: {
    extraId: string;
    quantity: number;
    price: number;
  }[];
  taxAmount: number;
  deposit?: number;
  totalPrice: number;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled" | "in-progress";
  paymentStatus: "pending" | "paid" | "partial" | "refunded";
  paymentMethod?: "card" | "mobile-money" | "cash" | "bank-transfer";
  invoiceNumber?: string;
  invoiceUrl?: string;
  cancellationReason?: string;
  isPaid?: boolean;
  transactionId?: string;
  paidAt?: Date;
  issues?: {
    reportedAt: Date;
    description: string;
    reportedBy: string;
  }[];
  hasIssue?: boolean;
  cancelledAt?: Date;
  cancelledBy?: "renter" | "manager";
  cancellationDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "booking_update" | "system_alert" | "payment_update" | "driver_assignment" | "cancellation";
  channel?: "in-app" | "email" | "sms" | "all";
  read: boolean;
  createdAt: string;
  processed?: boolean;
  deliveryResults?: {
    email?: { sent: boolean; error?: string };
    sms?: { sent: boolean; error?: string };
  };
};

export type Location = {
  id: string;
  name: string;
  position: [number, number];
  city: string;
  address: string;
  carIds: string[];
};

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  address: string;
  profileImage: string;
  documents: {
    type: "license" | "id" | "certification";
    url: string;
    uploadedAt: string;
    verified: boolean;
  }[];
  experience: number; // years
  languages: string[];
  available: boolean;
  bio: string;
  rating?: number;
  totalTrips?: number;
  completedTrips?: number;
  cancelledTrips?: number;
  vehiclePreferences?: string[];
  certifications?: {
    name: string;
    issueDate: string;
    expiryDate: string;
  }[];
  performanceMetrics?: {
    averageRating: number;
    onTimePercentage: number;
    customerSatisfaction: number;
  };
  serviceOptions: ("driver-only" | "car-with-driver")[];
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type DriverAssignment = {
  id: string;
  bookingId: string;
  driverId: string;
  assignedAt: string;
  completedAt?: string;
  status: "assigned" | "accepted" | "started" | "completed" | "cancelled";
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  customerId: string;
  issueDate: string;
  dueDate: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  status: "draft" | "issued" | "partial" | "paid" | "overdue" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = {
  id: string;
  invoiceId: string;
  bookingId: string;
  customerId: string;
  amount: number;
  method: "card" | "mobile-money" | "cash" | "bank-transfer";
  provider?: string;
  transactionId?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentDate: string;
  refundDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export const serviceTypeDetails = [
    {
        id: "car-only",
        name: "Car Only",
        description: "Rent a car without a driver. Full control, endless possibilities.",
        image: "/images/services/car-only.jpg",
    },
    {
        id: "car-with-driver",
        name: "Car + Driver",
        description: "A premium vehicle with a professional driver. Sit back and relax.",
        image: "/images/services/car-with-driver.jpg",
    },
    {
        id: "driver-only",
        name: "Driver Only",
        description: "Hire a professional driver for your own car. Convenience on your terms.",
        image: "/images/services/driver-only.jpg",
    },
];
