const mongoose = require("mongoose");

//models
const Package = require("./models/package");

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

const p = new Package({
  packageName: "Bangalore full tour",
  packageType: "Friends Tour",
  packageLocation: "Naglaore",
  packagePrice: 10000,
  packageFeatures: ["Accomodation", "Free wifi", "Food", "Hotels"],
  packageDetails:
    "Bangalore is the capital city of the southern Indian state of Karnataka. It is the seventh largest city in India. It is also known as the Garden City because of its many beautiful gardens and parks. The nandi hills in Bangalore is not to be missed by the pious. Though the origin of Bangalore is ancient, the present-day city was founded in the 16th century and has since continued to be an important administrative center.",
  packageImage:
    "https://img.traveltriangle.com/blog/wp-content/uploads/2020/01/places-to-visit-in-Bangalore-in-June1.jpg",
});
p.save()
  .then((p) => {
    console.log(p);
  })
  .catch((err) => {
    console.log(err);
  });
