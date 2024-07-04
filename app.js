/* eslint-disable no-undef */
const readline = require("node:readline");
const fs = require("fs");
const fs_promises = require("fs").promises;
const { format } = require("date-fns");
const clc = require("cli-color");
const path = require("path");

const { stdin: input, stdout: output } = require("node:process");
const rl = readline.createInterface({ input, output });

let tasks = [];
const pathBD = path.join(__dirname, "localBD");
const pathFile = path.join(__dirname, "localBD", "tasks.txt");
const error = clc.red.bold;
const warn = clc.yellow;
const notice = clc.blue;
const success = clc.green.bold;
const date_time = `${format(new Date(), "dd-MM-yyyy")}`;

async function get_tasks() {
  const tasks_in_BD = await fs_promises.readFile(pathFile, { encoding: "utf8", });
  const tasks_array = tasks_in_BD.split(";");
  if (tasks_array.length - 1 !== tasks.length) {
    load_tasks();
  }
}

async function load_tasks() {
  try {
    if (!fs.existsSync(pathBD)) {
      fs.mkdirSync(pathBD);
      fs.openSync(pathFile, "w");
    } else if (!fs.existsSync(pathFile)) {
      fs.openSync(pathFile, "w");
    } else {
      const tasks_in_BD = await fs_promises.readFile(pathFile, { encoding: "utf8", });
      if (tasks_in_BD.trim() !== "") {
        const tasks_array = tasks_in_BD.split(";");
        tasks_array.forEach((el) => {
          if (el.trim() !== "") {
            try {
              tasks.push(JSON.parse(el));
            } catch(error) {
              console.log('Error in load_tasks bd', error)
            }
          }
        });
      }
    }
  } catch (error) {
    console.log("Error in load_tasks:", error);
  }
}

async function add_task_bd(task) {
  try {
    await fs_promises.appendFile(
      pathFile,
      `{"fecha":"${date_time}","task":"${task}","completed":${false}};`
    );
  } catch (error) {
    console.error('Error in add_task_bd', error);
  }
}

async function questionForTask() {
  return new Promise((resolve) => {
    rl.question(notice.bold("Ingrese una tarea: "), (answer) => {
      add_task_bd(answer);
      console.log(success("Tarea creada exitosamente!!"));
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
        rl.question(notice.bold("Quiere ingresar otra tarea? [s/n]"),
          (answer) => {
            if (answer.toLowerCase() === "n") {
              flag = false;
              console.clear();
            }
            resolve();
          });
      });
    } catch (error) {
      console.log('Error in addTask', error);
      flag = false;
    }
  }
  await get_tasks();
  displayMenu();
}

async function listTasks() {
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
  displayMenu();
}

async function save_tasks() {
  try {
    const tasks_to_save = tasks.map(task => JSON.stringify(task)).join(";");
    await fs_promises.writeFile(pathFile, tasks_to_save + ';');
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
}

async function completeTask() {
  if (tasks.length >= 1) {
    await new Promise((resolve) => {
      rl.question("Digita el numero de la tarea*: ", (answer) => {
        const indexTask = Number(answer) - 1;
        if (indexTask >= 0 && indexTask < tasks.length) {
          tasks[indexTask].completed = true;
          console.log(warn("Se completó la tarea"));
        } else {
          console.log("Número de tarea inválido");
        }
        save_tasks();
        resolve();
      });
    });
  } else {
    console.log(error("No hay tareas en tu lista"));
  }
  displayMenu();
}

async function clearList() {
  try {
    if (fs.existsSync(pathFile)) {
      await fs_promises.unlink(pathFile);
      console.log(success("Se eliminaron todos los elementos de la lista"));
      fs.writeFileSync(pathFile, '');
      tasks = [];
    } else {
      console.log(clc.italic("No hay elementos en la lista"));
      displayMenu();
    }
  } catch (error) {
    console.log('Error clearList', error(error))
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

load_tasks().then(() => {
  displayMenu();
});