const headerHandler = {
    styles: `
        html {
            -webkit-print-color-adjust: exact;
        }
        html,
        body {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            color: #444444;
            background: white;
            font-family: helvetica;
            overflow-x: hidden;
            //padding: 10px 10px;
        }
        // @page {
        //     size: letter landscape;
        //     //margin: 10px 0;
        // }
        .pdf-first-page-container {
            width: 11in;
            height: 8.5in;
            background-image: url("https://s3.ap-south-1.amazonaws.com/centilytics.config.ap-south-1/defaultWebsite/pdfFirstImage.png");
            background-color: #000;
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
        }
        .report-details-container {
            flex: 1;   
        }
        .report-logo {
            height: 70px;
            position: absolute;
            right: 0.3in;
            top: 0.35in;
        }
        .report-name {
            color: white;
            font-size: 40px;
            width: 80%;
            display: block;
            word-wrap: break-word;
            font-weight: bold;
            text-align: center;
        }
        .report-gen-date {
            position: absolute;
            bottom: 0.35in;
            right: 0.3in;
            color: black;
            font-size: 35px;
            font-weight: 540;
        }
        table {
            page-break-inside: avoid;
            width: 100%;
            border: 0.5px solid #c4c4c4;
            border-collapse: collapse;
            border-bottom: 0;
        }
        table:last-child {
            border-bottom: 1px solid #c4c4c4;
            page-break-after: always;
        }
        table:first-child {
            border-top: 1px solid #c4c4c4;
            border: 0;
            background: #263550;
            color: white;
        }
        table:nth-child(even) {
            background: #f4f5f7;
        }
        tr {
            display: flex;
            //padding: 8px 0;
        }
        th {
            font-weight: 600;
            font-size: 12px;
            word-break: break-word;
        }
    
        th, td {
            flex: 1;
            padding: 8px;
            border-right: 1px solid #c4c4c4;
        }

        th:last-child, td:last-child {
            border-right: 0
        }
    
        td {
            font-weight: 400;
            font-size: 10px;
            text-align: center;
            word-break: break-all;
        }
    `,
    html: `
        <html>
            <body>
                <div class="pdf-first-page-container">
                    <img class="report-logo">
                    <span class="report-name"></span>
                    <div class="report-gen-date">
                    </div>
                </div>
                </body>
            </html>
    `,
    scriptsToImport: [
        'https://code.jquery.com/jquery-3.2.1.min.js',
    ],
    script: (data) => {
        return `
            let pdfData = ${JSON.stringify(data)};
            let date = (new Date() + '').split(' ');
            let imageUrl = pdfData['imageUrl'] && pdfData['imageUrl'] != null ? pdfData['imageUrl'] : "https://s3.ap-south-1.amazonaws.com/centilytics.config.ap-south-1/defaultWebsite/whiteLogo.png";
            $('.report-gen-date').html('Generated on: ' + date[2] + ' ' + date[1] + ' ' + date[3]);      
            $('.report-logo').attr("src", imageUrl);
            let reportName = pdfData['reportName'] ? pdfData['reportName'] : '';
            let moduleList = pdfData['modules'] ? Object.keys(pdfData['modules']) : [];
            if (!pdfData['reportName'] && moduleList && moduleList.length) {
                    reportName = (pdfData['modules'][moduleList[0]]['insights'] && pdfData['modules'][moduleList[0]]['insights'].length 
                                && pdfData['modules'][moduleList[0]]['insights'][0]['data'] && 
                                pdfData['modules'][moduleList[0]]['insights'][0]['data']['insightText']
                                ) ?  pdfData['modules'][moduleList[0]]['insights'][0]['data']['insightText'] : '';  
            }

            $('.report-name').html(reportName);
        `;
    }
};

module.exports = headerHandler;