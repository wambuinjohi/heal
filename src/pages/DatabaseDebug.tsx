import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  checkDatabaseTables,
  createTestUser,
  getDatabaseStatus,
  checkUsersExist
} from '@/utils/databaseTableChecker';

export default function DatabaseDebug() {
  const [tableStatus, setTableStatus] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin123456');

  useEffect(() => {
    handleCheckTables();
  }, []);

  const handleCheckTables = async () => {
    setLoading(true);
    try {
      const tables = await checkDatabaseTables();
      const status = await getDatabaseStatus();
      
      setTableStatus(tables);
      setDbStatus(status);
      
      if (tables.allTablesExist) {
        toast.success('✅ All required tables exist!');
      } else {
        toast.error(`❌ ${tables.totalChecked - tables.totalExists} tables are missing`);
      }
    } catch (error) {
      console.error('Error checking tables:', error);
      toast.error('Failed to check database tables');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setCreateUserLoading(true);
    try {
      const result = await createTestUser(email, password);
      
      if (result.success) {
        toast.success(`✅ User created: ${email}`);
        // Refresh status
        await handleCheckTables();
      } else {
        toast.error(`❌ Failed to create user: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setCreateUserLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Database Debug Panel</h1>
          <p className="text-gray-600">Check database tables and create test users</p>
        </div>

        {/* Database Status */}
        {dbStatus && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Database Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tables Ready</p>
                  <p className={`text-2xl font-bold ${dbStatus.tablesReady ? 'text-green-600' : 'text-red-600'}`}>
                    {dbStatus.tablesReady ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Users Exist</p>
                  <p className={`text-2xl font-bold ${dbStatus.usersExist ? 'text-green-600' : 'text-orange-600'}`}>
                    {dbStatus.usersExist ? '✅ Yes' : '⏳ No'}
                  </p>
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm font-semibold">Summary:</p>
                <p className="text-lg">{dbStatus.summary.status}</p>
              </div>
              <div className="text-sm text-gray-600">
                Tables Found: <span className="font-bold">{dbStatus.totalTablesFound}/{dbStatus.totalTablesRequired}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Missing Tables Alert */}
        {dbStatus && dbStatus.missingTables && dbStatus.missingTables.length > 0 && (
          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Missing Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dbStatus.missingTables.map((table: any, idx: number) => (
                  <div key={idx} className="text-sm text-red-700">
                    • {table.tableName}
                  </div>
                ))}
              </div>
              <p className="text-xs text-red-600 mt-4">
                You need to set up the database schema before using the app.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Create User Section */}
        {dbStatus?.tablesReady && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-700">Create Test User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={createUserLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password (min 8 characters)
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin123456"
                  disabled={createUserLoading}
                />
              </div>
              <Button
                onClick={handleCreateUser}
                disabled={createUserLoading || !dbStatus?.tablesReady}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {createUserLoading ? '⏳ Creating...' : '✅ Create User'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Refresh Button */}
        <Button
          onClick={handleCheckTables}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? '⏳ Checking...' : '🔄 Refresh Status'}
        </Button>

        {/* Tables List */}
        {tableStatus && (
          <Card>
            <CardHeader>
              <CardTitle>All Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tableStatus.tables.map((table: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-2 rounded text-sm ${
                      table.exists
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <span className="font-medium">{table.tableName}</span>
                    {table.exists ? ' ✅' : ' ❌'}
                    {table.error && (
                      <div className="text-xs mt-1 opacity-75">{table.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>1. Check the database status above ⬆️</p>
            <p>2. If tables are missing, set up the database schema in Supabase</p>
            <p>3. Once tables are ready, create a test user</p>
            <p>4. Go back to login and sign in with the created credentials</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
