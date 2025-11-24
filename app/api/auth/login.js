// /app/api/auth/login/auth.js
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req) {
  try {
    const body = await req.json()
    const { email, password } = body

    const { data, error } = await db.loginUser({ email, password })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
