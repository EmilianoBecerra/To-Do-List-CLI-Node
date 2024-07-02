const readline = require("node:readline");
//const fs = require("node:fs");
const { stdin: input, stdout: output } = require("node:process");
const rl = readline.createInterface({ input, output });
const clc = require("cli-color");

const error = clc.red.bold;
const warn = clc.yellow;
const notice = clc.blue;
const success = clc.green.bold;
const tasks = [];


function displayMenu() {
    console.log(clc.bgCyanBright.bold.blackBright("TODO APP "));
    console.log("1. Agregar tarea");
    console.log("2. Listar tareas");
    console.log("3. Completar tarea");
    console.log(error("4. Salir"));
    console.log("");
    chooseOption();
}


function questionForTask() {
    return new Promise((resolve) => {
        rl.question(notice.bold("Ingrese una tarea: "), (answer) => {
            tasks.push({ task: answer, completed: false });
            console.log(success("Se creo una nueva tarea exitosamente!!"));
            resolve();
        });
    });
}

async function addTask() {
    let flag = true;
    while (flag) {
        try {
            await questionForTask();
            await new Promise((resolve) => {
                rl.question(
                    notice.bold("Quiere ingresar otra tarea? [s/n]"),
                    (answer) => {
                        if (answer.toLowerCase() === "n") {
                            flag = false;
                            console.clear();
                        }
                        resolve();
                    },
                );
            });
        } catch (err) {
            console.log(error(err));
            flag = false;
        }
    }
    displayMenu();
}

function listTasks() {
    if (tasks.length === 0) {
        console.log(notice("No hay tareas por hacer"));
    } else {
        console.log(warn("*--- Lista de tareas ---*"));
        tasks.map((task, index) => {
            let status = task.completed ? "✅" : "❌";
            if (task.completed) {
                console.log(
                    clc.green(`${index + 1}. ${task.task} - ${status}`),
                );
            } else {
                console.log(error(`${index + 1}. ${task.task} - ${status}`));
            }
        });
    }
    displayMenu();
}

function completeTask() {
    if (tasks.length >= 1) {
        tasks.map((task, index) => {
            let status = task.completed ? "✅" : "❌";
            if (task.completed) {
                console.log(
                    clc.green(`${index + 1}. ${task.task} - ${status}`),
                );
            } else {
                console.log(error(`${index + 1}. ${task.task} - ${status}`));
            }
        });
        rl.question("Digita el numero de la tarea*:  ", (answer) => {
            const indexTask = Number(answer) - 1;
            if (indexTask >= 0 && indexTask < tasks.length) {
                tasks[indexTask].completed = true;
                console.log(warn("Se completó la tarea"));
                tasks.map((task, index) => {
                    let status = task.completed ? "✅" : "❌";
                    if (task.completed) {
                        console.log(
                            clc.green(`${index + 1}. ${task.task} - ${status}`),
                        );
                    } else {
                        console.log(error(`${index + 1}. ${task.task} - ${status}`));
                    }
                });
            } else {
                console.log("Número de tarea inválido");
            }
            displayMenu();
        });
    } else {
        console.log(error("No hay tareas en tu lista"));
        displayMenu();
    }
}

function chooseOption() {
    rl.question(clc.bgMagentaBright("*Digita una opción: "), (choice) => {
        switch (choice) {
            case "1":
                addTask();
                break;
            case "2":
                listTasks();
                break;
            case "3":
                completeTask();
                break;
            case "4":
                console.log("Adios");
                rl.close();
                break;
            default:
                console.log(error.bgRed("El digito es inválido [1-4]"));
                displayMenu();
                break;
        }
    });
}

displayMenu();
