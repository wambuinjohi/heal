import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase';

export default function AdminInit() {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const ADMIN_EMAIL = 'admin@mail.com';
  const ADMIN_PASSWORD = 'Admin.12';
  const ADMIN_NAME = 'System Admin';

  useEffect(() => {
    checkAdminExists();
  }, []);

  async function checkAdminExists() {
    try {
      setCheckingAdmin(true);
      
      // Try to check if admin profile already exists
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
        .eq('email', ADMIN_EMAIL);

      if (!error && profiles) {
        setAdminExists(true);
      }
    } catch (error) {
      console.error('Error checking admin:', error);
      // Continue anyway - we'll handle it during init
    } finally {
      setCheckingAdmin(false);
    }
  }

  async function initializeAdmin() {
    setLoading(true);

    try {
      // Check if user already exists
      if (adminExists) {
        toast.error('Admin user already exists!');
        setLoading(false);
        return;
      }

      // Get Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      // First, create the company if it doesn't exist
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1);

      let companyId = null;
      if (!companies || companies.length === 0) {
        // Create default company
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: 'Medical Supplies',
            email: ADMIN_EMAIL,
            currency: 'KES',
          })
          .select('id')
          .single();

        if (companyError) {
          console.warn('Company creation warning:', companyError);
        } else if (newCompany) {
          companyId = newCompany.id;
        }
      } else {
        companyId = companies[0].id;
      }

      // Call the admin-create-user edge function
      const response = await fetch(`${supabaseUrl}/functions/v1/admin-create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          full_name: ADMIN_NAME,
          role: 'admin',
          company_id: companyId,
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to create admin user: ${response.statusText}`);
      }

      // Verify the admin was created
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a moment for DB sync

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, role, status')
        .eq('email', ADMIN_EMAIL)
        .maybeSingle();

      if (profile && profile.status === 'active' && profile.role === 'admin') {
        setInitialized(true);
        toast.success('✅ Admin user initialized successfully!', {
          description: `Email: ${ADMIN_EMAIL}`,
          duration: 5000
        });
      } else {
        throw new Error('Admin user created but verification failed');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to initialize admin user'
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Initialization</CardTitle>
          <CardDescription>
            Set up the first admin user for Medical Supplies
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {adminExists ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 font-medium">⚠️ Admin Already Exists</p>
              <p className="text-sm text-yellow-700 mt-2">
                The admin user {ADMIN_EMAIL} has already been initialized.
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full mt-4"
              >
                Go to Sign In
              </Button>
            </div>
          ) : initialized ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center space-y-3">
              <p className="text-green-800 font-medium">✅ Initialization Complete!</p>
              <div className="text-sm text-green-700 space-y-2">
                <p>Admin user has been successfully created.</p>
                <div className="bg-white rounded p-3 text-left space-y-1 border border-green-200">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Email:</span>
                    <span className="font-mono">{ADMIN_EMAIL}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Password:</span>
                    <span className="font-mono">Admin.12</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Role:</span>
                    <span className="font-mono">admin</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">Status:</span>
                    <span className="font-mono">active</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3 bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900">Admin credentials to be created:</p>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-mono font-medium">{ADMIN_EMAIL}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Password:</span>
                    <span className="font-mono font-medium">Admin.12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Role:</span>
                    <span className="font-mono font-medium">admin</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-mono font-medium">active</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={initializeAdmin}
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  'Initialize Admin User'
                )}
              </Button>

              <div className="text-xs text-gray-600 bg-gray-50 rounded p-3">
                <p className="font-medium mb-2">This will:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Create authentication user</li>
                  <li>Set up admin profile</li>
                  <li>Assign admin permissions</li>
                  <li>Activate the account immediately</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
