require('dotenv').config();
const axios = require('axios');
const config = require('./config');
const { appendWorkoutToSheet } = require('./sheet_uploader');

async function syncAllWorkouts() {
    console.log('🚀 Starting Full Synchronization...');

    if (!config.HEVY_API_KEY) {
        console.error('❌ HEVY_API_KEY is missing in .env');
        return;
    }

    try {
        // 1. Get total count
        console.log('Fetching total workout count...');
        const countRes = await axios.get('https://api.hevyapp.com/v1/workouts/count', {
            headers: { 'api-key': config.HEVY_API_KEY }
        });
        const totalWorkouts = countRes.data.workout_count;
        console.log(`Found ${totalWorkouts} workouts in Hevy.`);

        if (totalWorkouts === 0) {
            console.log('No workouts found. Nothing to sync.');
            return;
        }

        // 2. Fetch all workouts page by page
        let page = 1;
        const pageSize = 10;
        let allWorkouts = [];

        while (allWorkouts.length < totalWorkouts) {
            console.log(`Fetching page ${page}...`);
            const workoutRes = await axios.get('https://api.hevyapp.com/v1/workouts', {
                headers: { 'api-key': config.HEVY_API_KEY },
                params: { page, pageSize }
            });

            const workouts = workoutRes.data.workouts;
            if (!workouts || workouts.length === 0) break;

            allWorkouts = allWorkouts.concat(workouts);
            page++;
        }

        // 3. Reverse to get oldest first (chronological)
        console.log('Sorting workouts chronologically...');
        allWorkouts.reverse();

        // 4. Flatten and append in one batch
        console.log('Processing data for Sheet upload...');
        for (const workout of allWorkouts) {
            await appendWorkoutToSheet(workout);
            console.log(`Synced: ${workout.title} (${new Date(workout.start_time).toLocaleDateString()})`);
        }

        console.log(`✅ Successfully synced ${allWorkouts.length} workouts!`);

    } catch (error) {
        console.error('❌ Sync failed:', error.response?.data || error.message);
        if (config.DEBUG) console.error(error);
    }
}

syncAllWorkouts();
