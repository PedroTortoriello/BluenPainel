require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Create Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function initializeDatabase() {
  console.log('Initializing database with demo data...')
  
  try {
    // Test if tables exist by trying to insert demo data directly
    const demoTenant = {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Flowboard',
      slug: 'Flowboard Bluen',
      cnpj: '12.345.678/0001-90',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01234-567',
      phone: '(11) 99999-9999',
      email: 'contato@bluen.com.br',
      primary_color: '#5e819e',
      secondary_color: '#244561',  
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
      active: true,
      plan: 'pro'
    }

    // Try to insert or get existing tenant
    const { data: existingTenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('*')
      .eq('slug', 'demo-barbershop')
      .single()

    if (existingTenant) {
      console.log('✅ Demo tenant already exists:', existingTenant.name)
    } else {
      console.log('Tables do not exist yet. Please run the SQL schema in Supabase dashboard.')
      console.log('🔗 Go to: https://supabase.com/dashboard/project/fajoxwzlsbayxzlibvqx/sql')
      console.log('📋 Copy and paste the contents of /app/sql/schema.sql')
      console.log('📋 Then copy and paste the contents of /app/sql/seed.sql')
      return
    }

    console.log('✅ Database is properly initialized!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    console.log('\n🔗 Please manually run the SQL files in Supabase dashboard:')
    console.log('1. Go to: https://supabase.com/dashboard/project/fajoxwzlsbayxzlibvqx/sql')
    console.log('2. Copy and paste the contents of /app/sql/schema.sql')
    console.log('3. Copy and paste the contents of /app/sql/seed.sql')
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
}

module.exports = { initializeDatabase }