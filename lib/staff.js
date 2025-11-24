import { supabase } from './supabaseAdmin'
import { db } from './db' // supondo que seu helper esteja nesse arquivo

export const staffService = {
  async createStaff(staffData, tenantSlug) {
    try {
      // 1. Busca o tenant pelo slug da URL
      const { data: tenant, error: tenantError } = await db.getTenant(tenantSlug)
      if (tenantError) throw tenantError
      if (!tenant) throw new Error('Tenant não encontrado')

      // 2. Insere novo staff vinculado ao tenant_id
      const { data, error } = await supabase
        .from('staff')
        .insert([
          {
            tenant_id: tenant.id,
            name: staffData.name,
            email: staffData.email || null,
            phone: staffData.phone || null,
            active: true
          }
        ])
        .select('*')
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}
