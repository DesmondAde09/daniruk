import { ServicesIndexScreen } from '@/screens/services/ServicesIndexScreen';

/**
 * Services index tab route — thin wrapper so the screen component and its
 * tests can live outside `src/app/` (every file under `src/app/` is treated
 * as a route).
 */
export default function ServicesRoute() {
  return <ServicesIndexScreen />;
}
