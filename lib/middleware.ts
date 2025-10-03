import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from './supabase'

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string
    email?: string
    role?: string
  }
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header required' })
      }

      const token = authHeader.split(' ')[1]
      
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      // Get user profile for role information
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      req.user = {
        id: user.id,
        email: user.email,
        role: profile?.role || 'user'
      }

      return handler(req, res)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export function withCORS(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
    const origin = req.headers.origin

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID')
    res.setHeader('Access-Control-Allow-Credentials', 'true')

    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    return handler(req, res)
  }
}

export function withRateLimit(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  const requests = new Map<string, { count: number; resetTime: number }>()
  const RATE_LIMIT = 100 // requests per window
  const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const clientId = req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || 'unknown'
    const now = Date.now()
    
    const clientData = requests.get(clientId)
    
    if (!clientData || now > clientData.resetTime) {
      requests.set(clientId, { count: 1, resetTime: now + WINDOW_MS })
    } else {
      if (clientData.count >= RATE_LIMIT) {
        return res.status(429).json({ error: 'Rate limit exceeded' })
      }
      clientData.count++
    }

    return handler(req, res)
  }
}

export function validateRequiredFields(requiredFields: string[]) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const missingFields = requiredFields.filter(field => !req.body[field])
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields 
      })
    }
    
    next()
  }
}

export function validateUserRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    
    if (!allowedRoles.includes(req.user.role || 'user')) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    
    next()
  }
}
