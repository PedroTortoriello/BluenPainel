'use client'
import Link from 'next/link'

export default function AdminLayout({ children, tenantSlug }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold">Barbearia SaaS</div>
        <nav className="flex-1 flex flex-col gap-2 p-4">
          {tenantSlug ? (
            <>
              <Link href={`/${tenantSlug}/admin`} className="hover:bg-gray-700 p-2 rounded">Dashboard</Link>
              <Link href={`/${tenantSlug}/admin/services`} className="hover:bg-gray-700 p-2 rounded">Serviços</Link>
              <Link href={`/${tenantSlug}/admin/staff`} className="hover:bg-gray-700 p-2 rounded">Profissionais</Link>
              <Link href={`/${tenantSlug}/admin/customers`} className="hover:bg-gray-700 p-2 rounded">Clientes</Link>
              <Link href={`/${tenantSlug}/admin/appointments`} className="hover:bg-gray-700 p-2 rounded">Agendamentos</Link>
              <Link href={`/${tenantSlug}/admin/settings`} className="hover:bg-gray-700 p-2 rounded">Configurações</Link>
            </>
          ) : (
            <>
              <Link href={`/admin`} className="hover:bg-gray-700 p-2 rounded">Dashboard Geral</Link>
              <Link href={`/admin/tenants`} className="hover:bg-gray-700 p-2 rounded">Barbearias</Link>
            </>
          )}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  )
}
