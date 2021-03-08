// Workout serializer
export default function serializeWorkout(workout) {
    workout.lbs = !!workout.lbs;
    return workout;
}