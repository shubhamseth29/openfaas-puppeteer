const piePortlet = {
    html: `
        <div class="pie-header">
            <h1 class="pie-title"></h1>
        </div>
        <div class="pie-header-bottom"></div>
        <div class="description-container">
                <span class="description-label">Description</span>
                <span class="description-content">
                </span>
            </div> 
        <div class="pie-container">
            <div class="pie-content">
                <div class="pie-chart-div">
                </div>
                <div class="pie-general">
                    <span class="total-cost-usage-key">Total Cost:</span>
                    <span class="total-cost-usage-value"></span>
                </div>
                <div id="pie-legendDivLine"></div>
                <div class="pie-legendwrapper">           
                    <div id="pie-second-legendDivLine"></div>
                </div>
            </div>
        </div>
        <div class="pie-table-container">
        </div>
        <div class="extra-message">
            No Data Available
        </div>
    `,
    styles: `
            .pie-header {
                display: flex;
                flex-direction: column;
                width: 100%;
                margin: 0;
                padding: 0 50px 0;
                box-sizing: border-box;
            }
            .pie-title {
                font-weight: 500;
                font-size: 30px;
                margin: 0;
                padding-left: 5px;
                //text-align: center;
            }
            .pie-header-bottom {
                width: 100%;
                height: 5px;
                margin-left: 50px;
                background: #263550;
            }
            .pie-container {
                display: flex;
                //flex-direction: row;
                width: 11in;
                justify-content: center;
                align-items: center;
                page-break-after: auto;
            }
            .pie-content {
                display: flex;
                width: 9.9in;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                //border: 2px solid black;
            }
            .pie-top-legends {
               width: 100%;
            }
            .pie-chart-div {
                width: 80%;
                height: 350px;
                padding-top: 20px;
                padding-bottom: 20px;
            }
            .second-pie-chart-div {
                width: 10%;
                height: 20px;
                display: none;
            }
            .pie-general {
                margin-bottom: 15px;
            }
            .total-cost-usage-key {    
                font-weight: bold;
                font-size: 20px;
            }
            .total-cost-usage-value {
                font-size: 20px;
            }
            #pie-legendDivLine {
                width: 80%;
                display: none;
            }
            #pie-second-legendDivLine {
                width: 80%;
                height: 200px;
            }
            .pie-legendwrapper {
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 20px;
            }
            .pie-table-container {
                margin: 20px 50px 0 50px;
            }
            .legendTd {
                
            }
            .legendTd div {
                height: 14px;
                width: 14px;
                border-radius: 100%;
                background-color: grey;
            }
    `,
    scriptsToImport: [
    ],
    script: (data) => {
        return `
            (async () => {
                let chart;
                let pieSeries;
                let legends;
                let markerTemplate;
                let marker;
                let legendContainer;
                let newLegendContainer;
                let newLegend;
                let data = ${JSON.stringify(data)};
                let showGraph = true;
                let legendsData = [];
                let legendsColorObj = {};
                $('.pie-title').attr('id',data['cloud'] + data['module'] + data['page'] + data['insight'] + 'insightText');   
                $('.pie-chart-div').attr('id',data['cloud'] + data['module'] + data['page'] + data['insight']);   
                $('.pie-table-container').attr('id',data['cloud'] + data['module'] + data['page'] + data['insight'] + 'table');   
                //$('.pie-legendDivLine').attr('id', data['cloud'] + data['module'] + data['page'] + data['insight'] + 'legenddiv');   
                $('#' + data['cloud'] + data['module'] + data['page'] + data['insight'] + 'insightText').html(data['insightText']);

                if (data['dataMap']['totalCost']) {
                    $('.total-cost-usage-key').html('Total Cost:');
                    $('.total-cost-usage-value').html(data['dataMap']['currencySymbol'] + data['dataMap']['totalCost']);
                } else if (data['dataMap']['totalUsage']) {
                    $('.total-cost-usage-key').html('Total Usage:');
                    $('.total-cost-usage-value').html(data['dataMap']['totalUsage']);
                }

                if (data['checkDescription'] && data['checkDescription']['description']) {
                    $('.description-container').css({'display': 'block'});
                    $('.description-content').html(data['checkDescription']['description']);
                    $('.pie-container').css({'margin-top': '0'});
                    $('.extra-message').css({'margin-top': '20px'});
                }

                if (Object.keys(data['dataMap']).length === 0) {
                    $('.extra-message').css({'display': 'block'});
                    $('.pie-container').css({'display': 'none'});
                    $('.pie-table-container').css({'display': 'none'});
                    return;
                } 

                // prepare pie data
                const tableDataAfterColSel = [];
                const tableDataAfterColSelNew = []; 
                const prepareTempData = {};
                data['dataMap']['table'].forEach(element => {
                    if (element[data['dataMap']['pie']['y'][0]] in prepareTempData) {
                        prepareTempData[element[data['dataMap']['pie']['y'][0]]] = +((prepareTempData[element[data['dataMap']['pie']['y'][0]]] + element[data['dataMap']['pie']['x'][0]]).toFixed(data['dataMap']['roundOff']));
                    } else {
                        prepareTempData[element[data['dataMap']['pie']['y'][0]]] = element[data['dataMap']['pie']['x'][0]];
                    }
                });

                Object.keys(prepareTempData).forEach(key => {
                    if (!(prepareTempData[key] < 0)) {
                        const tempObject = {};
                        tempObject['y'] = key;
                        tempObject['x'] = prepareTempData[key];
                        tableDataAfterColSel.push(tempObject);
                        tableDataAfterColSelNew.push(tempObject);
                    }
                }); 
                // prepare pie data

                    if ((('totalCost' in data['dataMap'] && data['dataMap']['totalCost'] === 0) 
                    || ('totalUsage' in data['dataMap'] && data['dataMap']['totalUsage'] === 0)) || (tableDataAfterColSel.length > 200)) {
                        $('.pie-container').css({'display': 'none'});
                        showGraph = false;
                    } 

                    if (showGraph) {
                        chart = am4core.create(data['cloud'] + data['module'] + data['page'] + data['insight'], am4charts.PieChart);
                        chart.data = tableDataAfterColSel;
    
                        pieSeries = chart.series.push(new am4charts.PieSeries());
                        pieSeries.dataFields.value = 'x';
                        pieSeries.dataFields.category = 'y';
                        pieSeries.slices.template.stroke = am4core.color("#e3e3e3");
                        pieSeries.slices.template.strokeWidth = 0.5;
                        pieSeries.slices.template.strokeOpacity = 1;
                        pieSeries.slices.template.margin = 80;
                        pieSeries.labels.template.disabled = true;
                        pieSeries.ticks.template.disabled = true;
                        // pieSeries.labels.template.adapter.add('text', (label, target, key) => {
                            
                        //     if (target.dataItem && (target.dataItem.value > tableDataAfterColSel[5][data['dataMap']['pie']['x'][0]])) {
                        //       return label;
                        //     }
                        //     return '';
                        //   });
                        //pieSeries.legendSettings.itemValueText = '{valueY}';
                        chart.radius = am4core.percent(80);
    
                        pieSeries.hiddenState.properties.opacity = 0.5;
                        pieSeries.hiddenState.properties.endAngle = -90;
                        pieSeries.hiddenState.properties.startAngle = -90;
    
                        legends = new am4charts.Legend();
                        chart.legend = legends; 
                        legendContainer = am4core.create('pie-legendDivLine', am4core.Container);
                        chart.legend.parent = legendContainer;
                        //legendContainer.width = am4core.percent(100);
                        //legendContainer.height = am4core.percent(100);
                        chart.legend.labels.template.maxWidth = 300;
                        chart.legend.labels.template.truncate = false;
                        chart.legend.labels.template.wrap = true;
                        chart.legend.useDefaultMarker = true;
                        markerTemplate = chart.legend.markers.template;
                        markerTemplate.width = 15;
                        markerTemplate.height = 15;
                        chart.legend.fontSize = '11';
                        marker = chart.legend.markers.template.children.getIndex(0);
                        marker.cornerRadius(12, 12, 12, 12);
                        marker.radius = 5.5;
                        marker.stroke = am4core.color('#ccc');
                    }

                setTimeout(() => {
                    let chartRows;
                    if (showGraph) {
                        chartRows = legends['labels']['_values'];

                        // code for hidden pie chart
                        let tempData;
     
                        if (tableDataAfterColSelNew.length > 4) {
                            tableDataAfterColSelSorted = tableDataAfterColSelNew.sort((a, b) => (a.x < b.x) ? 1 : -1);
                            tempData = tableDataAfterColSelSorted.splice(0, 10);
                        } else {
                            tempData = tableDataAfterColSelNew;
                        }
     
                        tempData.forEach(row => {                  
                            legendsData.push({
                                'name': row['y'] + ' : ' + (data['dataMap']['currencySymbol'] ? data['dataMap']['currencySymbol'] : '') + row['x'],
                                'value': row['x'],
                                'fill': getLegendColor(row, chartRows, 'y')
                            });
                        });
                        newLegendContainer = am4core.create('pie-second-legendDivLine', am4core.Container);
                        newLegendContainer.width = am4core.percent(100);
                        newLegend = new am4charts.Legend();
                        newLegend.parent = newLegendContainer;
                        newLegend.itemContainers.template.togglable = false;
                        newLegend.marginTop = 20;
                        newLegend.data = legendsData;
                        newLegend.labels.template.maxWidth = 300;
                        newLegend.labels.template.truncate = false;
                        newLegend.labels.template.wrap = true;
                        newLegend.useDefaultMarker = true;
                        let newMarkerTemplate = newLegend.markers.template;
                        newMarkerTemplate.width = 15;
                        newMarkerTemplate.height = 15;
                        newLegend.fontSize = '12';
                        let newMarker = newLegend.markers.template.children.getIndex(0);
                        newMarker.cornerRadius(12, 12, 12, 12);
                        newMarker.radius = 6;
                        newMarker.stroke = am4core.color('#ccc');

                        setTimeout(() => {z
                            document.getElementById('pie-second-legendDivLine').style.height = newLegend.contentHeight + 'px' ;
                        }, 10);
                        
                     
                        console.log('legendsdata', newLegend.data)
                    }
                    
                    let htmlForTable = '<table>';
                    htmlForTable += '<thead><tr>';
                    let keys = [];
                    if (data['dataMap']['tableKeys'] && data['dataMap']['tableKeys'].length !== 0) {
                        keys =  data['dataMap']['tableKeys'];
                    } else {
                        keys = Object.keys(data['dataMap']['table'][0]);
                    }
                    // if (showGraph) {
                    //     htmlForTable += '<th>' + 'Legends' + '</th>';
                    // }      
                    keys.forEach(key => {
                        htmlForTable += '<th>' + key + '</th>';
                    });
                    htmlForTable += '</tr></thead>';
                    htmlForTable += '<tbody>'
                    for (let i = 0, length = data['dataMap']['table'].length; i < length; ++i) {
                        htmlForTable += '<tr>';         
                        // if (showGraph) {
                        //     // Lengend color
                        //     htmlForTable += \`<td class="legendTd">
                        //     <div class="key-\$\{i\}">
                        //     </div>
                        //     </td>\`;

                        //     setTimeout(() => {
                        //         $('.key-' + i).css('background-color', getLegendColor(data['dataMap']['table'][i], chartRows, data['dataMap']['pie']['y'][0]));

                        //         if (i === 0) {
                        //             document.getElementById('pie-second-legendDivLine').style.height = newLegend.contentHeight ;
                        //         }
                        //     }, 10);
                        // }
                        keys.forEach(key => {
                            htmlForTable += '<td>' + data['dataMap']['table'][i][key] + '</td>';
                        });
                        htmlForTable += '</tr>';
                    }
                    htmlForTable += '</tbody>';
                    htmlForTable += '</table>';
                    $('#' + data['cloud'] + data['module'] + data['page'] + data['insight'] + 'table').html(htmlForTable);

                }, 3000);
            })();

            let getLegendColor = (cellItem, rowsData, categoryAxis) => {
                let color = '#ffffff';
                rowsData.forEach(
                    rowData => {
                        if (rowData['_dataItem']['_dataContext']['y'] === cellItem[categoryAxis]) {
                            color = rowData['_dataItem']['legendDataItem']['colorOrig']['hex'];
                        }

                    }
                );
                return color;
            }
            
        `;
    }
};

module.exports = piePortlet;