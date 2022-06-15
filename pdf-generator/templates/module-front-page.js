const portletHeader = {
    html: `
    <html>
        <body>
            <div class="pdf-second-page-container">
                <span class="report-module">
                </span>
                <span class="pdf-date-range">
                </span>
            </div>
        </body>
    </html>`,
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
    .pdf-second-page-container {
        width: 11in;
        height: 8.5in;
        background-image: url("https://s3.ap-south-1.amazonaws.com/centilytics.config.ap-south-1/defaultWebsite/pdfSecondImage.png");
        background-color: #000;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        display: flex;
        flex-direction: column;
        color: black;
        align-items: center;
        justify-content: center;
        position: relative;
    }
    .report-module {
        width: 70%;
        display: block;
        word-wrap: break-word;
        font-size: 70px;
        font-weight: bold;
        text-align: center;
        color: black;
        margin-top: 1in;
    }
    .date-label {
        font-size: 20px;
        margin-top: 20px;
    }
    .pdf-date-range {
        font-size: 25px;
        font-weight: 500;
        margin-top: 20px;
    }
    `,
    scriptsToImport: [
        'https://code.jquery.com/jquery-3.2.1.min.js',
    ],
    script: (data) => {
        return `      
            let moduleData = ${JSON.stringify(data)};
            $('.report-module').html(moduleData['moduleText']);

            if (moduleData['startDate'] && moduleData['endDate']) {
                $('.pdf-date-range').html(moduleData['startDate'] + ' - ' + moduleData['endDate']);
            } else if (moduleData['time']) {
                $('.pdf-date-range').html(moduleData['time']);
            }
        `;
    }
};

module.exports = portletHeader;