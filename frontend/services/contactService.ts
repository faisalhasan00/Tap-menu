import { apiRoutes } from '@/config/routes';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  restaurantName?: string;
  message: string;
}

interface ContactResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
  };
  errors?: string[];
}

export const contactService = {
  /**
   * Submit contact form
   */
  async submitContact(formData: ContactFormData): Promise<ContactResponse> {
    try {
      const response = await fetch(apiRoutes.contact.submit, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit contact form');
      }

      return data;
    } catch (error) {
      console.error('❌ [CONTACT_SERVICE] Error submitting contact form:', error);
      throw error;
    }
  },
};

