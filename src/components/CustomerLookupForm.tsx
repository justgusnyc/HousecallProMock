import { useEffect, useState } from 'react';
import { useToast } from './toast/ToastContext';
import { Customer, Job } from '@/types/customer';

interface CustomerLookupFormProps {
  setCustomerInfo: (customerInfo: { name?: string; phone?: string; address?: string; email?: string } | null) => void;
  setCustomerSubmitted: (submitted: boolean) => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  setJobScheduled: (scheduled: boolean) => void;
  setBookedJob: (job: Job | null) => void;
}

export default function CustomerLookupForm({
  setCustomerInfo,
  selectedCustomer,
  setCustomerSubmitted,
  setSelectedCustomer,
  setJobScheduled,
  setBookedJob,
}: CustomerLookupFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const MIN_PHONE_DIGITS = 6; // Minimum phone number length

  // Populate fields when selectedCustomer changes
  useEffect(() => {
    if (selectedCustomer) {
      setName(selectedCustomer.name);
      setPhone(selectedCustomer.phone);
      setAddress(selectedCustomer.address);
      setEmail(selectedCustomer.email);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    setCustomerInfo({ name, phone, address, email });
  }, [name, phone, address, email, setCustomerInfo]);

  // Validation logic
  const validateFields = () => {
    const newErrors = { name: '', phone: '', address: '', email: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (phone.replace(/\D/g, '').length < MIN_PHONE_DIGITS) {
      newErrors.phone = `Phone number must be at least ${MIN_PHONE_DIGITS} digits`;
      isValid = false;
    }
    if (!address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/customers/checkOrCreate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, address, email }),
      });

      const data = await res.json();
      if (data.message !== 'No Change') {
        addToast(data.message, 'success');
      }
      setCustomerInfo({ name, phone, address, email });
      setSelectedCustomer(data.customer);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error submitting customer:', error.message);
      } else {
        console.error('Unknown error:', error);
      }
    } finally {
      setCustomerSubmitted(true);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-black">
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full px-4 py-2 border rounded shadow-md ${errors.email ? 'border-red-500' : 'border-gray-400'
            }`}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>
      <div>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-4 py-2 border rounded shadow-md ${errors.name ? 'border-red-500' : 'border-gray-400'
            }`}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>
      <div>
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`w-full px-4 py-2 border rounded shadow-md ${errors.phone ? 'border-red-500' : 'border-gray-400'
            }`}
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
      </div>
      <div>
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={`w-full px-4 py-2 border rounded shadow-md ${errors.address ? 'border-red-500' : 'border-gray-400'
            }`}
        />
        {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
      </div>
      <div className="flex flex-row justify-between gap-1">
        <button
          type="submit"
          className="w-full bg-blue-400 text-white py-2 rounded hover:bg-blue-500"
          disabled={loading}
        >
          {loading ? (
            <div className="w-4 h-4 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          ) : (
            'Submit Customer'
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setEmail('');
            setName('');
            setPhone('');
            setAddress('');
            setCustomerSubmitted(false);
            setJobScheduled(false);
            setBookedJob(null);
            setErrors({ name: '', phone: '', address: '', email: '' });
          }}
          className="w-full bg-red-400 hover:bg-red-500 text-white py-2 rounded shadow-sm"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
