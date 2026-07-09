import { cookies } from 'next/headers';

export async function getCurrentUserId(): Promise<string> {
  const cookieValue =
    cookies().get('userId')?.value || cookies().get('user_id')?.value;

  if (cookieValue) {
    return cookieValue;
  }

  throw new Error('Authentication required');
}