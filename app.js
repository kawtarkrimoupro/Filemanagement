const express = require("express");
const app = express();
const multer = require("multer");
const config = require("./config/config.json");
const fs = require("fs");
const auth = require("./auth/auth");
const MyCustomStorage = require("./customStorage/customStorage");
var path = require("path");
var zlib = require("zlib");
var cors = require('cors')

var Logs = require('./sequelize')

require("dotenv").config();


app.use(cors());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
/*
 *  Define a multer diskStorage to set uploads location, and for fileName Output.
 */
var storage = MyCustomStorage({
  destination: function (req, file, cb) {
    let upload_dir = null;
    /*
     *  Check If given Route is available in our config.
     *  and prepare wanted upload_Dir Name.
     */
    config.Applications.forEach((app) => {
      if (app.id == req.params.app) upload_dir = app.Absolute_path_upload_Dir;
    });

    /*
     *  If upload dir is authorized : will check if directory is available, otherwise it will create it.
     */
    if (upload_dir != null) {
      // upload_dir = path.join(upload_dir);
      if (!fs.existsSync(upload_dir)) {
        fs.mkdir(upload_dir, (err) => {
          if (err) {
            console.error(err.message);
            cb("Error creating destination file, try creating it manually", "");
          }
          cb(null, upload_dir);
        });
      } else cb(null, upload_dir);
    } else cb("Application Un-Authorized", "");
  },
});

/*
 *  Apply diskStorage config to multer
 */
var upload = multer({ storage: storage });

const PORT = process.env.PORT || 3001;

/*
 *  Auth Middleware
 */
app.use(auth);

/*
 *  Upload section is handled throught multer middleware. see ./customStorage/customStorage.js (for more infos).
 *  if no file is given return a 400 status code response.
 *  otherwise it will return the new filename with "time-stamp-fileName.gz"
 */
app.post(
  "/upload/:app",
  upload.array("file", config.settings.maxFileUpload),
  (req, res) => {
    const files = req.files;
    if ( files == null || !files.length)
      return res
        .status(400)
        .json({ message: "Please Give at least one file." });
    let resp = [];
    files.forEach((Element) => {
      Logs.create({
        userId : req.body.userId,
        appId: req.params.app,
        action: 'Upload',
        fileName: Element.originalname,
        filePath: Element.path
      }).catch(err => {
        console.error(err);
        res.status(501).json({message: "Internal Server log Error"});
      })
      resp.push({
        newFileName: Element.originalname,
      });
    });
    res.json(resp);
  }
);

/*
 *  Download section
 *  body => {
 *    appId : 'application id',
 *    fileName : 'file name returned in the upload section'
 * }
 */
app.post("/download", function (req, res) {
  let app_Dir = null;
  /*
   * Get Application absolute path
   */
  config.Applications.forEach((element) => {
    if (element.id == req.body.appId)
      app_Dir = element.Absolute_path_upload_Dir;
  });

  /*
   *  In case the demanded application is not available in our config file.
   */
  if (app_Dir == null)
    return res.status(501).json({ message: "not Authorized" });

  /*
   *  set up the path for our desired file.
   *  if the file does not exist, fire an error.
   */
  filePath = path.join(app_Dir, req.body.fileName);
  if (!fs.existsSync(filePath))
    return res.status(404).json({ message: "ressource not found" });


  /*
   *  - Remove .gz extention from the filename we will deliver.
   *  - Create path when we will temporarly un-compress our file. (uploads directory). (tmp)
   *  - Create a read stream from path application.
   *  - Create a write stream. (tmp)
   */
  const finaleFileName = req.body.fileName.split(".gz");
  const tmp = path.join(__dirname, "uploads", finaleFileName[0]);
  const inp = fs.createReadStream(filePath);
  const out = fs.createWriteStream(tmp);

  var unzip = zlib.createUnzip();

  /*
   *  - Read desired compressed file, then uncompress it, and finaly serve it to (tmp) path.
   *  - Serve back the file.
   *  - Remove the un-compressed file from the upload dir (tmp).
   *  - If there an error occured it's managed with a 401 status code
   */
  inp.pipe(unzip).pipe(out);
  out.on("finish", () => {
    Logs.create({
      userId : req.body.userId,
      appId: req.body.appId,
      action: 'Download',
      fileName: finaleFileName[0],
      filePath: filePath
    }).catch(err => {
      console.error(err);
      res.status(501).json({message: "Internal Server log Error"});
    })
    res.download(tmp);
    res.on("finish", () => {
      fs.unlink(tmp, (err) => {
        if (err) console.error(err);
      });
    });
  });

  out.on("error", () => {
    res.status(401).json({ message: "Internal server error" });
  });
});


app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});

module.exports = app;
