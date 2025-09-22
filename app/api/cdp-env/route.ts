// Placeholder API route for CDP environment info
// Replace with actual environment values as needed.

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
	// Intentionally return minimal info; avoid leaking secrets.
	return NextResponse.json({ ok: true, cdpEnabled: false })
}

