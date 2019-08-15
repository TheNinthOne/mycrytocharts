const mongoose = require("mongoose");
const axios = require("axios");

//Create database schema for value collection
const valueSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  timestamp: Number,
  value: Number
});

//Check for coin value in database, if it's out of date update it
valueSchema.statics.checkAndUpdate = async function(id, value) {
  try {
    const old = await this.findOne({ id });
    const { timestamp } = old; //Time when old value was added to db
    const time = Date.now(); // Current time

    const update = time - timestamp >= 5 * 60 * 1000; //Should value be updated

    if (update) {
      let newvalue = null; //Stores new value to insert into db
      if (value) {
        //If value is proveide use that
        newvalue = value;
      } else {
        const request = axios({
          method: "get",
          url: `${process.env.API}/simple/price`,
          params: {
            ids: id,
            vs_currencies: "usd"
          }
        });

        const response = await request;

        newvalue = response.data[id].usd; //If not request it form API
      }

      //Update db and return new record
      const newValue = await this.findOneAndUpdate(
        { id },
        { $set: { value: newvalue, timestamp: Date.now() } },
        { new: true }
      ).exec();
      return { update, data: newValue };
    } else return { update, data: old };
  } catch (error) {
    return false;
  }
};

//Adds currency value yo db if it was not added previously
valueSchema.statics.createIfNotExist = async function(id, value) {
  try {
    const data = await this.findOne({ id });
    if (data == null) {
      //If it is not in db
      let newvalue = null; //Value to store
      if (value) {
        //If provided use that
        newvalue = value;
      } else {
        const request = axios({
          method: "get",
          url: `${process.env.API}/simple/price`,
          params: {
            ids: id,
            vs_currencies: "usd"
          }
        });
        const response = await request;
        newvalue = response.data[id].usd; //If not request form server
      }

      //Store new currency value to db
      const newValue = new this({
        id,
        value: newvalue,
        timestamp: Date.now()
      });

      newValue.save();

      //Then return new data
      return { update: true, data: newValue._doc };
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

module.exports = mongoose.model("Value", valueSchema);
