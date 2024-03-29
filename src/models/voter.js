const mongoose = require("mongoose");
const VoterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  prn: {
    type: String,
    required: true,
  },
  // idFrontImage: {
  //   type: String,
  //   required: true,
  // },
  // idBackImage: {
  //   type: String,
  //   required: true,
  // },
});

const Voter = mongoose.model("VoterData", VoterSchema);
module.exports = Voter;
