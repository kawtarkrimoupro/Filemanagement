var axios = require("axios");
var http = require("http");
var path = require("path");
const config = require("../config/config.json");

module.exports = (req, res, next) => {
  if (process.env.ENV != "test")
  {
  if (req.headers.token == undefined)
    return res.status(401).json({ message: "Un-authorized" });

  let token = req.headers.token.slice(7, req.headers.token.length);
  let full_url = config.settings.usersApi + "checkToken/" + token;

  /*
   *    Communicate with users api to check user paermission to upload/download
   */
  axios
    .get(full_url)
    .then((response) => {
      if (response.data.message == true) next();
      else return res.status(401).json({ message: "un-authorized" });
    })
    .catch((err) => {
      return res.status(401).json({ message: "un-authorized" });
    });
  }
  else {
    next();
  }
};
