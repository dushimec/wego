import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeFirebase } from '@/firebase';

const { functions } = initializeFirebase();

export const bookingClientService = {
  async calculatePrice(data: any): Promise<any> {
    const calculatePrice = httpsCallable(functions, 'calculatePrice');
    try {
      const result = await calculatePrice(data);
      return result.data;
    } catch (error) {
      console.error('Error calculating price:', error);
      throw new Error('Error calculating price');
    }
  },
};
