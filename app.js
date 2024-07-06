/* eslint-disable no-undef */
const readline = require("node:readline");
const fs = require("fs");
const fs_promises = require("fs").promises;
const { format } = require("date-fns");
const clc = require("cli-color");
const path = require("path");
const { v4: uuid } = require("uuid");

const { stdin: input, stdout: output } = require("node:process");
const rl = readline.createInterface({ input, output });

let tasks = [];
const pathDB = path.join(__dirname, "localDB");
const pathFile = path.join(__dirname, "localDB", "tasks.txt");
const error = clc.red.bold;
const warn = clc.yellow;
const notice = clc.blue;
const success = clc.green.bold;
const date_time = `${format(new Date(), "dd-MM-yyyy")}`;

async function get_tasks() {
  const tasks_in_DB = await fs_promises.readFile(pathFile, {
    encoding: "utf8",
  });
  const tasks_array = tasks_in_DB.split("\n");
  tasks_array.pop();
  tasks_array.forEach((element) => {
    if (tasks_array.length > 0 && tasks_array.length !== tasks.length) {
      tasks.push(JSON.parse(element));
    }
  });
}

async function create_DB() {
  try {
    if (!fs.existsSync(pathDB)) {
      fs.mkdirSync(pathDB);
      fs.openSync(pathFile, "w");
    } else if (!fs.existsSync(pathFile)) {
      fs.openSync(pathFile, "w");
    }
  } catch (error) {
    console.log("Error in create_DB:", error);
  }
}

async function add_task_DB(answer) {
  try {
    await fs_promises.appendFile(
      pathFile,
      `{"id":"${uuid()}","fecha":"${date_time}","task":"${answer}","completed":${false}}\n`,
    );
  } catch (error) {
    console.error("Error in add_task_DB", error);
  }
}

async function questionForTask() {
  return new Promise((resolve) => {
    console.clear();
    rl.question(notice.bold("Ingrese una tarea: "), (answer) => {
      add_task_DB(answer);
      tasks.shift();
      console.log(success("Tarea creada exitosamente!"));
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
    } catch (error) {
      console.log("Error in addTask", error);
      flag = false;
    }
  }
  displayMenu();
}

async function listTasks() {
  console.clear();
  await get_tasks();
  if (tasks.length === 0) {
    console.log(notice("No hay tareas por hacer"));
  } else {
    console.log(warn("*--- Lista de tareas ---*"));
    tasks.forEach((task, index) => {
      let status = task.completed ? "✅" : "❌";
      if (task.completed) {
        console.log(clc.green(`${index + 1}. ${task.task} - ${status}`));
      } else {
        console.log(error(`${index + 1}. ${task.task} - ${status}`));
      }
    });
  }
  rl.question(clc.bgBlue.white("\nSalir lista de tareas [s/n]"), (answer) => {
    if (answer === "s" || answer === "S") {
      console.clear();
      displayMenu();
    }
  });
}

async function get_tasks_list() {
  tasks.forEach((task, index) => {
    let status = task.completed ? "✅" : "❌";
    if (task.completed) {
      console.log(clc.green(`${index + 1}. ${task.task} - ${status}`));
    } else {
      console.log(error(`${index + 1}. ${task.task} - ${status}`));
    }
  });
}

async function save_tasks() {
  try {
    const tasks_to_save = tasks.map((task) => JSON.stringify(task)).join("\n");
    await fs_promises.writeFile(pathFile, tasks_to_save + "\n");
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
}

async function completeTask() {
  if (tasks.length >= 1) {
    console.clear();
    console.log(clc.bgGreen.blackBright('    COMPLETAR TAREA     '));
    await get_tasks_list();
    await new Promise((resolve) => {
      rl.question("Digita el numero de la tarea*: ", (answer) => {
        const indexTask = Number(answer) - 1;
        if (indexTask >= 0 && indexTask < tasks.length) {
          tasks[indexTask].completed = true;
          console.clear();
          console.log(warn("\nSe completó la tarea\n"));
          displayMenu();
        } else {
          console.log("Número de tarea inválido");
        }
        save_tasks();
        resolve();
      });
    });
  }
  if (tasks.length === 0) {
    return new Promise((resolve) => {
      console.clear();
      console.log("");
      console.log(clc.bgRed("No hay tareas para completar"));
      resolve();
      console.log("");

      displayMenu();
    });
  }
}

async function clearList() {
  try {
    if (fs.existsSync(pathFile)) {
      await fs_promises.unlink(pathFile);
      console.clear();
      console.log(success("Se eliminaron todos los elementos de la lista"));
      fs.writeFileSync(pathFile, "");
      tasks = [];
    } else {
      console.clear();
      console.log(clc.italic("No hay elementos en la lista"));
      displayMenu();
    }
  } catch (error) {
    console.log("Error clearList", error(error));
  }
  displayMenu();
}

function displayMenu() {
  console.log(clc.bgCyanBright.bold.blackBright("TODO APP"));
  console.log("1. Agregar tarea");
  console.log("2. Listar tareas");
  console.log("3. Completar tarea");
  console.log("4. Limpiar lista");
  console.log(error("5. Salir"));
  console.log("");
  chooseOption();
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
        clearList();
        break;
      case "5":
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

create_DB();
get_tasks();
displayMenu();
