const axios = require("axios");

const Value = require("../models/value");

require("dotenv").config();
const api = process.env.API;

const { coinIds } = require("../../config/config");

const page_index = async (req, res) => {
  //Controller for / route
  const promises = coinIds.map(id => {
    //Create an array of promises for each coin id
    return new Promise(async (resolve, reject) => {
      //Each promise receives coin specific data
      const request = axios({
        method: "get",
        url: `${api}/coins/${id}`,
        params: {
          localization: false,
          tickers: false,
          community_data: false,
          developer_data: false
        }
      });

      try {
        const response = await request;
        const { id, name, symbol, image, market_data } = response.data;
        const value = market_data.current_price.usd;

        const obj = {
          id,
          name,
          symbol: symbol.toUpperCase(),
          image: image.small,
          value: market_data.current_price.usd,
          url: `/charts/${id}`
        };

        const exists = !(await Value.createIfNotExist(id, value)); //If coin existend in the db
        if (exists) {
          //If it did update it's value
          await Value.checkAndUpdate(id, value);
        }

        resolve(obj); //And each promise will return only necessary data from the response object
      } catch (error) {
        reject(error);
      }
    });
  });

  const coinData = await Promise.all(promises);

  res.render("index", {
    index: true,
    bootstrap: true,
    coinData
  });
};

const page_chart = async (req, res) => {
  //Controller for /charts/:coinId route
  const { coinId } = req.params;
  if (!coinIds.includes(coinId)) {
    //Handle error in case coin doesnt exist on the list of id's
    const error = new Error("Request Failed - Not Found");
    error.status = 404;
    res.render("error", { error });
    return;
  }
  //Get coin name
  const response = await axios({
    method: "get",
    url: `${api}/coins/${coinId}`,
    params: {
      localization: false,
      tickers: false,
      community_data: false,
      developer_data: false
    }
  });

  const value = await Value.checkAndUpdate(coinId);

  try {
    const { name, image, symbol } = response.data;
    const coinName = name[0].toUpperCase() + name.slice(1); //Change later
    res.render("chart", {
      value: value.data.value,
      chart: true,
      bootstrap: true,
      extendTitle: coinName, //Goes after the title so each title is made unique
      image: image.small, //For page rendering
      symbol,
      coinName
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { page_index, page_chart };
