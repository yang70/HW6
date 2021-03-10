// Workout serializer
exports.serializeWorkout =  workout => {
    workout.lbs = !!workout.lbs;
    workout.date = workout.date.toISOString().split("T")[0];
    return workout;
};