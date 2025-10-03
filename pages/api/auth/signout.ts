import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Sign out successful' })
  } catch (error) {
    console.error('Signout error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
