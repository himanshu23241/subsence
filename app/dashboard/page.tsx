// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoadDemoButton from '@/components/dashboard/LoadDemoButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch transactions for this user
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false })
    .limit(20)

  // Calculate total monthly spend
  const totalSpend = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome back, {user.email}</p>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Detected Spend</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ${totalSpend.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500">Transactions Found</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {transactions?.length || 0}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <LoadDemoButton />
        </div>

        {/* Transactions List */}
        <div className="mt-8 rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          {transactions && transactions.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {transactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{t.merchant_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(t.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {t.currency} {Number(t.amount).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <p>No transactions yet.</p>
              <p className="mt-2 text-sm">Forward a receipt to see it appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}