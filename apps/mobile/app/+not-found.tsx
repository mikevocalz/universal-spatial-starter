import { Redirect } from 'expo-router';

// Unknown deep links land on Showcase; the starter has exactly five routes.
export default function NotFound() {
  return <Redirect href="/" />;
}
