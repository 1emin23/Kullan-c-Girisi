const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
const port = 3000;
const users = [];

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize session
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure to true when using HTTPS
  })
);

function isLoggedIn(req, res, next) {
  // chatgpt yaptı
  if (req.session.user) {
    next(); // User is logged in, proceed to the next middleware
  } else {
    res.status(401).send("Unauthorized: Please log in");
  }
}

app.get("/", (req, res) => {
  const userLoggedIn = req.session.user ? true : false;
  res.render("home.ejs", { userLoggedIn: userLoggedIn });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send("Failed to logout");
    }
    res.redirect("/");
  });
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// Kayıt Işlemi
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const newUser = {
    username: username,
    email: email,
    password: password,
  };
  users.push(newUser);
  res.redirect("/login");
});

// Giriş Işlemi
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("email: ", email);
  const user = users.find((user) => user.email == email);
  console.log("user found: ", user);
  if (user) {
    if (user.email == email && user.password == password) {
      req.session.user = email;
      res.redirect("/");
    } else {
      res.send("Kullanıcı bilgilerinde hata var");
    }
  } else {
    res.send("Kullanıcı bulunamadı");
  }
});

// Sepete urun ekleme
app.post("/cart", async (req, res) => {
  const { productId, quantity } = req.body;

  if (!req.session.userId) {
    return res.status(401).send("Giriş yapmanız gerekiyor");
  }

  try {
    await db.query(
      "INSERT INTO carts (user_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = carts.quantity + $3",
      [req.session.userId, productId, quantity]
    );
    res.send("Ürün sepete eklendi");
  } catch (err) {
    res.status(500).send("Hata oluştu");
  }
});

// Sepeti Gösterme
app.get("/cart", async (req, res) => {
  res.render("cart.ejs");
});

app.get("/secrets", isLoggedIn, (req, res) => {
  res.send("this is a protected route and you have logged in");
});

app.listen(port);
