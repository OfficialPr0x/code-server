require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// Session config
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Passport config
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }
));

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h1>OAuth 2.0 Demo</h1>
    ${req.user ? `
      <p>Logged in as: ${req.user.displayName}</p>
      <a href="/logout">Logout</a>
      <a href="/protected">View Protected Page</a>
    ` : `
      <a href="/auth/google">Login with Google</a>
    `}
  `);
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  }
);

app.get('/protected', ensureAuthenticated, (req, res) => {
  res.send(`
    <h1>Protected Page</h1>
    <p>User ID: ${req.user.id}</p>
    <p>Name: ${req.user.displayName}</p>
    <p>Email: ${req.user.emails[0].value}</p>
    <a href="/">Home</a>
  `);
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/google');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});