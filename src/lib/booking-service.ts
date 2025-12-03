import { db } from "./firebase-admin";
import { functions } from "../firebase/config";
import type { Booking, Driver } from "./types";

export const bookingService = {
    async createBooking(bookingData: Omit<Booking, "id" | "createdAt" | "updatedAt">): Promise<Booking> {
        const docRef = db.collection("bookings").doc();
        const booking: Booking = {
            ...bookingData,
            id: docRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await docRef.set(booking);
        return booking;
    },

    async getBookingById(bookingId: string): Promise<Booking | null> {
        const doc = await db.collection("bookings").doc(bookingId).get();
        return doc.exists ? (doc.data() as Booking) : null;
    },

    async getBookingsByCustomerId(customerId: string): Promise<Booking[]> {
        const querySnapshot = await db
            .collection("bookings")
            .where("customerId", "==", customerId)
            .orderBy("createdAt", "desc")
            .get();

        return querySnapshot.docs.map((doc) => doc.data() as Booking);
    },

    async updateBookingStatus(bookingId: string, status: Booking["status"]): Promise<void> {
        await db.collection("bookings").doc(bookingId).update({
            status,
            updatedAt: new Date().toISOString(),
        });
    },

    async cancelBooking(bookingId: string, reason: string): Promise<void> {
        await db.collection("bookings").doc(bookingId).update({
            status: "cancelled",
            cancellationReason: reason,
            cancellationDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    },

    async calculatePrice(data: any): Promise<any> {
        const calculatePrice = functions.httpsCallable('calculatePrice');
        try {
            const result = await calculatePrice(data);
            return result.data;
        } catch (error) {
            console.error('Error calculating price:', error);
            throw new Error('Error calculating price');
        }
    },

    trackDriverLocation(driverId: string, callback: (location: any) => void): () => void {
        const driverLocationRef = db.collection('drivers').doc(driverId).collection('currentLocation');
        const unsubscribe = driverLocationRef.onSnapshot((snapshot) => {
            if (!snapshot.empty) {
                const locationData = snapshot.docs[0].data();
                callback(locationData);
            }
        });
        return unsubscribe;
    },
};
