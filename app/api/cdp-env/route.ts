import { NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function present(name: string) {
	const v = process.env[name]
	return typeof v === 'string' && v.trim().length > 0
}

function hashSuffix(value?: string) {
	if (!value) return null
	try {
		const h = crypto.createHash('sha256').update(value).digest('hex')
		return h.slice(0, 10)
	} catch { return null }
}

export async function GET() {
	const id = process.env.CDP_API_KEY_ID
	const key = process.env.CDP_API_PRIVATE_KEY
	const project = process.env.CDP_PROJECT_ID
	const result = {
		ok: true,
		cdpEnabled: present('CDP_API_KEY_ID') && present('CDP_API_PRIVATE_KEY'),
		vars: {
			CDP_API_KEY_ID: present('CDP_API_KEY_ID'),
			CDP_API_PRIVATE_KEY: present('CDP_API_PRIVATE_KEY'),
			CDP_PROJECT_ID: present('CDP_PROJECT_ID'),
		},
		hashes: {
			keyIdSuffix: id ? id.slice(-6) : null,
			privateKeyHash10: hashSuffix(key),
			projectIdSuffix: project ? project.slice(-6) : null,
		}
	}
	return NextResponse.json(result)
}

