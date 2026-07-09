import { cookies } from 'next/headers';

export async function getCurrentUserId(): Promise<string> {
  const cookieValue =
    cookies().get('userId')?.value || cookies().get('user_id')?.value;

  if (cookieValue) {
    return cookieValue;
  }

  try {
    const { getServerSession } = await import('next-auth/next');
    const { authOptions } = await import('@/lib/authOptions');
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
      return session.user.id as string;
    }
  } catch {
    // ignore missing next-auth integration
  }

  throw new Error('Authentication required');
}