COLUMNS = ["name", "reps", "weight", "lbs", "date"];
API_URL = 'http://flip2.engr.oregonstate.edu:4861'

// Create the workouts table on page load
document.addEventListener('DOMContentLoaded', (_event) => {
    createTable();
});

function createTable() {
    fetchWorkouts().then(res => {
        res.forEach(workout => {
            addNewWorkoutRow(workout);
        });
    }).catch(err => {
        console.error(err)
    });
}

function addNewWorkoutRow(workout) {
    let newRow = document.createElement("tr");

    newRow.id = workout.id;

    addWorkoutRow(newRow, workout);

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
    const row     = elById(workoutId);
    const workout = workoutFromRow(row);
    let input;

    clearRow(row);

    COLUMNS.forEach(val => {
        let td = document.createElement("td");

        if(val === "lbs") {
            input = document.createElement("select");

            let lbsOption       = document.createElement("option");
            lbsOption.value     = true;
            lbsOption.innerText = "lbs";
            input.appendChild(lbsOption);

            let kgOption       = document.createElement("option");
            kgOption.value     = false;
            kgOption.innerText = "kg";
            input.appendChild(kgOption);
        }
        else {
            input = document.createElement("input");

            switch(val) {
                case "reps":
                case "weight":
                    input.type = "number";
                    break;
                case "date":
                    input.type = "date";
                    break;
                case "name":
                    input.type = "text";
            }
        }

        input.id    = `${val}${workoutId}`;
        input.value = workout[val];
        td.appendChild(input);
        row.appendChild(td);
    });

    const submitCol = document.createElement("td");
    const submitBtn = document.createElement("button");
    submitBtn.innerText = "SUBMIT";
    submitBtn.addEventListener("click", (_event) => {
        submitEdit(row);
    });
    submitCol.appendChild(submitBtn);
    row.appendChild(submitCol);

    const cancelCol = document.createElement("td");
    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "CANCEL";
    cancelBtn.addEventListener("click", (_event) => {
        workout.id = row.id;
        addWorkoutRow(row, workout);
    });
    cancelCol.appendChild(cancelBtn);
    row.appendChild(cancelCol);
}

function submitEdit(row) {
    workout = {};
    COLUMNS.forEach(val => {
        let input = document.getElementById(`${val}${row.id}`);
        switch(val) {
            case "reps":
            case "weight":
                workout[val] = parseInt(input.value);
                break;
            case "lbs":
                workout.lbs = input.value === "true";
                break;
            default:
                workout[val] = input.value;
        }
    });
    workout.id = row.id;

    editWorkout(workout).then(_res => {
        addWorkoutRow(row, workout);
    }).catch(err => {
        console.error(err);
    });
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

function addWorkoutRow(row, workout) {
    clearRow(row);
    addWorkoutRowData(row, workout);
    addWorkoutRowButtons(row);
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

/////////////
// HELPERS //
/////////////

function elById(id) {
    return document.getElementById(id);
}

function clearRow(row) {
    row.innerText = "";
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

function createWorkout(workout) {
    const req = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
        let url = API_URL + `/workouts/new`;
        req.open('POST', url, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load', () => {
            if(req.status >= 200 && req.status < 400) {
                resolve(JSON.parse(req.response));
            }
            else {
                reject(JSON.parse(req.response));
            }
        });

        req.send(JSON.stringify(workout));
    });
}

function editWorkout(workout) {
    const req = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
        let url = API_URL + `/workouts/${workout.id}`;
        req.open('PUT', url, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load', () => {
            if(req.status >= 200 && req.status < 400) {
                resolve(JSON.parse(req.response));
            }
            else {
                reject(JSON.parse(req.response));
            }
        });

        req.send(JSON.stringify(workout));
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