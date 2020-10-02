var slugid = require("slugid");
//var qr = require("qr-image");
const fs = require("fs");
//const AWS = require("aws-sdk");
const { drawImage, PDFDocumentFactory, PDFDocumentWriter } = require("pdf-lib");
var qr_gen = require('./generateQR_logo')

function genCallback(statusCode, body) {
  let response = {
    headers: {
      "Content-Type": "application/pdf",
      "Access-Control-Allow-Origin": "*",
    },
    statusCode: statusCode,
    body: body,
	isBase64Encoded: true,
  };
  console.log(response);
  return response;
}

function getDimensions() {
  const width = 8.5 * 25.4;
  const height = 11 * 25.4;

  return {
    width: width,
    height: height,
  };
}

function getTemplateSpecs(templateName) {
  if (templateName === "60506_2x2_4x3") {
    template_file = "Template-60506_2x2_4x3.pdf";
    max_qr = 12;
  } else if (templateName === "60505_2x4_5x2") {
    max_qr = 10;
    template_file = "Template-60505_2x4_5x2.pdf";
  }
  else if(templateName === "SingleQR_6x6_1x1"){
	 template_file = "blank.pdf";
    max_qr = 1; 
  }  

  return {
    max_qr: max_qr,
    template_file: template_file,
  };
}

function hasValidInputs(body) {
  if (
    !body.rows ||
    !body.cols ||
    !body.no_sheet ||
    !body.xdim ||
    !body.ydim ||
    !body.tp_bt_mar ||
    !body.rt_lt_mar ||
    !body.template
  ) {
    // return genCallback(404, "invalid input")
    return false;
  } else if (body.no_sheet > 10) {
    return false;
    // genCallback(404, "Maximum number of sheet should be <=20")
  } else {
    return true;
  }
}

function genBlankPdf(no_sheet, template_file) {
  const pdfDoc = PDFDocumentFactory.load(fs.readFileSync(template_file));
  const pdfpage = pdfDoc.getPages();

  for (pg = 0; pg < no_sheet - 1; pg++) {
    pdfDoc.addPage(pdfpage[0]);
  }

  const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc); //initialise pdf bytes which will be generated ultimately
  return PDFDocumentFactory.load(pdfBytes);
}

function genQrImg(qrUrl, qrParams) {
  var locationSlug = slugid.v4();
  var qrUrl = `${qrUrl}/${locationSlug}`;
  var params={
    path:'./dxc_logo.png',
    uri:qrUrl,
    qrParams:qrParams	
}
  return qr_gen.generate(params);
}

function encodePdf(pdf) {
  const pdfBytes2 = PDFDocumentWriter.saveToBytes(pdf);
  var base64data = new Buffer(pdfBytes2);
  return base64data.toString("base64");
}

const qrParams = {
  ec_level:"H",    //error correction level
  type: "png",
  size: 8,
  margin: 2,
};


exports.lambda_handler = function (event, context, callback){
  const qrUrlBase = `https://${process.env.DOMAIN_URL}/tracing`;
  
  const body = JSON.parse(event.body);

  if (!hasValidInputs(body) === true) {
    callback(null, genCallback(400, "input validation failed"));
  }

  // const s3 = new AWS.S3({
    // signatureVersion: "v4",
    // // region: "us-east-2",
  // });

  const { width, height } = getDimensions();
  const { template_file, max_qr } = getTemplateSpecs(body.template);

  var row = body.rows;
  var col = body.cols;

  var no_sheet = body.no_sheet;
  var xdim = body.xdim * 25.4;
  var ydim = body.ydim * 25.4;
  var tp_bt_mar = body.tp_bt_mar * 25.4;
  var rt_lt_mar = body.rt_lt_mar * 25.4;
  var scale = Math.min(xdim, ydim);
  //max_qr = row * col;

  var xPos = 0;
  var yPos = 0;

  var xdiff = width - (2 * rt_lt_mar + col * xdim);
  if(col>1){
  var xtemp = xdiff / (col - 1);
  }
  var ydiff = height - (2 * tp_bt_mar + row * ydim);
  if(row>1){
  var ytemp = ydiff / (row - 1);
  }

  var k = 0; //col
  var l = 0; // row

  var img_reg = 0;

  const pdf = genBlankPdf(no_sheet, template_file);

  //insert dynamic qr into pdf pages:
  for (var i = 0; i < no_sheet; i++) {
    for (var j = 0; j < max_qr; j++) {
      const qrImg = genQrImg(qrUrlBase, qrParams);

      var [QRImageRef, QRImageDims] =  pdf.embedPNG(qrImg)
      if (k == 0) {
        xPos = rt_lt_mar + (0.025 * xdim) / 2;
      } else {
        xPos = rt_lt_mar + k * (xtemp + xdim) + (0.025 * xdim) / 2;
      }
      if (l == 0) {
        yPos = tp_bt_mar + (0.025 * ydim) / 2;
      } else {
        yPos = tp_bt_mar + l * (ytemp + ydim) + (0.025 * ydim) / 2;
      }

      var ref = `QRImage${img_reg.toString()}`;

      const contentStream =  pdf.register(
        pdf.createContentStream(
          drawImage(ref, {
            x: xPos * 2.835,
            y: yPos * 2.835,
            width: 0.975 * scale * 2.835,
            height: 0.975 * scale * 2.835,
          })
        )
      );

      const pages =  pdf.getPages();
      pages[i].addImageObject(ref, QRImageRef).addContentStreams(contentStream);
      k = k + 1;
      if (k > col - 1) {
        k = 0;
        l = l + 1;
      }
      img_reg++;
    }
    k = 0;
    l = 0;
  }

  const encodedPdf = encodePdf(pdf);
  callback(null, genCallback(200, encodedPdf))
  

  //const pdf_slug = slugid.nice();

  //let key = `qr_templates/${pdf_slug}.pdf`;

  // Replace this code with S3 PUT/GET
  // Convert to Node
  // let response = {

  //   statusCode: 200,
  //   headers: {
  //     'Content-type': 'application/pdf',//you can change any content type
  //     'content-disposition': 'attachment; filename=test.pdf' // key of success
  //   },
  //   body: encodedPdf.toString('base64'),
  //   isBase64Encoded: true
  // };
  // return response;

  // s3.putObject(
    // {
      // Bucket: bucket,
      // Key: key,
      // ACL: "public-read",
      // Body: encodedPdf,
    // },
    // function (err, url) {
      // if(err) {
		  // console.log(err);
		  // callback(null, genCallback(404, err));
	  // } else {
	   // s3.getSignedUrl(
        // "getObject",
        // {
          // Bucket: bucket,
          // Key: key,
          // Expires: 60 * 5,
        // },
        // (error, url) => {
          // if (error) {
            // console.log(error);
          // }
          // console.log("KEY:", key);
          // console.log("URL:", url);
          // callback(null, genCallback(200, url));
        // }
       // );
	  // }
    // }
  // );
};
