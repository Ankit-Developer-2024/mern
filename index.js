require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const server = express();
const productRouters = require("./routes/Product");
const brandsRouters = require("./routes/Brands");
const categoriesRouters = require("./routes/Category");
const authRouters = require("./routes/Auth");
const usersRouters = require("./routes/User");
const cartRouters = require("./routes/Cart");
const orderRouters = require("./routes/Order");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const cookieParser = require("cookie-parser");
const path=require('path')

const jwt = require("jsonwebtoken");

const { User } = require("./model/User");
const { isAuth, sanitizeUser, cookieExtractor } = require("./services/common");

//email

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",  // protocal h gmail k lia
//   port: 587,                // port hai
//   secure: false, // true for port 465, false for other ports
//   auth: {
//     user: "kumar990ankit@gmail.com",
//     pass: "Ankit@001",
//   },
// });




const endpointSecret = process.env.ENDPOINT_SECRET;

server.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
    const sig = request.headers['stripe-signature'];
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object;
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  
    // Return a 200 response to acknowledge receipt of the event 
    response.send();
  });


//jwt options
var opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY; 



server.use(express.static(path.resolve(__dirname,'build')))
server.use(cookieParser());
server.use(
  session({
    secret: process.env.SESSION_SECRET_KEY ,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    //  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
  })
);

server.use(passport.authenticate("session"));

server.use(
  cors({
    exposedHeaders: ["X-Total-Count"], //need to expose so in frontEnd can access this due cors
  })
);
// server.use(express.raw({type: 'application/json'}))
server.use(express.json()); //to parse req.body
server.use("/products", isAuth(), productRouters.router); //we can also use jwt
server.use("/brands", isAuth(), brandsRouters.router);
server.use("/categories", isAuth(), categoriesRouters.router);
server.use("/auth", authRouters.router);
server.use("/users", isAuth(), usersRouters.router);
server.use("/cart", isAuth(), cartRouters.router);
server.use("/orders", isAuth(), orderRouters.router);
//Mail end point
server.post("/mail",async(req,res)=>{
  sendEmail();
  res.json({s:"sucess"})
  
})


//passport passport LocalStrategy
passport.use(
  "local",
  new LocalStrategy({ usernameField: "email" }, async function (
    email,
    password,
    done
  ) {
    //by deafault passport uses username
    try {
      const user = await User.findOne({ email: email }).exec();
      if (!user) {
       return done(null, false, { message: "Invalid credentials" });
      }
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
           return done(null, false, { message: "Invalid credentials" });
          } else {
            const token = jwt.sign(sanitizeUser(user), process.env.JWT_SECRET_KEY);
            done(null, {id:user.id,email:user.email,role:user.role,token}); //this call the serializeUser
          }
        }
      );
    } catch (error) {
      done(error);
    }
  })
);

//passport passport JwtStrategy
passport.use(
  "jwt",
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findOne({ email: jwt_payload.email }).exec();
      if (user) {
        return done(null, sanitizeUser(user)); // this call serialze
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err);
    }
  })
);

// this create session variable req.user on being called from callback
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, { id: user.id, email: user.email, role: user.role });
  });
});

// this changes session variable req.user when called from authorized request
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});



//payment

// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);


server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount} = req.body;

const customer = await stripe.customers.create({  //TODO: set customer 
    name: 'Jenny Rosen',
    address: {
      line1: '510 Townsend St',
      postal_code: '98140',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
    },
  });


  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount*100),  // for decimal compenstion
    currency: "inr",
    description:"Stripe payment",
    shipping: {
        name: customer.name,
        address:customer.address
      },
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
    // [DEV]: For demo purposes only, you should avoid exposing the PaymentIntent ID in the client-side code.
    dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
  });
});


//webhook





main().catch((e) => console.log("Connection error:", e));

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      family: 4
    });
    console.log("Database connected");
  } catch (error) {
    console.error("Connection failed:", error);
  }
}


server.get("/", (req, res) => {
  res.json({ s: "su " });
});

server.listen(process.env.PORT, (req, res) => {
  console.log("Server run on port 8080");
});
