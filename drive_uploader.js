const { google } = require('googleapis');
const { Readable } = require('stream');
const config = require('./config');

// Initialize auth - this will look for GOOGLE_APPLICATION_CREDENTIALS env var
// or prompt if not found/configured, but for server usage we expect the env var.
const authOptions = {};
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    // Use JSON string from environment variable (Best for Vercel/Cloud)
    authOptions.credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} else {
    // Fallback to file-based credentials
    authOptions.keyFile = config.GOOGLE_APPLICATION_CREDENTIALS;
}

const auth = new google.auth.GoogleAuth({
    ...authOptions,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Uploads a workout JSON object to Google Drive.
 * @param {Object} workoutData The workout data from the webhook.
 * @returns {Promise<string>} The ID of the uploaded file.
 */
async function uploadWorkout(workoutData) {
    // Use the workout title or date in the filename if available
    const title = workoutData.title || 'Workout';
    const date = workoutData.start_time ? new Date(workoutData.start_time).toISOString() : new Date().toISOString();
    // Sanitize filename
    const safeTitle = title.replace(/[^a-z0-9]/yi, '_');
    const fileName = `${safeTitle}_${date}.json`;

    const fileContent = JSON.stringify(workoutData, null, 2);

    try {
        console.log(`Attempting to upload: ${fileName}`);

        const fileMetadata = {
            name: fileName,
            parents: config.DRIVE_FOLDER_ID ? [config.DRIVE_FOLDER_ID] : [], // Use root if no folder ID provided
        };

        const media = {
            mimeType: 'application/json',
            body: Readable.from([fileContent]),
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        console.log('File uploaded successfully. File Id:', response.data.id);
        return response.data.id;
    } catch (error) {
        console.error('Error uploading to Drive:', error);
        throw error;
    }
}

module.exports = { uploadWorkout };
