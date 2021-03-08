// Workout serializer
exports.serializeWorkout =  workout => {
    workout.lbs = !!workout.lbs;
    return workout;
};