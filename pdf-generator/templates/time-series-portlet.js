const timeSeriesPortlet = {
    html: ` 
            <div class="time-series-pdf-header">
                <h1 class="time-series-title"></h1>
            </div>
            <div class="time-series-header-bottom"></div>
            <div class="description-container">
                <span class="description-label">Description</span>
                <span class="description-content">
                </span>
            </div>   
            <div class="time-series-container">
                <div class="time-series-content">
                    <div class="time-series-chart-div" id="time-series-chartdiv">
                    </div>
                    <div class="time-series-legendwrapper">
                        <div id="time-series-legenddiv" class="time-series-legendDivLine"></div>
                    </div>
                </div>
            </div>
            <div class="time-series-container">
                <div class="time-series-content">
                    <div class="stacked-bar-chart-div" id="stacked-bar-chartdiv">
                    </div>
                    <div class="time-series-legendwrapper">
                        <div id="stackedBar-legenddiv" class="stackedBar-legendDivLine"></div>
                    </div>
                </div>
            </div>
            <div class="time-series-table-container">
            </div>
            <div class="extra-message">
                No Data Available
            </div>

    `,
    styles: `
            @page {
            }
            .insight-pdf-content {
                display: flex;
                flex-direction: column;
            }
            .time-series-pdf-header {
                display: flex;
                flex-direction: column;
                width: 100%;
                margin: 0;
                padding: 0 50px 0;
                box-sizing: border-box;
            }
            .time-series-title {
                font-weight: 500;
                font-size: 30px;
                margin: 0;
                padding-left: 5px;
            }
            .time-series-header-bottom {
                width: 100%;
                height: 5px;
                margin-left: 50px;
                background: #263550;
            }
            .time-series-container {
                margin: 0 auto;
                margin-top: 50px;
                break-after: always;
                page-break-after: always;
            }
            .time-series-content {
                width: 9.9in;
                margin: 0 auto;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            .date-range {
                color: #263550;
                font-size: 20px;
                width: 100%;
                font-weight: 550;
                text-align: center;
                margin-top: 20px;
            }
            .time-series-chart-div {
                width: 80%;
                height: 400px;
                padding-top: 20px;
                margin: 0 auto;
            }
            .stacked-bar-chart-div{
              width: 80%;
              height: 400px;
              padding-top: 20px;
              margin: 0 auto;
            }
            .time-series-legendDivLine {
                width: 80%;
            }
            .stackedBar-legendDivLine{
                width: 80%
            }
            .time-series-legendwrapper {
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 20px;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .time-series-table-container {
                margin: 20px 50px 0 50px;
                page-break-after: always;
            }

    `,
    script: (data, timeout) => {
        return `
            (async () => {
                let showGraph;
                let lineChart;
                let stackChart;
                let categoryAxis;
                let valueAxis;
                let seriesList;
                let series;
                let bullet;
                let data = ${JSON.stringify(data)};

                if (data['checkDescription'] && data['checkDescription']['description']) {
                    $('.description-container').css({display: 'block'});
                    $('.description-content').html(data['checkDescription']['description']);
                    $('.time-series-container').css({'margin-top': '0'});
                    $('.extra-message').css({'margin-top': '20px'});
                }
                const dateRange = '(' + data['startDate'] + ' - ' + data['endDate'] + ')';
                $('.time-series-title').attr('id', data['cloud'] + data['module'] + data['page'] + data['insight'] + 'insightText');
                $('.time-series-chart-div').attr('id', data['cloud'] + data['module'] + data['page'] + data['insight']);
                $('.stacked-bar-chart-div').attr('id', data['cloud'] + data['module'] + data['page'] + data['insight'] + 'stackedbarchart');
                $('.time-series-table-container').attr('id', data['cloud'] + data['module'] + data['page'] + data['insight'] + 'table');
                $('.time-series-legendDivLine').attr('id', data['cloud'] + data['module'] + data['page'] + data['insight'] + 'legenddiv');
                $('.stackedBar-legendDivLine').attr('id', data['cloud'] + data['module'] + data['page'] + data['insight'] + 'stackedbarlegenddiv');


                const calcHeight = (chart) => {
                    let chartLegendHeight = chart.legend.contentHeight;
                    if (chartLegendHeight >= 680 && chartLegendHeight <= 750) {
                        if (chartLegendHeight > 734) {
                            chartLegendHeight = 734;
                        }
                    } else {
                        chartLegendHeight += 40;
                    }
                    return chartLegendHeight;
                };

                // am4core.useTheme(am4themes_dark);
                // am4core.useTheme(am4themes_animated);
                let createGraph = (graphType) => {
                    // Create chart instance
                    let chart = null;
                    if (graphType === 'lineSeries') {
                        chart = am4core.create(data['cloud'] + data['module'] + data['page'] + data['insight'], am4charts.XYChart);
                    } else if (graphType === 'stackedBar') {
                        chart = am4core.create(data['cloud'] + data['module'] + data['page'] + data['insight'] + 'stackedbarchart', am4charts.XYChart);
                    }

                    chart.data = data['dataMap'][data['dataMap']['graphKeyToBeUsed']];
                    chart.dateFormatter.dateFormat = 'JJ:NN, DD MMMM';
                    chart.hideCredits = true;
                    chart.paddingRight = 40;
                    chart.marginTop = 7;

                    // Create axes
                    categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
                    categoryAxis.dataFields.category = 'Date';
                    categoryAxis.title.text = 'Date ' + dateRange;
                    categoryAxis.title.fontSize = 13;
                    categoryAxis.title.fontWeight = 'bold';
                    categoryAxis.renderer.minGridDistance = 30;
                    categoryAxis.renderer.grid.template.location = 0.5;

                    // Setting up label rotation
                    categoryAxis.renderer.labels.template.rotation = 90;
                    categoryAxis.renderer.labels.template.horizontalCenter = 'left';
                    categoryAxis.renderer.labels.template.verticalCenter = 'middle';
                    categoryAxis.renderer.labels.template.fontSize = 10;

                    valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
                    valueAxis.title.text = data['dataMap']['graphKeyToBeUsed'];
                    valueAxis.title.fontSize = 13;
                    valueAxis.title.fontWeight = 'bold';
                    valueAxis.renderer.labels.template.fontSize = 13;

                    if (graphType === 'stackedBar') {
                        data['dataMap']['keys'] = data['dataMap']['keys'].filter((item) => {
                            return item !== 'Total';
                        });
                    }

                    seriesList = [];
                    data['dataMap']['keys'].forEach((val, index) => {
                        if (graphType === 'lineSeries') {
                            series = chart.series.push(new am4charts.LineSeries());
                        }

                        if (graphType === 'stackedBar') {
                            series = chart.series.push(new am4charts.ColumnSeries());
                        }
                        series.dataFields.valueY = val;
                        series.dataFields.categoryX = 'Date';
                        series.name = val;
                        series.tooltip.getFillFromObject = false;
                        series.tooltip.getStrokeFromObject = true;
                        series.tooltip.background.fill = am4core.color('white');
                        series.tooltip.autoTextColor = false;
                        series.tooltip.label.fill = am4core.color('black');
                        series.tooltip.label.fontSize = 11;
                        if (graphType === 'stackedBar') {
                            series.stacked = true;
                            series.columns.template.tooltipText = '{name}:[b]{valueY}';
                        }
                        if (graphType === 'lineSeries') {
                            series.strokeWidth = 1.5;
                            bullet = series.bullets.push(new am4charts.CircleBullet());
                            bullet.circle.stroke = am4core.color('#fff');
                            bullet.circle.strokeWidth = 1;
                            bullet.circle.radius = 3;
                            series.bullets.getIndex(0).tooltipText = '{name}:[b]{valueY}';
                        }
                        series.legendSettings.itemValueText = '{valueY}';
                        seriesList.push(series);
                    });
                    chart.legend = new am4charts.Legend();
                    if (graphType === 'stackedBar') {
                        legendContainer = am4core.create(data['cloud'] + data['module'] + data['page'] + data['insight'] + 'stackedbarlegenddiv', am4core.Container);
                    } else if (graphType === 'lineSeries') {
                        legendContainer = am4core.create(data['cloud'] + data['module'] + data['page'] + data['insight'] + 'legenddiv', am4core.Container);
                    }
                    legendContainer.width = am4core.percent(100);
                    //legendContainer.height = am4core.percent(100);
                    chart.legend.parent = legendContainer;
                    chart.legend.labels.template.maxWidth = 150;
                    chart.legend.labels.template.truncate = false;
                    chart.legend.labels.template.wrap = true;

                    chart.events.on('datavalidated', resizeLegend);
                    chart.events.on('maxsizechanged', resizeLegend);
                    function resizeLegend(ev) {
                        setTimeout(() => {
                            if (graphType === 'stackedBar') {
                                document.getElementById(data['cloud'] + data['module'] + data['page'] + data['insight'] + 'stackedbarlegenddiv').style.height = calcHeight(chart) + 'px';
                            } else {
                                document.getElementById(data['cloud'] + data['module'] + data['page'] + data['insight'] + 'legenddiv').style.height = calcHeight(chart) + 'px';
                            }
                        }, 10);
                    }

                    chart.legend.useDefaultMarker = true;
                    markerTemplate = chart.legend.markers.template;
                    markerTemplate.width = 15;
                    markerTemplate.height = 15;
                    chart.legend.fontSize = '11';
                    marker = chart.legend.markers.template.children.getIndex(0);
                    marker.cornerRadius(12, 12, 12, 12);
                    marker.radius = 5.5;
                    marker.stroke = am4core.color('#ccc');
                    return chart;
                };

                $('#' + data['cloud'] + data['module'] + data['page'] + data['insight'] + 'insightText').html(data['insightText']);

                if (Object.keys(data['dataMap']).length === 0) {
                    $('.extra-message').css({display: 'block'});
                    $('.time-series-container').css({display: 'none'});
                    $('.time-series-table-container').css({display: 'none'});
                    return;
                } else if (data['dataMap'][data['dataMap']['graphKeyToBeUsed']].length > 64 || data['dataMap']['keys'].length > 70) {
                    $('.time-series-container').css({display: 'none'});
                    showGraph = false;
                } else {
                    showGraph = true;
                    lineChart = createGraph('lineSeries');
                    stackChart = createGraph('stackedBar');
                }
                setTimeout(() => {
                    if (showGraph) {
                        if (stackChart) {
                            document.getElementById(data['cloud'] + data['module'] + data['page'] + data['insight'] + 'stackedbarlegenddiv').style.height = calcHeight(stackChart) + 'px';
                        }
                        if (lineChart) {
                            document.getElementById(data['cloud'] + data['module'] + data['page'] + data['insight'] + 'legenddiv').style.height = calcHeight(lineChart) + 'px';
                        }
                    }

                    let htmlForTable = '<table>';
                    htmlForTable += '<thead><tr>';
                    data['dataMap']['tableKeys'].forEach((key) => {
                        htmlForTable += '<th>' + key + '</th>';
                    });
                    htmlForTable += '</tr></thead>';
                    htmlForTable += '<tbody>';
                    for (let i = 0, length = data['dataMap']['table'].length; i < length; ++i) {
                        htmlForTable += '<tr>';
                        data['dataMap']['tableKeys'].forEach((key) => {
                            if (key in data['dataMap']['table'][i]) {
                                htmlForTable += '<td>' + data['dataMap']['table'][i][key] + '</td>';
                            } else {
                                htmlForTable += '<td>' + '-' + '</td>';
                            }
                        });
                        htmlForTable += '</tr>';
                    }
                    htmlForTable += '</tbody>';
                    htmlForTable += '</table>';
                    $('#' + data['cloud'] + data['module'] + data['page'] + data['insight'] + 'table').html(htmlForTable);
                }, ${timeout - 1000});
              })();
        `;
    },
};

module.exports = timeSeriesPortlet;
