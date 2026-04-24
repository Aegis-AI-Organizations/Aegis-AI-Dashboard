import { useState, useEffect, useCallback } from "react";
import { api } from "../api/Axios";

export interface Company {
  id: string;
  name: string;
  owner_email: string;
  avatar_url?: string;
}

export const useCompanies = (searchQuery: string = "") => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/admin/companies?search=${searchQuery}`);
      setCompanies(data || []);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Erreur lors du chargement des entreprises",
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCompanies]);

  return { companies, isLoading, error, refetch: fetchCompanies };
};
