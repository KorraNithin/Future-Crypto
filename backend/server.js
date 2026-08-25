const mongoose = require('mongoose')
const dotenv = require('dotenv')
const express = require('express')
const bcrypt = require('bcrypt')
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

const UserModel = require('./userModel')
const EmailModel = require('./emailModel')
const sendmail = require('./sendmail')

dotenv.config({ path: './config.env' })

const app = express()

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

app.use(
  cors({
    origin: [FRONTEND_URL, 'https://futute-crypto.onrender.com'],
    credentials: true
  })
)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false
  })
)
app.use(passport.initialize())
app.use(passport.session())

// ---------- Database ----------
const DB = process.env.DATABASE.replace(
  'PASSWORD',
  process.env.DATABASE_PASSWORD
)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection established')
  })
  .catch((err) => {
    console.error('DB connection error:', err.message)
  })

sendmail.scheduleDailyEmails()

// ---------- Google OAuth (Passport) ----------
const GOOGLE_CLIENT_ID = process.env.YOUR_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.YOUR_CLIENT_SECRET
const GOOGLE_CALLBACK_URL = `${BACKEND_URL}/auth/google/callback`

if (
  GOOGLE_CLIENT_ID &&
  GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' &&
  GOOGLE_CLIENT_SECRET &&
  GOOGLE_CLIENT_SECRET !== 'YOUR_GOOGLE_CLIENT_SECRET'
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails && profile.emails[0] && profile.emails[0].value

          let user = await UserModel.findOne({ email })

          if (!user) {
            // Create a placeholder password since Google users don't set one
            const randomPassword = await bcrypt.hash(
              profile.id + Date.now().toString(),
              10
            )
            user = new UserModel({ email, password: randomPassword })
            await user.save()
          }

          done(null, user)
        } catch (err) {
          done(err, null)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    UserModel.findById(id)
      .then((user) => done(null, user))
      .catch((err) => done(err, null))
  })
} else {
  console.warn(
    'Google OAuth is not configured. Set YOUR_CLIENT_ID and YOUR_CLIENT_SECRET in config.env to enable it.'
  )
}

// ---------- Routes ----------
app.get('/', (req, res) => {
  res.send('This is the server!')
})

// Newsletter subscription
app.post('/subscribe', async (req, res) => {
  const { email } = req.body
  try {
    const newEmail = new EmailModel({ email })
    await newEmail.save()
    res.status(200).json({ message: 'Email subscribed successfully' })
  } catch (error) {
    console.error('Error subscribing email:', error)
    res.status(500).json({ error: 'Failed to subscribe email' })
  }
})

// Register a new user
app.post('/register', async (req, res) => {
  const { email, password } = req.body

  try {
    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      res.status(400).json({ error: 'Email is already in use' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new UserModel({ email, password: hashedPassword })
    await newUser.save()
    console.info('User registered successfully')
    res.status(200).json({ message: 'User registered successfully' })
  } catch (error) {
    console.error('Error registering user:', error)
    res.status(500).json({ error: 'Failed to register user' })
  }
})

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await UserModel.findOne({ email })

    if (user && (await bcrypt.compare(password, user.password))) {
      console.info('User logged in successfully')
      res.status(200).json({ message: 'User logged in successfully', email: user.email })
    } else {
      console.info('Failed to log in')
      res.status(401).json({ error: 'Failed to login' })
    }
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// Step 1: frontend fetches this to get the Google consent URL (returns JSON, matches AuthModal.js)
app.get('/auth/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
    return res.status(500).json({ error: 'Google OAuth is not configured on the server' })
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'profile email',
    access_type: 'offline',
    prompt: 'consent'
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  res.status(200).json({ authUrl })
})

// Step 2: Google redirects the browser here after consent
app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    session: true,
    failureRedirect: `${FRONTEND_URL}?googleLogin=failed`
  }),
  (req, res) => {
    // Success — send the user back to the frontend with their email
    const email = encodeURIComponent(req.user.email)
    res.redirect(`${FRONTEND_URL}/?googleLogin=success&email=${email}`)
  }
)

const port = process.env.PORT || 8000
app.listen(port, () => {
  console.log(`Listening to requests on port ${port}`)
})
