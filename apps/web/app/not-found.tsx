import { redirect } from 'next/navigation';

// Unknown paths land on Showcase; the starter has exactly five routes.
export default function NotFound() {
  redirect('/');
}
