const axios = require("axios");

const api = process.env.API;

const Value = require("../models/value");

const { coinIds } = require("../../config/config");

const data_chart = async (req, res) => {
  //Controller function for /data/:coinId route
  const { coinId } = req.params;
  if (!coinIds.includes(coinId)) {
    //Handle error in case coin doesnt exist on the list of id's
    const error = new Error("Request Failed - Not Found");
    error.status = 404;
    res.render("error", { error });
    return;
  }
  //Request for historical data for past 7 days for API
  const request = axios({
    method: "get",
    url: `${api}/coins/${coinId}/market_chart`,
    params: {
      vs_currency: "usd",
      days: 7
    }
  });
  try {
    const response = await request;
    const hours = new Date().getHours(); //Get current hour
    const chartData = response.data.prices //Get prices from response
      .filter(pair => {
        //Filter prices, leave the ones for current hour
        const datahours = new Date(pair[0]).getHours(); //Get hour of the entery timestamp
        return hours == datahours;
      })
      .reduce(
        //Format the remaing data so the client can use it easyer
        (acc, pair) => {
          acc.dates.push(pair[0]);
          acc.data.push(pair[1]);
          return acc;
        },
        { dates: [], data: [] }
      );

    res.status(200).json({ ...chartData });
  } catch (error) {
    console.log(error);
    res.json({ error: error.data });
  }
};

const data_value = async (req, res) => {
  const { coinId } = req.params;

  try {
    const value = await Value.checkAndUpdate(coinId); //Check database and see if value for requested coin is out of date
    if (value) {
      //If no errors send response
      res.status(200).json({ ...value });
    }
  } catch (error) {
    const { message } = error;
    res.status(500).jsonp({ message });
  }
};

const data_symbol = async (req, res) => {
  // Controller for data_symbol route
  const { coinId } = req.params;
  const request = axios({
    method: "get",
    url: `${api}/coins/${coinId}`,
    params: {
      localization: false,
      tickers: false,
      community_data: false,
      developer_data: false
    }
  });
  try {
    const response = await request;
    const { symbol } = response.data;
    res.json({ symbol });
  } catch (error) {
    res.json({ error: error.data });
  }
};

module.exports = { data_chart, data_symbol, data_value };
