const express = require('express');
const axios = require('axios');
const { appendWorkoutToSheet } = require('./sheet_uploader');
const config = require('./config');

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
    try {
        const { payload } = req.body;

        if (!payload || !payload.workoutId) {
            console.warn('Received invalid webhook payload:', req.body);
            return res.status(400).send('Invalid payload: workoutId missing');
        }

        const { workoutId } = payload;
        console.log(`Received webhook for workoutId: ${workoutId}`);

        // Fetch full workout data from Hevy
        // Using v1 as per docs: https://api.hevyapp.com/v1/workouts/{id}
        try {
            const response = await axios.get(`https://api.hevyapp.com/v1/workouts/${workoutId}`, {
                headers: {
                    'api-key': config.HEVY_API_KEY
                }
            });

            const workoutData = response.data;
            console.log(`Fetched workout: ${workoutData.title}`);

            // Append to Google Sheet
            await appendWorkoutToSheet(workoutData);

        } catch (apiError) {
            console.error('Error fetching from Hevy or uploading to Sheets:', apiError.message);
            // We still return 200 to Hevy as per their requirement to respond within 5s,
            // but we log the error. In a production app, you might want a queue/retry.
        }

        res.status(200).send('Webhook received and processed');
    } catch (error) {
        console.error('Error in webhook handler:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});
