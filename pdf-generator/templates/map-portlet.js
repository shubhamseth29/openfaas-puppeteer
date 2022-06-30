const mapPortlet = {
  html: `
            <div class="map-header">
                <h1 class="map-title"></h1>
            </div>
            <div class="map-header-bottom"></div>
            <div class="description-container">
                <span class="description-label">Description</span>
                <span class="description-content">
                </span>
            </div>
            <div class="map-container">
                <div class="map-chartdiv">
                </div>
            </div>
            <div class="map-table-container">
                <label class="map-table-heading-container">
                    <span class="map-table-heading">Regional Cost Distribution</span>            
                </label>
                <div class="map-output-table" id="map-first-table"></div>
            </div>
            <div id="pdf-other-tables">
            </div>
            <div class="extra-message">
                No Data Available
            </div>
    `,
  styles: `
            .map-header {
                display: flex;
                flex-direction: column;
                width: 100%;
                margin: 0;
                padding: 0 50px 0;
                box-sizing: border-box;
            }
            .map-title {
                font-weight: 500;
                font-size: 30px;
                margin: 0;
                padding-left: 5px;
                //text-align: center;
            }
            .map-header-bottom {
                width: 100%;
                height: 5px;
                margin-left: 50px;
                background: #263550;
            }
            .map-container {
                height: 550px;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                page-break-after: always;
            }

            .map-chartdiv {
                width: 800px;
                height: 550px;
            }

            .map-table-container {
                margin: 30px 50px 0 50px;
            }

            .map-table-heading-container {
                font-size: 18px;
                break-inside: avoid;
                page-break-inside: avoid;
            }

            .map-table-heading {
                font-weight: bold;
            }

            .map-output-table {
                margin-top: 5px;
            }

            #pdf-other-tables {
                page-break-after: always;
            }

    `,
  scriptsToImport: [],
  script: (data) => {
    return `
            let updateMarkers = (event) => {
                const map = event.target;
                if (
                event.target.series.values[1] &&
                event.target.series.values[1].mapImages
                ) {
                event.target.series.values[1].mapImages.each((image, index) => {
                    if (!image.dummyData || !image.dummyData.externalElement) {
                    image.dummyData = {
                        externalElement: createMarker(image, index),
                    };
                    }
                    let xy = map.geoPointToSVG({
                    longitude: image.longitude,
                    latitude: image.latitude,
                    });
                    image.dummyData.externalElement.moveTo({ x: xy.x, y: xy.y });
                });
                }
            }

            let createMarker = (image, index) => {
                let worldMap = image.dataItem.component.chart;
                const color = image.dataItem.dataContext["color"];
                const markerContainer = worldMap.createChild(am4core.Container);
                const markerOuter = markerContainer.createChild(am4core.Circle);
                const markerDot = markerContainer.createChild(am4core.Circle);
                markerDot.fill = am4core.color(color);
                markerOuter.stroke = am4core.color(color);
                markerOuter.fill = am4core.color("white");
                markerOuter.fillOpacity = 0;
                markerContainer.element.attr({
                id: "map-marker" + index,
                });
                switch (index) {
                case 0:
                    markerDot.radius = 9;
                    markerOuter.radius = 15.5;
                    markerOuter.strokeWidth = 4.5;
                    break;
                case 1:
                    markerDot.radius = 8;
                    markerOuter.radius = 14;
                    markerOuter.strokeWidth = 4;
                    break;
                case 2:
                    markerDot.radius = 7;
                    markerOuter.radius = 12.5;
                    markerOuter.strokeWidth = 3.5;
                    break;
                case 3:
                    markerDot.radius = 6;
                    markerOuter.radius = 11;
                    markerOuter.strokeWidth = 3;
                    break;
                case 4:
                    markerDot.radius = 5;
                    markerOuter.radius = 9;
                    markerOuter.strokeWidth = 2.5;
                    break;
                default:
                    markerDot.radius = 3;
                    markerOuter.radius = 6;
                    markerOuter.strokeWidth = 2;
                    break;
                }
                return markerContainer;
            }

            (async () => {
                const data = ${JSON.stringify(data)};

                if (data['checkDescription'] && data['checkDescription']['description']) {
                    $('.description-container').css({'display': 'block'});
                    $('.description-content').html(data['checkDescription']['description']);
                    $('.map-container').css({'margin-top': '0'});
                    $('.extra-message').css({'margin-top': '20px'});
                }

                $('.map-chartdiv').attr('id',data['cloud'] + data['module'] + data['page'] + data['insight']);
                $('.map-title').attr('id',data['cloud'] + data['module'] + data['page'] + data['insight'] + 'insightText');   
                $('.map-table-container').attr('id',data['cloud'] + data['module'] + data['page'] + data['insight'] + 'table');   
                
                $('#' + data['cloud'] + data['module'] + data['page'] + data['insight'] + 'insightText').html(data['insightText']);             
                
                if (Object.keys(data['dataMap']).length === 0) {
                    $('.extra-message').css({'display': 'block'});
                    $('.map-container').css({'display': 'none'});
                    $('.map-table-container').css({'display': 'none'});
                    $('#pdf-other-tables').css({'display': 'none'});
                    return;
                } else {
                    let map = am4core.create(
                        data["cloud"] + data["module"] + data["page"] + data["insight"],
                        am4maps.MapChart
                    );
                    map.geodata = am4geodata_worldLow;
                    map.projection = new am4maps.projections.Miller();
                    map.chartContainer.wheelable = false;
                    map.seriesContainer.draggable = false;
                    map.seriesContainer.resizable = false;
                    map.maxZoomLevel = 1;
        
                    let polygonSeries = map.series.push(new am4maps.MapPolygonSeries());
                    polygonSeries.exclude = ["AQ"];
                    polygonSeries.useGeodata = true;
        
                    let polygonTemplate = polygonSeries.mapPolygons.template;
                    polygonTemplate.fill = am4core.color("#a1dcd3");
                    polygonTemplate.strokeWidth = 0;
        
                    let imageSeries = map.series.push(new am4maps.MapImageSeries());
                    imageSeries.mapImages.template.propertyFields.longitude = "longitude";
                    imageSeries.mapImages.template.propertyFields.latitude = "latitude";
        
                    imageSeries.data = data["dataMap"]["output"];
        
                    map.events.on("ready", updateMarkers.bind(this));            

                    // first table
                    let htmlForTable = '<table>';
                        htmlForTable += '<thead><tr>';

                        let keys = ['Legends' ,'Region'];
                        if (data['dataMap']['currencySymbol']) {
                            keys.push('Cost('+ data['dataMap']['currencySymbol'] + ')');
                        } else {
                            keys.push('Usage');
                        }
                        keys.forEach(key => {
                            htmlForTable += '<th>' + key + '</th>';
                        });
                        htmlForTable += '</tr></thead>';
                        //htmlForTable += '<tbody>'
                        
                        for (let i = 0, length = data['dataMap']['output'].length; i < length; ++i) {                     
                            htmlForTable += '<tbody><tr>';
                            htmlForTable += '<td><div id="legend-marker-' + i +  '"></div></td>';
                            setTimeout(() => {
                                switch (i) {
                                    case 0: $('#' + 'legend-marker-' + i).css({ background : data['dataMap']['output'][i]['color'], width: '25px', height: '25px', minWidth: '25px', borderRadius: '50%' }); break;
                                    case 1: $('#' + 'legend-marker-' + i).css({ background : data['dataMap']['output'][i]['color'], width: '23px', height: '23px', minWidth: '23px', borderRadius: '50%'}); break;
                                    case 2: $('#' + 'legend-marker-' + i).css({ background : data['dataMap']['output'][i]['color'], width: '21px', height: '21px', minWidth: '21px', borderRadius: '50%'}); break;
                                    case 3: $('#' + 'legend-marker-' + i).css({ background : data['dataMap']['output'][i]['color'], width: '19px', height: '19px', minWidth: '19px', borderRadius: '50%'}); break;
                                    case 4: $('#' + 'legend-marker-' + i).css({ background : data['dataMap']['output'][i]['color'], width: '17px', height: '17px', minWidth: '17px', borderRadius: '50%'}); break;
                                    default: $('#' + 'legend-marker-' + i).css({ background : data['dataMap']['output'][i]['color'], width: '15px', height: '15px', minWidth: '15px', borderRadius: '50%'}); break;
                                }
                            }, 10);

                            ['region', 'regionCost'].forEach(key => {
                                if (key in data['dataMap']['output'][i]) {
                                    htmlForTable += '<td>' + data['dataMap']['output'][i][key] + '</td>';
                                }        
                            });
                            htmlForTable += '</tr></tbody>';         
                        }
                        //htmlForTable += '';
                        htmlForTable += '</table>';
                        $('#map-first-table').html(htmlForTable);

                    // other tables
                        let htmlForOtherTables = '';                     
                        data['dataMap']['pdfTableName'].forEach((key, index) => {
                            htmlForOtherTables += '<div class="map-table-container">';
                            htmlForOtherTables += '<label class="map-table-heading-container">';
                            htmlForOtherTables += '<span class="map-table-heading">Region: </span>' + key; 
                            htmlForOtherTables += '</label>';
                            htmlForOtherTables += '<div class="map-output-table"><table>'; 
                            htmlForOtherTables += '<thead><tr>';
                                data['dataMap']['pdfColumnSequence'].forEach(key => {
                                    htmlForOtherTables += '<th>' + key + '</th>';
                                }); 
                            htmlForOtherTables += '</tr></thead>';
                            //htmlForOtherTables += '<tbody>';
                            data['dataMap']['pdfTable'][key].forEach((rows) => {
                                htmlForOtherTables += '<tbody><tr>';
                                data['dataMap']['pdfColumnSequence'].forEach((tableKey) => {
                                    htmlForOtherTables += '<td>' + rows[tableKey] + '</td>';
                                });
                                htmlForOtherTables += '</tr></tbody>';
                            });
                            //htmlForOtherTables += '</tbody>';
                            htmlForOtherTables += '</table></div></div>';
                        });
                        $('#pdf-other-tables').html(htmlForOtherTables);
                }    

            
            })();
            
        `;
  },
};

module.exports = mapPortlet;
