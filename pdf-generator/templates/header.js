const headerHandler = {
    html: `
        <body>
            <html>
    `,
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
        thead {
            display: table-header-group;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        table {
            //page-break-inside: avoid;
            width: 100%;
            border-collapse: collapse;
        }
        thead tr {
            // border-bottom: 1px solid #c4c4c4;
            border: 0;
            background: #263550;
            color: white;
        }
        tr:last-child {
            //page-break-after: always;
        }
        tr:nth-child(even) {
            background: #f4f5f7;
        }
        tr {
            display: flex;
            border: 0.5px solid #c4c4c4;
            border-top: 0;
            break-inside: avoid;
            page-break-inside: avoid;
        }
        th {
            font-weight: 600;
            font-size: 12px;
            word-break: break-word;
            
        }
    
        th, td {
            flex: 1;
            padding: 8px;
            text-align: left;
            border-right: 1px solid #c4c4c4;
        }

        th:last-child, td:last-child {
            border-right: 0
        }
    
        td {
            font-weight: 400;
            font-size: 10px;
            word-break: break-all;
        }
        .extra-message {
            width: 100%;
            text-align: center;
            margin-top: 50px;
            font-size: 1.5rem;
            color: #9a9999;
            display: none;
        }

        .description-container {
            margin: 20px 50px 0;
            display: none;
        }
        .description-label {
            display: block;
            margin-bottom: 8px;
            font-size: 1.2rem;
            font-weight: bold;
        }
        .description-content {
            font-size: 1rem;
            line-height: 1.4rem;
            text-align: justify;
            text-justify: inter-word;
        }
    `,
    scriptsToImport: [
        'https://code.jquery.com/jquery-3.2.1.min.js',
        'https://www.amcharts.com/lib/version/4.5.3/core.js',
        'https://www.amcharts.com/lib/version/4.5.3/charts.js',
        'https://www.amcharts.com/lib/4/themes/material.js',
        'https://www.amcharts.com/lib/4/themes/dark.js',
        'https://www.amcharts.com/lib/4/themes/animated.js',
        'https://www.amcharts.com/lib/3/ammap.js',
        'https://www.amcharts.com/lib/3/maps/js/worldLow.js',
        'https://www.amcharts.com/lib/3/themes/light.js'
    ]
};

module.exports = headerHandler;