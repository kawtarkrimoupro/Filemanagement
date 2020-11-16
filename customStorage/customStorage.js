var fs = require("fs");
var zlib = require("zlib");

/*
 *  The default destination if no destination option was provided
 */
function getDestination(req, file, cb) {
  cb(null, "/dev/null");
}

/*
 *  Check if there is a destination option provided.
 *  Other wise it will use the getDestination default option.
 */

function MyCustomStorage(opts) {
  this.getDestination = opts.destination || getDestination;
}


/*
 *  _handleFile : function that get the file stream, and prepare it for storing
 *              : first it handle the location of storage.
 *              : then create a writeStream to the location provided 
 *              : Zip files given then store them.
 */
MyCustomStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  this.getDestination(req, file, (err, path) => {
    if (err) return cb(err);

    let newFileName = Date.now() + '_' + file.originalname +'.gz';
    file.originalname = newFileName;
    let finalPath = path + newFileName

    var outStream = fs.createWriteStream(finalPath);
    const gzip = zlib.createGzip();
    
    file.stream.pipe(gzip).pipe(outStream);

    outStream.on("error", cb);
    outStream.on("finish", () => {
      cb(null, {
        path: path,
        size: outStream.bytesWritten,
      });
    });
  });
};

/*
 *  _removeFile : Function fired when an error occured during storing process,
 *                to clear all stored files during this step.
 *
 */

MyCustomStorage.prototype._removeFile = function _removeFile(req, file, cb) {
    fs.unlink(file.path, cb)
}

module.exports = function (opts) {
    return new MyCustomStorage(opts)
}
