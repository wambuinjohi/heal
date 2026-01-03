import { supabase } from '@/integrations/supabase/client';

export interface CompanyData {
  id: string;
  name: string;
  logo_url?: string;
  primary_color?: string;
  [key: string]: any;
}

/**
 * Fetch company information with fallback to public edge function
 * This ensures the login page can display company branding even for unauthenticated users
 */
export async function fetchPublicCompanyData(): Promise<CompanyData | null> {
  try {
    // First, try the direct query (works for authenticated users and if RLS allows public access)
    const { data: directData, error: directError } = await supabase
      .from('companies')
      .select('id, name, logo_url, primary_color')
      .limit(1)
      .single();

    // If direct query succeeds, return the data
    if (directData && !directError) {
      return directData as CompanyData;
    }

    // If direct query fails (likely due to RLS), try the public edge function
    console.warn('Direct company fetch failed, using public endpoint:', directError?.message);

    try {
      // Try relative path first (works in dev environment with proxy)
      let response = await fetch('/functions/v1/get-public-company', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => null);

      // If relative path fails, try with full Supabase URL
      if (!response) {
        const supabaseUrl = supabase.supabaseUrl;
        const url = `${supabaseUrl}/functions/v1/get-public-company`;
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (!response?.ok) {
        throw new Error(`Edge function returned ${response?.status || 'error'}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        return result.data as CompanyData;
      }

      throw new Error(result.error || 'Failed to fetch company from edge function');
    } catch (edgeFunctionError) {
      console.error('Edge function failed, returning null:', edgeFunctionError);
      return null;
    }
  } catch (error) {
    console.error('Error fetching company data:', error);
    return null;
  }
}
