require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    SHEET_ID: process.env.SHEET_ID,
    SHEET_NAME: process.env.SHEET_NAME || 'Sheet1',
    HEVY_API_KEY: process.env.HEVY_API_KEY,
    DEBUG: process.env.DEBUG === 'true',
};
