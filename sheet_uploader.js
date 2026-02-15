const { google } = require('googleapis');
const config = require('./config');

const authOptions = {};
if (config.DEBUG) console.log('Checking credentials...');
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    if (config.DEBUG) console.log('Using GOOGLE_SERVICE_ACCOUNT_JSON from env');
    authOptions.credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} else {
    if (config.DEBUG) console.log('Using keyFile:', config.GOOGLE_APPLICATION_CREDENTIALS);
    authOptions.keyFile = config.GOOGLE_APPLICATION_CREDENTIALS;
}

const auth = new google.auth.GoogleAuth({
    ...authOptions,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Appends workout data to a Google Sheet.
 * Flattens the workout into rows: one row per set.
 * @param {Object} workout The full workout object from Hevy API.
 */
async function appendWorkoutToSheet(workout) {
    const spreadsheetId = config.SHEET_ID;
    if (!spreadsheetId) {
        throw new Error('SHEET_ID is not configured');
    }

    const rows = [];
    const date = new Date(workout.start_time).toLocaleDateString();
    const startTime = new Date(workout.start_time).toLocaleTimeString();
    const endTime = workout.end_time ? new Date(workout.end_time).toLocaleTimeString() : '';
    const title = workout.title || 'Workout';
    const description = workout.description || '';

    workout.exercises.forEach(exercise => {
        exercise.sets.forEach((set, index) => {
            rows.push([
                date,
                title,
                startTime,
                endTime,
                description,
                exercise.title,
                index + 1, // Set number
                set.type || 'normal',
                set.weight_kg || 0,
                set.reps || 0,
                set.distance_meters || 0,
                set.duration_seconds || 0,
                set.rpe || '',
                set.custom_metric || 0
            ]);
        });
    });

    if (config.DEBUG) {
        console.log('Sheet ID:', spreadsheetId);
        console.log('Rows to append:', JSON.stringify(rows, null, 2));
    }

    try {
        console.log(`Appending ${rows.length} rows to sheet...`);
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${config.SHEET_NAME}!A:N`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: rows,
            },
        });
        console.log('Data successfully appended to Google Sheet.');
    } catch (error) {
        console.error('Error appending to Sheets:', error.message);
        throw error;
    }
}

module.exports = { appendWorkoutToSheet };
