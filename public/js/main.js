COLUMNS = ["name", "reps", "weight", "lbs", "date"];

///////////////////////
// INITIAL PAGE LOAD //
///////////////////////

document.addEventListener('DOMContentLoaded', (_event) => {
    createTable();
});

function createTable() {
    let createRow = document.createElement("tr");
    createRow.id  = "new";
    elById("tbody").appendChild(createRow);

    initializeCreateRow()

    fetchWorkouts().then(res => {
        res.forEach(workout => {
            addNewWorkoutRow(workout);
        });
    }).catch(err => {
        handleError(err);
    });
}

/////////////////////
// ACTION HANDLERS //
/////////////////////

function submitCreateWorkout(row) {
    clearErrors();
    workout = workoutFromId(row.id);

    createWorkout(workout).then(res => {
        workout.id = res.insertId;
        addNewWorkoutRow(workout);
        initializeCreateRow();
    }).catch(err => {
        handleError(err);
    });
}

function submitEditWorkout(row) {
    clearErrors();
    const workout = workoutFromId(row.id);

    editWorkout(workout).then(_res => {
        addWorkoutRow(row, workout);
    }).catch(err => {
        handleError(err);
    });
}

function submitDeleteWorkout(workoutId) {
    clearErrors();
    deleteWorkout(workoutId).then(_res => {
        document.getElementById(workoutId).remove();
    }).catch(err => {
        handleError(err);
    });
}

/////////////////
// ROW HELPERS //
/////////////////

function initializeCreateRow() {
    let createRow = elById("new");
    createRowInputs(createRow, emptyWorkout());

    const submitCol = document.createElement("td");
    const submitBtn = document.createElement("button");
    submitBtn.innerText = "CREATE NEW";
    submitBtn.addEventListener("click", (_event) => {
        submitCreateWorkout(createRow);
    });
    submitCol.appendChild(submitBtn);
    createRow.appendChild(submitCol);
}

function addNewWorkoutRow(workout) {
    let newRow = document.createElement("tr");
    newRow.id  = workout.id;

    addWorkoutRow(newRow, workout);
    elById('tbody').appendChild(newRow);
}

function createRowInputs(row, workout) {
    clearRow(row);
    let input;

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

        input.id    = `${val}${row.id}`;
        input.value = workout[val];
        td.appendChild(input);
        row.appendChild(td);
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
        clearErrors();
        editWorkoutRow(row.id);
    });

    editCol.appendChild(editBtn)
    row.appendChild(editCol);

    // DELETE button
    let btnCol = document.createElement("td");
    let delBtn = document.createElement("button");
    delBtn.innerText = "DELETE";
    delBtn.addEventListener("click", (_event) => {
        clearErrors();
        submitDeleteWorkout(row.id);
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

function editWorkoutRow(workoutId) {
    const row     = elById(workoutId);
    const workout = workoutFromRow(row);

    createRowInputs(row, workout);

    // SAVE button
    const submitCol = document.createElement("td");
    const submitBtn = document.createElement("button");
    submitBtn.innerText = "SAVE";
    submitBtn.addEventListener("click", (_event) => {
        submitEditWorkout(row);
    });
    submitCol.appendChild(submitBtn);
    row.appendChild(submitCol);

    // CANCEL button
    const cancelCol = document.createElement("td");
    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "CANCEL";
    cancelBtn.addEventListener("click", (_event) => {
        clearErrors();
        workout.id = row.id;
        addWorkoutRow(row, workout);
    });
    cancelCol.appendChild(cancelBtn);
    row.appendChild(cancelCol);
}

///////////////////
// Error Handler //
///////////////////

function handleError(err) {
    console.error(err);

    const errTable = document.getElementById("error-table");
    const hdRow    = document.createElement("tr");
    const header   = document.createElement("th");

    header.innerText = "Error";

    hdRow.appendChild(header);
    errTable.appendChild(hdRow);

    if(err.errors) {
        err.errors.forEach(error => {
            let row   = document.createElement("tr");
            let param = document.createElement("td");
            let msg   = document.createElement("td");

            param.innerText = error.param;
            msg.innerText   = error.msg;

            row.appendChild(param);
            row.appendChild(msg);

            errTable.appendChild(row);
        });
    }
    else {
        const row = document.createElement("tr");
        const msg = document.createElement("td");

        msg.innerText = err.message;

        row.appendChild(msg);

        errTable.appendChild(row);
    }
}

//////////////////
// MISC HELPERS //
//////////////////

function clearErrors() {
    document.getElementById("error-table").innerText = "";
}

function elById(id) {
    return document.getElementById(id);
}

function clearRow(row) {
    row.innerText = "";
}

function emptyWorkout() {
    let workout = {};
    COLUMNS.forEach(val => workout[val] = null);
    workout.id  = "new";
    workout.lbs = true; // Default to lbs
    return workout;
}

function workoutFromId(id) {
    workout = {};
    COLUMNS.forEach(val => {
        let input = document.getElementById(`${val}${id}`);
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
    workout.id = id;
    return workout;
}

///////////////////
// API FUNCTIONS //
///////////////////

function fetchWorkouts() {
    const req = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
        let url = '/workouts';
        req.open('GET', url, true);
        req.setRequestHeader('Content-Type', 'application/json');
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
        let url = `/workouts/new`;
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
        let url = `/workouts/${workout.id}`;
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
        let url = `/workouts/${workoutId}`;
        req.open('DELETE', url, true);
        req.setRequestHeader('Content-Type', 'application/json');
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