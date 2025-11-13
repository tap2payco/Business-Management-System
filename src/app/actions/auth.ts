'use server';

import { signOut as nextAuthSignOut } from 'next-auth/react';

export async function signOut() {
  await nextAuthSignOut();
}