
import './globals.css';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { AuthProvider } from '@/components/AuthProvider';
import { ToastProvider } from '@/components/Toast';
import { auth } from '@/auth';

export const metadata = { 
  title: 'BizMgr', 
  description: 'Business management MVP' 
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider session={session}>
          <ToastProvider>
            <AuthenticatedLayout>
              {children}
            </AuthenticatedLayout>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

