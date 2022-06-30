const fs = require("fs");

const AWS = require("aws-sdk");

const puppeteer = require("puppeteer");

const pdfFrontPage = require("./templates/pdf-front-page.js");

const header = require("./templates/header.js");

const footer = require("./templates/footer.js");

const portlet = require("./templates/portlet.js");

const moduleFrontPage = require("./templates/module-front-page.js");

const merge = require("easy-pdf-merge");

const axios = require("axios");

const dummyData = require("./input.js");

const getTimeOutForPortletType = require("./timeoutConfig");

let footerTemplate;

let pdfFiles;

let s3;

let tempPath = "/tmp/";

module.exports = async (event, callback) => {
  event = dummyData;
  let dataResponse = null;
  // let BASE_URL= 'https://api-prod-v1.centilytics.com/aws/costmonitoring/auth/home/cost-by-time';
  // let JWT= 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkZXZfY2VudEBjZW50aWx5dGljcy5jb20iLCJuYmYiOjE2NTU4NzY3MjUsImlvdF90b3BpYyI6ImExZDI5ZDUzLTI5MzItNGVkOC1hMjFiLTg4ZjNhZTk1YWY2ZSIsIkRPTUFJTl9JRCI6ImNlbnRpbHl0aWNzIiwiYWN0aXZlX3ZpZXciOiIwNDExNDE3Yi1kZTk1LTQyNTAtYTkxMS0yZDE1OTAxMWI5Y2QiLCJpc3MiOiJDRU5USUxZVElDUyIsIlRFTkFOVF9JRCI6ImU5MjE5NDY4LWY1ZjUtNDVlMS1hYzY2LTcwOGE1NDU0NWIxZiIsImV4cCI6MTY1NTkwMTkyNSwiaWF0IjoxNjU1ODc2NzI1fQ.9acGVQP_7n0RMjuyIP7HZRa7Kl90_U_RF3wkCUB911aa6mkGPKdm0JYfiM_bknjScPS2sDHGafBNNrKqwsSo7g';
  // let body = {"resourceTags":["Name|Shubham","Name|Abhinav-Openfaas-Dont-Delete"],"by":"days","timezone":"UTC","services":[],"roundOff":2,"accountIds":["343873837875"],"groupingForResourceTags":[],"regions":["Asia Pacific (Mumbai)"],"costType":"unblended","priceType":"listPrice","currency":{"id":"USD","label":"United States Dollar (USD)","symbol":"$","exchangeRate":1,"defaultCurrencyValue":false},"dateRange":{"startDateTime":"2022-06-01 00:00:00","endDateTime":"2022-06-21 23:59:59"}};
  // const config = {
  //   headers: {
  //       "Content-type": "application/json",
  //       "authorizationToken": `Bearer ${JWT}`,
  //   },
  // };    
  // await axios.post(`${BASE_URL}`, body, config).then((response)=>{
  //   event['modules']['aws/costmonitoring']['insights'][0]['data'] = JSON.parse(JSON.stringify(response.data));
  //   dataResponse = JSON.parse(JSON.stringify(event));
  //   console.log(dataResponse['modules']['aws/costmonitoring']['insights'][0]);

  // })

  if (event["s3Url"]) {
    // hit api

    console.log("GETTING DATA FROM S3");

    await axios.get(event["s3Url"]).then((response) => {
      dataResponse = response.data;
    });
  } else {
    dataResponse = JSON.parse(JSON.stringify(event));
  }

  let bucketName = dataResponse["bucketName"];

  let reportKey = dataResponse["reportKey"];

  if (!s3) {
    AWS.config.credentials = new AWS.EnvironmentCredentials("AWS");

    s3 = new AWS.S3({ region: event["region"] });
  }

  let DEPLOYMENT_NAME = process.env["DEPLOYMENT_NAME"];

  let BASE_API_URL = "";

  if (DEPLOYMENT_NAME && DEPLOYMENT_NAME == "staging") {
    BASE_API_URL = "https://apistaging.centilytics.com/docs/public/";
  } else if (DEPLOYMENT_NAME && DEPLOYMENT_NAME !== "production") {
    BASE_API_URL =
      "https://api-" + DEPLOYMENT_NAME + ".centilytics.com/docs/public/";
  } else {
    BASE_API_URL = "https://api.centilytics.com/docs/public/";
  }

  try {
    process.env["PUPPETEER_SKIP_CHROMIUM_DOWNLOAD"] = true;

    // Initializing Puppeteer Browser And Page

    console.log("Initializing Browser And Page.................");

    // const browser = await puppeteer.launch({

    // args: ['--no-sandbox'],

    // defaultViewport: chromium.defaultViewport,

    // executablePath: 'usr/bin/chromium-browser',

    // headless: true

    // });

    const browser = await puppeteer.launch({
      args: [
        // Required for Docker version of Puppeteer

        "--no-sandbox",

        "--disable-setuid-sandbox",

        "--no-zygote",

        "--single-process",

        // This will write shared memory files into /tmp instead of /dev/shm,

        // because Docker’s default for /dev/shm is 64MB

        "--disable-dev-shm-usage",
      ],
    });

    const browserVersion = await browser.version();

    console.log(`Started ${browserVersion}`);

    // let page = await browser.newPage();

    // Setting Basic Fields

    console.log("Setting Basic Fields.................");

    // const portletType = dataResponse.portletType;

    pdfFiles = [];

    const fileName = dataResponse["fileName"]
      ? dataResponse["fileName"]
      : "Report";

    footerTemplate = `<style>#footer { padding: 0 !important; }</style>
 
 <div style=' width:100%; -webkit-print-color-adjust: exact;height:20px;clear: both; display: flex; flex-direction: column;'> 
 
 <span style="color: white; flex: 1; background: #263550;vertical-align: middle; font-size: 7px; display: flex; align-items: center;padding-left: 20px">Powered by Centilytics 2021 &copy;</span>
 
 </div>`;

    await createPdf(
      browser,
      [pdfFrontPage.styles],
      [pdfFrontPage.html],
      pdfFrontPage.scriptsToImport,
      [pdfFrontPage["script"](dataResponse)],

      {
        path: tempPath + fileName + new Date().getTime() + ".pdf",

        format: "Letter",

        landscape: true,
      },

      1000
    );

    console.log(dataResponse["modules"]);

    let moduleKeys = Object.keys(dataResponse["modules"]);

    for (let i = 0; i < moduleKeys.length; i++) {
      console.log(
        "module text",
        dataResponse["modules"][moduleKeys[i]]["moduleText"]
      );

      await createPdf(
        browser,
        [moduleFrontPage.styles],
        [moduleFrontPage.html],
        moduleFrontPage.scriptsToImport,
        [moduleFrontPage["script"](dataResponse["modules"][moduleKeys[i]])],

        {
          path: tempPath + fileName + new Date().getTime() + ".pdf",

          format: "Letter",

          landscape: true,
        },

        100
      );

      for (
        let j = 0;
        j < dataResponse["modules"][moduleKeys[i]]["insights"].length;
        j++
      ) {
        const insightData =
          dataResponse["modules"][moduleKeys[i]]["insights"][j];

        const insightsStyleList = [];

        const insightsHtmlList = [];

        const insightsScripts = [];

        const jsScripts = header.scriptsToImport;

        const pageLoadTimeout = getTimeOutForPortletType(
          insightData['portletType'].toLowerCase(),
          insightData['data']
      );

        let invocationType = insightData["data"]["invocationType"]
          ? insightData["data"]["invocationType"]
          : "auth";

        await axios
          .get(
            BASE_API_URL +
              insightData["data"]["cloud"] +
              "/" +
              insightData["data"]["module"] +
              "/" +
              invocationType +
              "/" +
              insightData["data"]["page"] +
              "/" +
              insightData["data"]["insight"] +
              "/" +
              "description.json"
          )

          .then((response) => {
            console.log(response.data);

            if (response.data && response.data["checkDescription"]) {
              insightData["data"]["checkDescription"] =
                response.data["checkDescription"];
            }
          })

          .catch((error) => {
            console.log("Description json is not available for this insight.");
          });

        console.log("descr", insightData["data"]["checkDescription"]);

        insightData["data"]["startDate"] = dataResponse["startDate"];

        insightData["data"]["endDate"] = dataResponse["endDate"];

        insightsStyleList.push(header.styles);

        insightsHtmlList.push(header.html);

        insightsStyleList.push(
          portlet[insightData["portletType"].toLowerCase()].styles
        );

        insightsHtmlList.push(
          portlet[insightData["portletType"].toLowerCase()].html
        );

        insightsScripts.push(
          portlet[insightData["portletType"].toLowerCase()]["script"](
            insightData["data"],
            pageLoadTimeout
          )
        );

        insightsStyleList.push(footer.styles);

        insightsHtmlList.push(footer.html);

        await createPdf(
          browser,

          insightsStyleList,

          insightsHtmlList,

          jsScripts,

          insightsScripts,

          {
            path: tempPath + fileName + new Date().getTime() + ".pdf",

            format: "Letter",

            landscape: true,

            displayHeaderFooter: true,

            headerTemplate: `<div></div>`,

            footerTemplate: footerTemplate,

            printBackground: true,

            preferCSSPageSize: false,

            margin: {
              top: "40px",
              bottom: "40px",
            },
          },

          pageLoadTimeout
        );
      }
    }

    console.log("PDF Generated.................");

    // Closing Browser

    console.log("Handing Few Things................");

    await browser.close();

    // merge pdfs

    const finalFileName = tempPath + fileName + new Date().getTime() + ".pdf";

    await mergeMultiplePDF(pdfFiles, finalFileName);

    // Uploading PDF To S3

    console.log("Uploading To S3....................");

    let datab = fs.readFileSync(finalFileName);

    const params = {
      Bucket: bucketName,

      Key: reportKey,

      ContentType: "application/pdf",

      Body: Buffer.alloc(datab.byteLength, datab, "binary"),

      ContentEncoding: "base64",
    };

    // await uploadToS3(params);

    console.log("Uploaded To S3 Successfully....................");

    return Buffer.alloc(datab.byteLength, datab, "binary");

    // return {
    //   bucket: bucketName,

    //   key: reportKey,
    // };
  } catch (exception) {
    console.error(exception);
  }
};

const mergeMultiplePDF = (pdfFiles, fileName) => {
  return new Promise((resolve, reject) => {
    merge(pdfFiles, fileName, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      }

      console.log("Success: final Pdf", fileName);

      resolve();
    });
  });
};

const importJsScripts = async (scripts, page) => {
  for (let i = 0; i < scripts.length; i++) {
    await page.addScriptTag({ url: scripts[i] });
  }
};

const importScripts = async (scripts, page) => {
  for (let i = 0; i < scripts.length; i++) {
    await page.addScriptTag({ content: scripts[i] });
  }
};

const uploadToS3 = async (params) => {
  return await s3.putObject(params).promise();
};

const createPdf = async (
  browser,
  styleList,
  htmlContentList,
  jsScripts,
  scripts,
  pageOptionsObj,
  waitingTime
) => {
  let pageContent = "";

  pageContent += `<style>`;

  if (styleList) {
    styleList.forEach((row) => {
      pageContent += row;
    });
  }

  pageContent += `</style>`;

  if (htmlContentList) {
    htmlContentList.forEach((row) => {
      pageContent += row;
    });
  }

  let page = await browser.newPage();

  await page.setContent(pageContent);

  if (jsScripts && jsScripts.length) {
    await importJsScripts(jsScripts, page);
  }

  if (scripts && scripts.length) {
    await importScripts(scripts, page);
  }

  const session = await page.target().createCDPSession();

  await session.send("Page.enable");

  await session.send("Page.setWebLifecycleState", { state: "active" });

  // Waiting For Page To Render

  console.log("Waiting For Page To Render.................");

  await page.waitForTimeout(waitingTime);

  // Generating PDF

  console.log("Generating PDF.................");

  await page.emulateMediaType("screen");

  await page.pdf(pageOptionsObj);

  pdfFiles.push(pageOptionsObj["path"]);
};

exports.setter = async (data) => {
  tempPath = data["tempPath"];

  console.log("using accessKeyId:", data["accessKeyId"]);

  s3 = new AWS.S3({
    secretAccessKey: data["secretAccessKey"],

    accessKeyId: data["accessKeyId"],

    region: data["region"],
  });
};
