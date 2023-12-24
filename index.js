const express = require("express"); // expresssjs for Node js
const app = express(); // app
const path = require("path"); // path
const methodOverride = require("method-override"); // html get post - put delete
const mongoose = require("mongoose"); // for mongodb-nodejs connection
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

//models
const Package = require("./models/package");
const User = require("./models/user");
const Admin = require("./models/admin");
const Booking = require("./models/booking");
const Enquiry = require("./models/enquiry");

//const booking
mongoose
  .connect("mongodb://localhost:27017/tms", {
    // test is the name of the database
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection Open!!!");
  })
  .catch((err) => {
    console.log("Oh no error");
  });

//for ejs and path for ejs files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public"))); // for static files

app.use(express.urlencoded({ extended: true })); // to parse form data from post request
app.use(express.json()); // to parse json data

app.use(methodOverride("_method"));

app.use(morgan("tiny")); //#middleware to maintain logs no need for our project
app.use(cookieParser("thisismysecret"));
app.use(
  session({
    secret: "thisisnotagoodsecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.messages = req.flash("success");
  res.locals.loginerror = req.flash("loginerror");
  next();
});

//functions
compare = (a1, a2) => a1.reduce((a, c) => a + a2.includes(c), 0);

//middlewares
const requireUserLogin = (req, res, next) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  next();
};

const requireAdminLogin = (req, res, next) => {
  if (req.session.user_id) {
    if (req.session.is_admin) {
      return next();
    } else {
      res.redirect("/login");
    }
  }
  res.redirect("/adminlogin");
};

//homepage
app.get("/", async (req, res) => {
  if (req.session.user_id) {
    const { user_id } = req.session;
    const username = req.session.username;
    res.render("homepage.ejs", { user_id, name: username });
  } else {
    res.render("homepage.ejs", { user_id: false });
  }
});

//admin register
app.get("/adminregister", (req, res) => {
  res.render("adminregister.ejs");
});

app.post("/adminregister", async (req, res) => {
  // const { username, password, } = req.body;
  const admin = new Admin(req.body);
  await admin.save();
  req.session.user_id = admin._id;
  req.session.is_admin = true;
  req.session.adminname = admin.username;
  res.redirect("/dashboard");
});

//admin Login
app.get("/adminlogin", (req, res) => {
  res.render("adminlogin.ejs");
});

app.post("/adminlogin", async (req, res) => {
  // console.log(req.body);
  const { email, password } = req.body;
  const foundAdmin = await Admin.findAndValidate(email, password);
  if (foundAdmin) {
    req.session.user_id = foundAdmin._id;
    req.session.is_admin = true;
    req.session.adminname = foundAdmin.username;
    // console.log(req.session);
    res.redirect("/dashboard");
  } else {
    req.flash("loginerror", "Invalid Credentials, Try Again");
    res.redirect("/adminlogin");
    //res.send("entraa idhi");
  }
});

//admin logout
app.post("/adminlogout", (req, res) => {
  req.session.destroy();
  res.redirect("/adminlogin");
});

//admin dashboard
app.get("/dashboard",  async (req, res) => {
  //console.log(req.session);
  const usersCount = 2 //await User.count({});
  const packagesCount = 3//await Package.count({});
  const bookingsCount = 4//await Booking.count({});
  const enquiriesCount = 5// await Enquiry.count({});
  const name = req.session.adminname;
  res.render("admindashboard.ejs", {
    usersCount,
    packagesCount,
    bookingsCount,
    enquiriesCount,
    name,
  });
});

//admin packages
app.get("/adminpackages", requireAdminLogin, async (req, res) => {
  const packages = await Package.find({});
  const name = req.session.adminname;
  res.render("adminpackages", { packages, name });
});

//Create New Package
app.get("/package/new", requireAdminLogin, (req, res) => {
  const name = req.session.adminname;
  res.render("newPackage", { name });
});

app.post("/package/new", requireAdminLogin, async (req, res) => {
  console.log(req.body);
  req.body.packageFeatures = req.body.packageFeatures.split(",");
  req.body.bookings = 0;
  console.log(req.body);
  const p = new Package(req.body);
  await p.save();
  req.flash("success", "Package created Successfully!!!");
  res.redirect("/adminpackages");
});

//edit
app.get("/packages/:id/edit", requireAdminLogin, async (req, res) => {
  const { id } = req.params;
  const package = await Package.findById(id);
  const features = package.packageFeatures.join();
  const name = req.session.adminname;
  res.render("editpackage", { p: package, features, name });
});

app.put("/packages/:id", requireAdminLogin, async (req, res) => {
  const { id } = req.params;
  req.body.packageFeatures = req.body.packageFeatures.split(",");

  await Package.findByIdAndUpdate(id, req.body);
  res.redirect("/adminpackages");
});

//delete packages
app.delete("/package/:id", requireAdminLogin, async (req, res) => {
  const { id } = req.params;
  await Package.findByIdAndDelete({ _id: id });
  res.redirect("/adminpackages");
});

//Open specific Package
app.get("/packages/:id", requireAdminLogin, async (req, res) => {
  const { id } = req.params;
  const package = await Package.findById(id);
  const name = req.session.adminname;
  res.render("packagepage", { p: package, name });
});

app.get("/adminusers", requireAdminLogin, async (req, res) => {
  const name = req.session.adminname;
  const users = await User.find({});
  res.render("adminusers.ejs", { users, name });
});

//BOOKINGS - ADMIN
app.get("/adminbookings", requireAdminLogin, async (req, res) => {
  const bookings = await Booking.find({});
  var packages = [];
  var users = [];
  for (let b of bookings) {
    let p = await Package.findById(b.packageId);
    let user = await User.findById(b.userId);
    packages.push(p);
    users.push(user);
  }
  const name = req.session.adminname;
  res.render("adminbookings.ejs", { bookings, packages, users, name });
});

//accpet booking
app.post("/booking/accept/:id", async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id);
  if (booking.status != 1) {
    await Booking.findByIdAndUpdate(id, { status: 1 });

    const package = await Package.findById(booking.packageId);
    await Package.findByIdAndUpdate(booking.packageId, {
      bookings: package.bookings + 1,
    });
    res.redirect("/adminbookings");
  } else {
    res.redirect("/adminbookings");
  }
});

//reject booking
app.post("/booking/reject/:id", async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id);
  if (booking.status == 1) {
    await Booking.findByIdAndUpdate(id, { status: -1 });
    const package = await Package.findById(booking.packageId);
    await Package.findByIdAndUpdate(booking.packageId, {
      bookings: package.bookings - 1,
    });
    res.redirect("/adminbookings");
  } else {
    res.redirect("/adminbookings");
  }

  // await Booking.findByIdAndUpdate(id, { status: -1 });
  // res.redirect("/adminbookings");
});

//ENQUIRIES - ADMIN
app.get("/adminenquiries", requireAdminLogin, async (req, res) => {
  const name = req.session.adminname;
  const enquiries = await Enquiry.find({});
  res.render("adminenquiries.ejs", { name, enquiries });
});

//accept enquiry
app.post("/enquiry/accept/:id", async (req, res) => {
  const { id } = req.params;
  await Enquiry.findByIdAndUpdate(id, { status: 1 });
  res.redirect("/adminenquiries");
});

app.post("/enquiry/reject/:id", async (req, res) => {
  const { id } = req.params;
  await Enquiry.findByIdAndUpdate(id, { status: -1 });
  res.redirect("/adminenquiries");
});

//Reports - admin
app.get("/adminreports", async (req, res) => {
  const name = req.session.adminname;
  const packages = await Package.find({}).sort({ bookings: "desc" });
  for (let x of packages) {
    console.log(x.packageName);
  }
  res.render("adminreports.ejs", { name, packages });
});

//User Register
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const { username, email, password, mobile, dob } = req.body;
  const user = new User({ username, email, password, mobile, dob });
  await user.save();
  req.session.user_id = user._id;
  User.find({ _id: user._id }, (err, docs) => {
    console.log(docs[0]);
    req.session.username = docs[0].username;
    res.redirect("/");
  });
});

//user login
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  // res.send("bharath");

  const { email, password } = req.body;
  const users = await User.find({ email: email });
  const foundUser = await User.findAndValidate(email, password);
  console.log(foundUser);

  if (foundUser) {
    req.session.user_id = foundUser._id;
    User.find({ _id: foundUser._id }, (err, docs) => {
      // console.log(docs[0]);
      req.session.username = docs[0].username;
      res.redirect("/");
    });
  } else {
    req.flash("loginerror", "Invalid Credentials, Try Again");
    res.redirect("/login");
  }
});

//user logout
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

//about us
app.get("/aboutus", (req, res) => {
  res.render("aboutus.ejs");
});

//preferences
app.put("/packages", async (req, res, next) => {
  const packagess = await Package.find({});
  const packages = [];

  const { tags } = req.body;
  //console.log(tags);
  req.session.tags = req.session.body;

  const count = [];

  for (let p of packagess) {
    count.push(compare(p.tags, tags));
  }

  console.log(count);

  var result = Array.from(Array(count.length).keys()).sort((a, b) =>
    count[a] < count[b] ? -1 : (count[b] < count[a]) | 0
  );
  result = result.reverse();
  console.log(result);
  for (let index of result) {
    if (count[index] == 0) {
      break;
    }
    packages.push(packagess[index]);
  }
  const username = req.session.username;
  res.render("packages.ejs", { packages, name: username, tags });
});

//all packages list
app.get("/packages", requireUserLogin, async (req, res) => {
  const packages = await Package.find({});
  const username = req.session.username;
  var tags = req.session.tags;
  if (!tags) {
    tags = [];
  }
  res.render("packages.ejs", { packages, name: username, tags });
});

//open specific package - user
app.get("/userpackages/:id", requireUserLogin, async (req, res) => {
  const { id } = req.params;
  const package = await Package.findById(id);
  const username = req.session.username;
  res.render("userpackagepage.ejs", { p: package, name: username });
});

//Book a Package - user
app.get("/booking/:id", requireUserLogin, async (req, res) => {
  const { id } = req.params;
  const username = req.session.username;
  const package = await Package.findById(id);
  res.render("booking.ejs", { p: package, name: username });
});

app.post("/booking/:id", requireUserLogin, async (req, res) => {
  const { id } = req.params;
  const userId = req.session.user_id;
  const currentdate = new Date();
  const { bookingMail, bookingMobile, bookingRemarks, passengers } = req.body;
  const status = 0;

  const book = new Booking({
    packageId: id,
    userId: userId,
    bookingMail: bookingMail,
    bookingMobile: bookingMobile,
    bookedtime: currentdate,
    bookingRemarks: bookingRemarks,
    passengers: passengers,
    status: status,
  });
  await book.save();
  const package = await Package.findById(id);
  const total = passengers * package.packagePrice;
  req.session.total = total;
  req.session.packageId = id;
  // res.redirect("/packages");
  res.redirect("/payment");
});

//payment page
app.get("/payment", requireUserLogin, async (req, res) => {
  const username = req.session.username;
  const total = req.session.total;

  // const package = await Package.findById(id);
  res.render("payment.ejs", { name: username, total });
});

//booking success
app.get("/bookingsuccess", requireUserLogin, (req, res) => {
  const username = req.session.username;
  req.session.total = 0;
  res.render("bookingsuccess.ejs", { name: username });
});

//popular
app.get("/popular", requireUserLogin, async (req, res) => {
  const username = req.session.username;
  const packages = await Package.find({}).sort({ bookings: "desc" });
  res.render("popular.ejs", { name: username, packages });
});

//myprofile
app.get("/myprofile", requireUserLogin, async (req, res) => {
  const userId = req.session.user_id;
  const user = await User.findById(userId);
  res.render("myprofile.ejs", { user, name: user.username });
});

// edit my profile
app.get("/myprofile/edit", requireUserLogin, async (req, res) => {
  const userId = req.session.user_id;
  const user = await User.findById(userId);
  res.render("editprofile.ejs", { user, name: user.username });
});

app.put("/myprofile", requireUserLogin, async (req, res) => {
  const userId = req.session.user_id;
  console.log(req.body);
  await User.findOneAndUpdate({ _id: userId }, req.body);
  res.redirect("/myprofile");
});

//tour history
app.get("/tourhistory", requireUserLogin, async (req, res) => {
  const username = req.session.username;
  const userId = req.session.user_id;
  const bookings = await Booking.find({ userId: userId });
  var packages = [];
  for (let b of bookings) {
    let p = await Package.findById(b.packageId);
    packages.push(p);
  }
  console.log(packages);
  res.render("tourhistory.ejs", { name: username, bookings, packages });
});

// app.get("/cookie", (req, res) => {
//   res.cookie("cNameKey", "CValue");
//   res.cookie("Theme", "Dark");
//   res.send("Cookie choosko");
// });

//enquiry
app.get("/enquiry", requireUserLogin, async (req, res) => {
  const username = req.session.username;
  const id = req.session.user_id;
  const enquiries = await Enquiry.find({ userId: id });
  console.log(enquiries);
  res.render("enquiry.ejs", { name: username, enquiries });
});

app.post("/enquiry/new", requireUserLogin, async (req, res) => {
  const userId = req.session.user_id;
  const { category, description } = req.body;
  var currentdate = new Date();
  const creationDate = currentdate.getDate();
  const updationDate = currentdate.getDate();
  const status = 0;
  const enquiry = new Enquiry({
    userId,
    category,
    description,
    status,
    creationDate,
    updationDate,
  });
  await enquiry.save();
  res.redirect("/enquiry");
});

// app.get("/bharath", (req, res) => {
//   console.log("Bharath bharath");
//   res.render("homepage.ejs");
// });

app.use((req, res) => {
  res.send("NOT FOUND!!");
});

app.listen(3000, () => {
  console.log("Serving Port 3000");
});
