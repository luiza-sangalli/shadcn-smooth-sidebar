
import { useMemo } from "react";

export function useCourseLevel(price: number): string {
  return useMemo(() => {
    if (price <= 100) return 'Iniciante';
    if (price <= 200) return 'Intermediário';
    return 'Avançado';
  }, [price]);
}
