
import './globals.css';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { AuthProvider } from '@/components/AuthProvider';
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
          <AuthenticatedLayout>
            {children}
          </AuthenticatedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
