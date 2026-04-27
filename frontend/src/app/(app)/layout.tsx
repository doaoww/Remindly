import AppLayout from '@/components/layout/AppLayout';
import { ToastContainer } from '@/components/ui/Toast';

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      {children}
      <ToastContainer />
    </AppLayout>
  );
}