import { NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import type { AppState } from "@/lib/types"
import { defaultAppSettings, defaultCategories, defaultGoalSettings } from "@/lib/store"

const STATE_ID = "singleton"

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      id text PRIMARY KEY,
      data jsonb NOT NULL
    )
  `
}

export async function GET() {
  try {
    await ensureTable()

    const result = await sql`SELECT data FROM app_state WHERE id = ${STATE_ID}`

    if (result.rows.length === 0) {
      const defaultState: AppState = {
        entries: [],
        categories: defaultCategories,
        goalSettings: defaultGoalSettings,
        appSettings: defaultAppSettings,
      }

      return NextResponse.json(defaultState, { status: 200 })
    }

    const row = result.rows[0] as { data: AppState }
    return NextResponse.json(row.data, { status: 200 })
  } catch (error) {
    console.error("GET /api/state error", error)
    return NextResponse.json(null, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AppState

    await ensureTable()

    await sql`
      INSERT INTO app_state (id, data)
      VALUES (${STATE_ID}, ${body}::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error("POST /api/state error", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}