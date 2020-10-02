var Jimp = require('jimp')
var qr = require("qr-image");
var fs = require('fs')

 
module.exports = {
generate:function({path,ratio = 3.5,uri,qrParams}){
const img_buf = qr.imageSync(uri,qrParams)
const img = new Jimp(img_buf, ((err, img) => { // eslint-disable-line
      if (err) throw err;
      return img
    }));
  
const logo_buf = fs.readFileSync(path)
const logo = new Jimp(logo_buf, ((err, img) => { // eslint-disable-line
      if (err) throw err;
      return img
    }));

const r_logo = logo.resize(90,-1)
  
  const x = Math.floor((img.bitmap.width - r_logo.bitmap.width) / 2);
  const y = Math.floor((img.bitmap.height - r_logo.bitmap.height) / 2);

  // Apply on the QRCode
  const qrImg = img.composite(r_logo, x, y);
  var buf_q; 
  qrImg.getBuffer(Jimp.MIME_PNG, (err, buf) => {
      if (err) return rej(err);
	  buf_q = buf
      
    });
  
  return buf_q;
  

}
}
