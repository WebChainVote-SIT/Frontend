//Running local server on Express
const express = require("express");

//MongoDB through Mongoose
const mongoose = require("mongoose");

const bodyParser = require("body-parser");

//Protect against cross-site scripting attacks
const cors = require("cors");
const app = express();

const VoterModel = require("./models/voter");
const AdminModel = require("./models/admin");
const electionName = require("./models/electionName");
const multer = require("multer");
const { useAsyncValue } = require("react-router-dom");
// const {
//   default: VoterRegistration,
// } = require("./pages/VoterRegistration/VoterRegistration");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

//Connecting to MongoDB Cloud
mongoose.connect(
  "mongodb+srv://vardh:vardh@cluster0.aggcl0r.mongodb.net/voters?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
  }
);

//For first entry, creation of voterdata:
//const voter = new VoterModel({ email: "vardh@gmail", password: "2133414" })
//VoterModel.insertMany(voter, function (error, docs) { });

const upload = multer({ dest: "uploads/" });

// app.post(
//   "/voter",
//   upload.fields([{ name: "idFrontImage" }, { name: "idBackImage" }]),
//   (req, res) => {
//     const voter = new VoterModel({
//       email: req.body.email,
//       password: req.body.password,
//       idFrontImage: req.files["idFrontImage"][0].path,
//       idBackImage: req.files["idBackImage"][0].path,
//     });

//     voter
//       .save()
//       .then(() => {
//         res.status(200).json({ message: "Login successful" });
//         console.log("Success");
//         res.redirect("http://localhost:3000/voting");
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// );

app.post("/voter", upload.none(), async (req, res) => {
  const voter = new VoterModel({
    email: req.body.email,
    password: req.body.pass,
    prn: req.body.prn,
    // idFrontImage: req.body.front,
    // idBackImage: req.body.back,
  });
  // console.log(req.body)
  console.log(req.body.email);
  console.log(req.body.prn);

  //const voter = new VoterModel(req.body);
  voter
    .save()
    .then(() => {
      console.log("Success");
      res.json({ success: true });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/admin", async (req, res) => {
  const user = await AdminModel.findOne({ email: req.body.email });
  console.log(req.body.email);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  if (user.password !== req.body.password) {
    return res.status(401).send({ message: "Incorrect password" });
  }
  res.status(200).json({ message: "Login successful" });
});

//Get Images
app.get("/api/getImages", async (req, res) => {
  const userEmail = req.query.email;
  const user = await VoterModel.findOne({ email: userEmail });
  console.log("Endpoint getImages hit");
  res.send(user);
});

//Barcode scan route
app.post("/api/barcode-scan", async (req, res) => {
  const { code } = req.body;
  console.log("Received QR code:", code);

  try {
    const voter = await VoterModel.findOne({ prn: code });
    console.log("Found voter:", voter);

    if (voter) {
      res.status(200).json({ matched: true, prn: voter.prn });
    } else {
      res.status(200).json({ matched: false });
    }
    return;
  } catch (error) {
    console.error("Error searching for voter:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api/recent-prn", async (req, res) => {
  try {
    // Query the database to get the most recent PRN
    const mostRecentPRN = await VoterModel.findOne().sort({ _id: -1 });
    console.log("Most recent QR", mostRecentPRN);

    if (!mostRecentPRN) {
      return res.status(404).json({ error: "No PRN found" });
    }

    res.json({ prn: mostRecentPRN.prn });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

//Get election List to map
app.get("/api/electionName", function (req, res) {
  var electionNames = [];
  var electionOrganizers = [];
  var electionIds = [];
  var electionTimer = [];
  var final = [];
  electionName.find({}).then((eachOne) => {
    for (i = 0; i < eachOne.length; i++) {
      electionNames[i] = eachOne[i].election_name;
      electionOrganizers[i] = eachOne[i].election_organizer;
      electionIds[i] = eachOne[i].election_id;
      electionTimer[i] = eachOne[i].election_timer;
      final.push({
        election_id: eachOne[i].election_id,
        election_organizer: eachOne[i].election_organizer,
        election_name: eachOne[i].election_name,
        election_timer: eachOne[i].election_timer,
      });
    }
    res.send(final);
    console.log(final);
  });
});

//Create new election
app.post("/api/electionName", async function (req, res) {
  electionName
    .create({
      election_id: Math.floor(Math.random() * 100),
      election_name: req.body.election_name,
      election_organizer: req.body.election_organizer,
      election_password: req.body.election_password,
      election_timer: req.body.election_timer,
    })
    .then((election) => {
      res.json(election);
    });
});

app.delete("/api/deleteElection/:id", async (req, res) => {
  const electionId = req.params.id;

  try {
    const deletedElection = await electionName.findOneAndDelete({
      election_id: electionId,
    });
    if (!deletedElection) {
      return res.status(404).json({ error: "Election not found." });
    }
    return res.status(200).json({ message: "Election deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete the election." });
  }
});

//Server running on port 3001
app.listen(3001, () => {
  console.log("Server running on port 3001");
});
