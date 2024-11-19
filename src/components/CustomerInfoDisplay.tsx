import { Customer } from "@/types/customer";

interface CustomerInfoDisplayProps {
  customers: Customer[] | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  loading: boolean;
  selectedCustomer: Customer | null;
}

export default function CustomerInfoDisplay({ customers, setSelectedCustomer, loading, selectedCustomer }: CustomerInfoDisplayProps) {

  return (
    <div className="space-y-2 border border-gray-300 min-h-full rounded-lg px-2 py-2 shadow-md">
      <div>
        <h2 className="text-lg font-bold text-center text-gray-700">Current Customers</h2>
      </div>

      {loading && (
        <div className="flex justify-center items-center space-x-2">
          <div className="w-4 h-4 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      )}

      {customers && customers.map((customer) => (
        <label
          htmlFor={`isCustomer-${customer.id}`}
          className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-blue-100' : 'hover:bg-blue-700'
            }`}
          key={customer.id}
        >
          <div className="flex flex-col space-y-1 text-gray-700">
            <p><strong>Name:</strong> {customer.name}</p>
            <p><strong>Phone:</strong> {customer.phone}</p>
            <p><strong>Address:</strong> {customer.address}</p>
            <p><strong>Email:</strong> {customer.email}</p>
          </div>
          <input
            checked={selectedCustomer?.id === customer.id}
            type="checkbox"
            id={`isCustomer-${customer.id}`}
            name="isCustomer"
            value={customer.id}
            className="form-checkbox"
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedCustomer(customer); // Set the selected customer
              } else {
                setSelectedCustomer(null); // Clear the selected customer on uncheck
              }
            }}
          />
        </label>
      ))}
    </div>
  );
}
