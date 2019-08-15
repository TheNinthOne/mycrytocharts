const express = require("express");

const controller = require("../controllers/page");

const router = express.Router();

router.get("/", controller.page_index);

router.get("/charts/:coinId", controller.page_chart);

module.exports = router;
//referer
