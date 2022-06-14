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
                height: 450px;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                page-break-after: always;
            }

            .map-chartdiv {
                width: 700px;
                height: 450px;
            }	

            .blob {
                border-radius: 50%;
                border: 2px solid rgba(255, 121, 63, 1);
                height: 16px;
                width: 16px;
                display: flex; 	
                justify-content: center;
                align-items: center;
            }

            .inside-blob {
                background: rgba(255, 121, 63, 1);
                border-radius: 50%;
                height: 6px;
                width: 6px;
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
    scriptsToImport: [
    ],
    script: (data) => {
        return `
            // this function will take current images on the map and create HTML elements for them
            let updateCustomMarkers = (event) => {
                // get map object
                const map = event.chart;
                let index = 0;
                // go through all of the images
                for (const x in map.dataProvider.images) {
                // get MapImage object
                const image = map.dataProvider.images[x];

                // check if it has corresponding HTML element
                if ('undefined' == typeof image.externalElement) {
                    image.externalElement = createMapV1CustomMarker(image, index);
                }

                // reposition the element accoridng to coordinates
                const xy = map.coordinatesToStageXY(image.longitude, image.latitude);
                image.externalElement.style.top = xy.y + 'px';
                image.externalElement.style.left = xy.x + 'px';
                index++;
                }
            }

            let createMapV1CustomMarker = (image, index) => {
                // create holder
                const holder = document.createElement('div');
                holder.className = 'blob';
                holder.title = image.title;
                holder.style.position = 'absolute';
                $(holder).css({     
                    marginTop: '-8px',
                    marginLeft: '-8px'
                });

                // maybe add a link to it?
                if (undefined != image.url) {
                    holder.onclick = function () {
                        window.location.href = image.url;
                    };
                    holder.className += ' map-clickable';
                }

                // create dot
                const dot = document.createElement('div');
                dot.className = 'inside-blob';
                holder.appendChild(dot);
                $(holder).attr('id','map-marker' + index);
                switch (index) {
                    case 0: markerStyling(dot, '18px', image.color);
                        markerBorderStyling(holder, '38px', '5px', image.color, '-22px', '-22px');
                        $(holder).addClass('first-map-marker-view');
                        break;
                    case 1: markerStyling(dot, '16px', image.color);
                        markerBorderStyling(holder, '34px', '4.5px', image.color, '-15px', '-15px');
                        break;
                    case 2: markerStyling(dot, '14px', image.color);
                        markerBorderStyling(holder, '30px', '4px', image.color, '-14px', '-14px');
                        break;
                    case 3: markerStyling(dot, '12px', image.color);
                        markerBorderStyling(holder, '26px', '3.5px', image.color, '-13px', '-13px');
                        break;
                    case 4: markerStyling(dot, '10px', image.color);
                        markerBorderStyling(holder, '22px', '3px', image.color, '-12px', '-12px');
                        break;
                    default: markerStyling(dot, '6px', image.color);
                        markerBorderStyling(holder, '16px', '2px', image.color, '-8px', '-8px');
                        break;

                }

                // append the marker to the map container
                image.chart.chartDiv.appendChild(holder);
                return holder;
            }

            let markerBorderStyling = (element, size, border, color, marginTop, marginLeft) => {
                $(element).css({
                    'width': size,
                    'height': size,
                    'border': border + ' solid ' + color,
                    'marginTop': marginTop,
                    'marginLeft': marginLeft
                });
            }


            let markerStyling = (element, size, color) => {
                $(element).css({
                    width: size,
                    height: size,
                    background: color
                });
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
                    let map = AmCharts.makeChart(data['cloud'] + data['module'] + data['page'] + data['insight'], {
                        type: 'map',
                        hideCredits: true,
                        projection: 'winkel3',
                        theme: 'light',
                        "zoomControl": {
                            "homeButtonEnabled": false,
                            "zoomControlEnabled": false,
                            "panControlEnabled": false,
                        },
                        imagesSettings: {
                        rollOverColor: '#089282',
                        rollOverScale: 3,
                        selectedScale: 3,
                        selectedColor: '#089282',
                        color: '#13564e'
                        },
                
                        areasSettings: {
                        unlistedAreasColor: '#15A892',
                        outlineThickness: 0.1
                        },
                
                        dataProvider: {
                        map: 'worldLow',
                        images: data['dataMap']['output']
                        },
                        export: {
                        enabled: true
                        }
                    });

                    map.addListener('rendered', (event) => {
                        updateCustomMarkers(event);
                    });
                
                    map.validateNow();

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
    }
};

module.exports = mapPortlet;