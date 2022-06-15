const getTimeOutForPortletType = (portletType, insightData) => {
    const defaultTimeout = 3000;
    if (portletType === 'timeseriesv2') {
        if (insightData['dataMap'] && insightData['dataMap']) {
            if (
                insightData['dataMap'][
                    insightData['dataMap']['graphKeyToBeUsed']
                ].length > 64 ||
                insightData['dataMap']['keys'].length > 70
            ) {
                return defaultTimeout;
            }
            if (
                insightData['dataMap'][
                    insightData['dataMap']['graphKeyToBeUsed']
                ].length > 35 ||
                insightData['dataMap']['keys'].length > 40
            ) {
                return 11000;
            }
        }
        return 6000;
    } else {
        return defaultTimeout;
    }
};

module.exports = getTimeOutForPortletType;
