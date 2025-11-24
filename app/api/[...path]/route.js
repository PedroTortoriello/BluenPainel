import { NextResponse } from "next/server"
import { db } from "@/lib/db"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

export function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

function getPath(params) {
  if (!params || !params.path) return []
  return Array.isArray(params.path) ? params.path : [params.path]
}

// ---------------------------------------------------------
// GET
// ---------------------------------------------------------
export async function GET(request, context) {
  const { params } = await context;
  
  try {
    const path = getPath(params);
    const resource = path[0];

    if (!resource) {
      return NextResponse.json(
        { error: "Nenhum endpoint informado" },
        { status: 400, headers: corsHeaders }
      )
    }

    switch (resource) {
      case "leads": {
        const { data, error } = await db.getLeads()
        if (error) throw error
        return NextResponse.json({ leads: data }, { headers: corsHeaders })
      }

      case "companies": {
        const { data, error } = await db.getCompanies()
        if (error) throw error
        return NextResponse.json({ companies: data }, { headers: corsHeaders })
      }

      default:
        return NextResponse.json(
          { error: `GET inválido: /api/${resource}` },
          { status: 404, headers: corsHeaders }
        )
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}

// ---------------------------------------------------------
// POST
// ---------------------------------------------------------
export async function POST(request, context) {
  const params = await context.params; // <-- obrigatório agora
  const path = getPath(params);

  try {
    const resource = path[0]
    const subresource = path[1] || null

    if (!resource) {
      return NextResponse.json(
        { error: "Nenhum endpoint informado" },
        { status: 400, headers: corsHeaders }
      )
    }

    const body = await request.json()

    // AUTH
    if (resource === "auth") {
      if (subresource === "login" || body.action === "login") {
        const { data, error } = await db.loginUser(body)
        if (error) throw error

        return NextResponse.json({
          token: "fake-jwt",
          user: data
        }, { headers: corsHeaders })
      }

      if (subresource === "register" || body.action === "register") {
        const { data, error } = await db.registerUser(body)
        if (error) throw error

        return NextResponse.json(
          { message: "Conta criada com sucesso!", user: data },
          { headers: corsHeaders }
        )
      }

      return NextResponse.json(
        { error: "Ação inválida em /api/auth" },
        { status: 400, headers: corsHeaders }
      )
    }

    // LEADS
    if (resource === "leads") {
      const lead = {
        ...body,
        id: body.id || crypto.randomUUID(),
        created_at: new Date().toISOString()
      }

      const { data, error } = await db.upsertLead(lead)
      if (error) throw error

      return NextResponse.json({ lead: data }, { headers: corsHeaders })
    }

    return NextResponse.json(
      { error: `POST inválido: /api/${resource}` },
      { status: 404, headers: corsHeaders }
    )
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}

// ---------------------------------------------------------
// DELETE
// ---------------------------------------------------------
export async function DELETE(request, context) {
  const { params } = await context;

  try {
    const path = getPath(params)
    const resource = path[0]
    const id = path[1]

    if (!resource) {
      return NextResponse.json(
        { error: "Nenhum endpoint informado" },
        { status: 400, headers: corsHeaders }
      )
    }

    if (resource === "leads" && id) {
      const { error } = await db.deleteLead(id)
      if (error) throw error

      return NextResponse.json(
        { message: "Lead excluído com sucesso" },
        { headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { error: `DELETE inválido: /api/${resource}` },
      { status: 404, headers: corsHeaders }
    )
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
