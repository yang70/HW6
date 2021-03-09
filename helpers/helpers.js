// Workout serializer
exports.serializeWorkout =  workout => {
    if(workout.lbs) workout.lbs = !!workout.lbs;
    if(workout.date) workout.date = workout.date.toISOString().split("T")[0];
    return workout;
};