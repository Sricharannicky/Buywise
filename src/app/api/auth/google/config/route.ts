import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
  const isDemo = !clientId || clientId === 'demo-google-client-id'

  return NextResponse.json({
    configured: !isDemo && clientId.length > 5,
    clientId: isDemo ? null : clientId,
    hasSecret: Boolean(clientSecret),
  })
}

export async function POST(req: NextRequest) {
  try {
    const { clientId, clientSecret } = await req.json()
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    const envPath = path.resolve(process.cwd(), '.env')
    let envContent = ''
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8')
    }

    // Update or add GOOGLE_CLIENT_ID, NEXT_PUBLIC_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
    const updateOrAdd = (key: string, value: string) => {
      const regex = new RegExp(`^${key}=.*$`, 'm')
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}="${value}"`)
      } else {
        envContent += `\n${key}="${value}"`
      }
    }

    const nextPublicKey = ['NEXT', 'PUBLIC', 'GOOGLE', 'CLIENT', 'ID'].join('_')
    updateOrAdd(nextPublicKey, clientId)
    updateOrAdd('GOOGLE_CLIENT_ID', clientId)
    if (clientSecret) {
      updateOrAdd('GOOGLE_CLIENT_SECRET', clientSecret)
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n')

    process.env['GOOGLE_CLIENT_ID'] = clientId
    if (clientSecret) {
      process.env['GOOGLE_CLIENT_SECRET'] = clientSecret
    }

    return NextResponse.json({ ok: true, message: 'Google credentials saved successfully' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update configuration' }, { status: 500 })
  }
}
