import { createClient } from '@supabase/supabase-js'
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function setupSupabaseAuth(app: Express) {
  // Middleware to verify JWT tokens
  const authenticateToken: RequestHandler = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization
      const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

      if (!token) {
        return res.status(401).json({ message: "Access token required" })
      }

      // Verify the JWT token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error || !user) {
        return res.status(401).json({ message: "Invalid or expired token" })
      }

      // Get user details from our database
      const dbUser = await storage.getUser(user.id)
      if (!dbUser) {
        return res.status(401).json({ message: "User not found in database" })
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: dbUser.role,
        claims: user
      }

      next()
    } catch (error) {
      console.error('Token verification error:', error)
      res.status(401).json({ message: "Authentication failed" })
    }
  }

  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, phone, firstName, lastName, role = 'user' } = req.body

      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        phone,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role
          }
        }
      })

      if (error) {
        return res.status(400).json({ message: error.message })
      }

      // Create user in our database
      if (data.user) {
        await storage.upsertUser({
          id: data.user.id,
          email: data.user.email!,
          firstName,
          lastName,
          phone,
          role
        })
      }

      res.json({
        message: "User created successfully",
        user: data.user,
        session: data.session
      })
    } catch (error) {
      console.error('Signup error:', error)
      res.status(500).json({ message: "Failed to create user" })
    }
  })

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return res.status(401).json({ message: error.message })
      }

      res.json({
        user: data.user,
        session: data.session
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ message: "Login failed" })
    }
  })

  app.post('/api/auth/phone-login', async (req, res) => {
    try {
      const { phone } = req.body

      const { data, error } = await supabase.auth.signInWithOtp({
        phone
      })

      if (error) {
        return res.status(400).json({ message: error.message })
      }

      res.json({ message: "OTP sent to phone number" })
    } catch (error) {
      console.error('Phone login error:', error)
      res.status(500).json({ message: "Failed to send OTP" })
    }
  })

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { phone, token } = req.body

      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      })

      if (error) {
        return res.status(400).json({ message: error.message })
      }

      // Ensure user exists in our database
      if (data.user) {
        await storage.upsertUser({
          id: data.user.id,
          email: data.user.email,
          phone: data.user.phone,
          role: 'user' // Default role, can be updated later
        })
      }

      res.json({
        user: data.user,
        session: data.session
      })
    } catch (error) {
      console.error('OTP verification error:', error)
      res.status(500).json({ message: "OTP verification failed" })
    }
  })

  app.post('/api/auth/google-login', async (req, res) => {
    try {
      const { idToken } = req.body

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken
      })

      if (error) {
        return res.status(400).json({ message: error.message })
      }

      // Ensure user exists in our database
      if (data.user) {
        await storage.upsertUser({
          id: data.user.id,
          email: data.user.email!,
          firstName: data.user.user_metadata?.first_name,
          lastName: data.user.user_metadata?.last_name,
          role: 'user'
        })
      }

      res.json({
        user: data.user,
        session: data.session
      })
    } catch (error) {
      console.error('Google login error:', error)
      res.status(500).json({ message: "Google login failed" })
    }
  })

  app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return res.status(400).json({ message: error.message })
      }
      res.json({ message: "Logged out successfully" })
    } catch (error) {
      console.error('Logout error:', error)
      res.status(500).json({ message: "Logout failed" })
    }
  })

  app.get('/api/auth/user', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id
      const user = await storage.getUser(userId)
      res.json(user)
    } catch (error) {
      console.error("Error fetching user:", error)
      res.status(500).json({ message: "Failed to fetch user" })
    }
  })

  return authenticateToken
}

export const isAuthenticated = (authenticateToken: RequestHandler): RequestHandler => {
  return authenticateToken
}