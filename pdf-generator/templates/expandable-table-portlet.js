const expandableTablePortlet = {
    html: `
        <div class="expandable-table-header">
            <h1 class="expandable-table-title"></h1>
        </div>
        <div class="expandable-table-header-bottom"></div> 
        <div class="expandable-table-container">
           
        </div>
        <div class="extra-message">
            No Data Available
        </div>
    `,
    styles: `
            .expandable-table-header {
                width: 100%;
                margin: 0;
                padding: 0 50px 0;
                box-sizing: border-box;
            }
            .expandable-table-title {
                font-weight: 500;
                font-size: 30px;
                margin: 0;
                padding-left: 5px;
            }
            .expandable-table-header-bottom {
                width: 100%;
                height: 5px;
                margin-left: 50px;
                background: #263550;
            }
            .expandable-table-container {
                width: 10in;
                page-break-after: always;
                padding: 30px 50px;
            }
            .expandable-table-content {
                width: 100%;
                page-break-after: always;
            }
            .expandable-table-heading {
                margin-bottom: 10px;
                font-size: 20px;
            }
            .table-data-container {
                width: 100%;
                margin-bottom: 30px;
            }
            div.expandable-table-container div:last-child .table-data-container{
                margin-bottom: 0 !important;
            }
            .one {
                max-width: 200px;
                text-align: center;
                word-break: break-word;
                font-size: 22px;
                background: #263550;
                color: #fff;
                padding: 20px 10px;
                border-bottom: 1px solid;
                font-size: 18px;
                page-break: avoid;
                page-break-inside: avoid;
            }
            .two {
                border-bottom: 1px solid #000;
                border-right: 1px solid #000 !important;
                padding: 0;
                page-break: avoid;
                page-break-inside: avoid;
            }
            .two-content-row {
                font-size: 15px;
            }
            .tagging-info {
                width: 94.5%;
                margin: 20px 0 20px 20px;
            }
            tr:last-child td{
                border-bottom : 0;
            }
            table {
                width: 100%;
            }
            .highlight {
                font-weight: bold;
            }
            tr {
                break-inside: avoid;
                page-break-inside: avoid;
                border: 0;
            }

            .internal-row {
                padding: 20px 10px;
                border-bottom: 1px solid #000;
            }

            .internal-row-parent:nth-child(even) {
                background: #f4f5f7 !important;
            }

            .internal-row-parent:nth-child(even) tr {
                background: #f4f5f7 !important;
            }

            tr td {
                border: 0;
                page-break-inside: avoid !important;
            }

            tr:nth-child(even) {
                background: #fff;
            }

            th {
                width: 100%;
            }

            .table-data-container tr:first-child {
                border-top: 1px solid #000 ;
            }

            .table-data-container tr:last-child {
                border-bottom: 1px solid #000 ;
            }

            .two tr:last-child {
                border-bottom: 0 ;
            }

            .tagging-info tr:last-child {
                border-bottom: 0.5px solid #c4c4c4;
            }

            .two tr:first-child,tr:last-child {
                border-top: 0 ;
                border-bottom: 0;
            }
            .tagging-info td,th {
                border: 0.5px solid #c4c4c4;
            }

            .tagging-info th {
                background: #263550;
                color: white;
            }

            .tagging-info tr:nth-child(odd) {
                background: #f4f5f7;
            }

            .internal-extra-msg {
                width: 100%;
                display: flex;
                align-items: center;
                margin-left: 18px;
                font-size: 15px;
            }


    `,
    scriptsToImport: [
    ],
    script: (data) => {
        return `
            (async () => {
                let data = ${JSON.stringify(data)};
                let htmlContent = '';
                $('.expandable-table-title').html(data['insightText']);
                if (Object.keys(data['dataList']).length === 0) {
                    $('.extra-message').css({'display': 'block'});
                    $('.expandable-table-container').css({'display': 'none'});
                    return;
                } 
                if (data['dataList'].length) {
                    data['dataList'].forEach(row => {
                        const heading = data['dataMap']['modalKeys'];
                        htmlContent += '<div class="expandable-table-content">'; 
                        htmlContent += '<div class="expandable-table-heading"><span class="highlight">' + row['modalData'][heading[0]]['columns'][0] + ' : </span>' +  row['modalData'][heading[0]]['data'][0][row['modalData'][heading[0]]['columns'][0]]  + '</div>';
                        htmlContent += '<table class="table-data-container">';
                        data['dataMap']['modalKeys'].forEach(key => {
                            if (row['modalData'][key]['data'].length) {
                                htmlContent += '<tr>'
                                htmlContent += '<td class="one">' + key + '</td>'; 
                                htmlContent += '<td class="' + (row['modalData'][key]['data'][0]['errorMessage'] ? 'two internal-extra-msg' : 'two') + '">';
                                    let columns = row['modalData'][key]['columns'];
                                    if (key === 'Tagging Info') {
                                        
                                        htmlContent += '<table class="tagging-info set-width">';
                                        htmlContent += '<tr>';
                                        columns.forEach(key => {
                                            htmlContent += '<th>' + key + '</th>';
                                        });
                                        htmlContent += '</tr>';
                                        //htmlContent += '<tbody>';
                                        row['modalData'][key]['data'].forEach(internalRow => {
                                            htmlContent += '<tr>';
                                            columns.forEach(tableKey => {
                                                htmlContent += '<td>' + internalRow[tableKey] + '</td>';      
                                            });
                                            htmlContent += '</tr>';
                                        });
                                        //htmlContent += '</tbody>';
                                        htmlContent += '</table>';
                                        
                                    } else { 
                                                                             
                                        if (!row['modalData'][key]['data'][0]['errorMessage']) {
                                            htmlContent += '<table>';
                                            row['modalData'][key]['data'].forEach(internalRow => {
                                                htmlContent += '<tr class="internal-row-parent"><td class="internal-row"> <table>';
                                                columns.forEach((internalKey, index) => {
                                                    if (index % 2 === 0) {
                                                        htmlContent += '<tr>';
                                                    }
                                                    htmlContent += '<td  class="two-content-row"> <span class="highlight">' + internalKey + ' : </span>' + internalRow[internalKey] + '</td>';
                                                    if (index % 2 !== 0) {
                                                        htmlContent += '</tr>';
                                                    }
                                                });
                                                htmlContent += '</table></td></tr>';
                                            });
                                            htmlContent += '</table>';
                                        } else {
                                            
                                                htmlContent += row['modalData'][key]['data'][0]['errorMessage'];    
        
                                        }
                                       
                                    }    
                                   
                                htmlContent += '</td>';
                                htmlContent += '</tr>';
                            }
                        });
                        htmlContent += '</table></div>';
                    });
                } 
                
                $('.expandable-table-container').html(htmlContent);
                
            })();  
        `;
    }
};

module.exports = expandableTablePortlet;