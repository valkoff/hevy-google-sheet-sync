const { appendWorkoutToSheet } = require('./sheet_uploader');

const mockWorkout = {
    title: 'Test Workout from Fit-Sink',
    start_time: new Date().toISOString(),
    description: 'This is a test to verify the Google Sheets upload works!',
    exercises: [
        {
            title: 'Squat',
            sets: [
                { reps: 10, weight_kg: 100 },
                { reps: 10, weight_kg: 105 }
            ]
        },
        {
            title: 'Bench Press',
            sets: [
                { reps: 8, weight_kg: 80 }
            ]
        }
    ]
};

console.log('Starting direct Google Sheets test...');
appendWorkoutToSheet(mockWorkout)
    .then(() => console.log('✅ Success! Check your Google Sheet.'))
    .catch(err => {
        console.error('❌ Failed!');
        console.error(err);
    });
