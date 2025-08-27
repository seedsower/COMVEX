import DriftStatus from '@/components/DriftStatus';
import OrderForm from '@/components/OrderForm';

export default function Home() {
  return (
    <div className="min-h-screen py-8 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DriftStatus />
        <OrderForm />
      </div>
    </div>
  );
}
