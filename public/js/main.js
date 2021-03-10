COLUMNS = ["name", "reps", "weight", "lbs", "date"];
API_URL = 'http://flip2.engr.oregonstate.edu:4861'

// Create the workouts table on page load
document.addEventListener('DOMContentLoaded', (_event) => {
    createTable();
});

function createTable() {
    fetchWorkouts().then(res => {
        res.forEach(workout => {
            addWorkoutRow(workout);
        });
    }).catch(err => {
        console.error(err)
    });
}

function addWorkoutRow(workout) {
    let newRow = document.createElement("tr");

    newRow.id = workout.id;

    addWorkoutRowData(newRow, workout);
    addWorkoutRowButtons(newRow);

    elById('tbody').appendChild(newRow);
}

function deleteWorkoutRow(workoutId) {
    deleteWorkout(workoutId).then(_res => {
        document.getElementById(workoutId).remove();
    }).catch(err => {
        console.error(err);
    });
}

function editWorkoutRow(workoutId) {
    let row = elById(workoutId);
    let workout = workoutFromRow(row);
    let editForm = createEditForm(workout, workoutId);

    debugger;
}

function addWorkoutRowData(row, workout) {
    // In case object attribute order changes, iterate explicitly
    COLUMNS.forEach(colName => {
        let col = document.createElement("td");
        if(colName === "lbs") {
            col.innerText = workout.lbs ? "lbs" : "kg";
        }
        else {
            col.innerText = workout[colName];
        }

        row.appendChild(col);
    });
}

function addWorkoutRowButtons(row) {
    // EDIT button
    let editCol = document.createElement("td");
    let editBtn = document.createElement("button");
    editBtn.innerText = "EDIT";
    editBtn.addEventListener("click", (_event) => {
        editWorkoutRow(row.id);
    });

    editCol.appendChild(editBtn)
    row.appendChild(editCol);

    // DELETE button
    let btnCol = document.createElement("td");
    let delBtn = document.createElement("button");
    delBtn.innerText = "DELETE";
    delBtn.addEventListener("click", (_event) => {
        deleteWorkoutRow(row.id);
    });

    btnCol.appendChild(delBtn)
    row.appendChild(btnCol);
}

function workoutFromRow(row) {
    const workout = {};

    for(let i = 0; i < COLUMNS.length; i++) {
        let colName = COLUMNS[i];
        let data    = row.childNodes[i].innerText;

        if(colName === "lbs") {
            workout[colName] = data === "lbs" ? true : false;
        }
        else if(colName === "reps" || colName === "weight") {
            workout[colName] = parseInt(data);
        }
        else {
            workout[colName] = data;
        }
    }

    return workout;
}

function createEditForm(workout, workoutId) {
    const form = document.createElement("form");
}

/////////////
// HELPERS //
/////////////

function elById(id) {
    return document.getElementById(id);
}

///////////////////
// API FUNCTIONS //
///////////////////

function fetchWorkouts() {
    const req = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
        let url = API_URL + '/workouts';
        req.open('GET', url, true);
        req.addEventListener('load', () => {
            if(req.status >= 200 && req.status < 400) {
                resolve(JSON.parse(req.response));
            }
            else {
                reject(JSON.parse(req.response));
            }
        });

        req.send(null);
    });
}

function deleteWorkout(workoutId) {
    const req = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
        let url = API_URL + `/workouts/${workoutId}`;
        req.open('DELETE', url, true);
        req.addEventListener('load', () => {
            if(req.status >= 200 && req.status < 400) {
                resolve(JSON.parse(req.response));
            }
            else {
                reject(JSON.parse(req.response));
            }
        });

        req.send(null);
    });
}