const axios = require("axios");

const api = process.env.API;

const { ids } = require("../coins");

const data_chart = async (req, res) => {
  //Controller function for /data/:coinId route
  const { coinId } = req.params;
  if (!ids.includes(coinId)) {
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
    res.json(response.data);
  } catch (error) {
    console.log(error);
  }
};

const data_color = async (req, res) => {
  //Controller for /data/color route
  const request = axios({
    method: "get",
    url: "http://www.colr.org/json/color/random"
  });
  try {
    const response = await request;
    const color = `#${response.data.colors[0].hex}`;
    res.json({ color });
  } catch (error) {
    res.json({ color: "#fc03f8" });
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
    console.log(error);
  }
};

module.exports = { data_chart, data_color, data_symbol };
