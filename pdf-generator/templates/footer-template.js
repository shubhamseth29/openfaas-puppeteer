const index = require('../index');
const pageNumber = 1;
const footerTemplate = `
                <style>#footer { padding: 0 !important; }</style>
                <div style=' width:100%; -webkit-print-color-adjust: exact;height:40px;clear: both; display: flex; flex-direction: column;'>
                    <span style="color: black; flex: 1; background: white; text-align: center; font-size: 10px">`+
                    pageNumber + 
                    `</span> 
                    <span style="color: white; flex: 1; background: #263550;vertical-align: middle; font-size: 10px; display: flex; align-items: center;padding-left: 20px">&copy; 2019 Centilytics. All Rights Reserved.</span>
                </div>
                `;

module.exports = footerTemplate;