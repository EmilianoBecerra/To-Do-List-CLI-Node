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
const path_file = path.join(__dirname, "localDB", "tasks.txt");
const err = clc.red.bold;
const warn = clc.yellow;
const notice = clc.blue;
const success = clc.green.bold;
const date_time = `${format(new Date(), "dd-MM-yyyy")}`;

async function get_tasks() {
  try {
    tasks = [];
    const tasks_in_DB = await fs_promises.readFile(path_file, {
      encoding: "utf8",
    });
    const tasks_array_DB = tasks_in_DB.split("\n");
    tasks_array_DB.pop();
    if (tasks_array_DB.length !== tasks.length) {
      tasks = tasks_array_DB.map((element) => JSON.parse(element));
    }
  } catch (error) {
    console.log("get_tasks error", error);
  }
}

async function create_DB() {
  try {
    if (!fs.existsSync(pathDB)) {
      fs.mkdirSync(pathDB);
      fs.openSync(path_file, "w");
    } else if (!fs.existsSync(path_file)) {
      fs.openSync(path_file, "w");
    }
  } catch (error) {
    console.log("Error create_DB:", error);
  }
}

async function add_task_DB(answer) {
  try {
    await fs_promises.appendFile(
      path_file,
      `{"id":"${uuid()}","fecha":"${date_time}","task":"${answer}","completed":${false}}\n`,
    );
  } catch (error) {
    console.error("Error add_task_DB", error);
  }
}

async function questionForTask() {
  try {
    return new Promise((resolve) => {
      console.clear();
      rl.question(notice.bold("Ingrese una tarea: "), (answer) => {
        add_task_DB(answer);
        console.log(success("Tarea creada exitosamente!"));
        resolve();
      });
    });
  } catch (error) {
    console.log("Error questionForTask", error);
  }
}

async function add_task() {
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
      console.log("Error addTask", error);
      flag = false;
    }
  }
  display_menu();
}

async function list_tasks() {
  console.clear();
  await get_tasks();
  if (tasks.length === 0) {
    console.log(err("No hay tareas por hacer"));
  } else {
    console.log(warn("*--- Lista de tareas ---*"));
    tasks.forEach((task, index) => {
      let status = task.completed ? "✅" : "❌";
      if (task.completed) {
        console.log(success(`${index + 1}. ${task.task} - ${status}`));
      } else {
        console.log(err(`${index + 1}. ${task.task} - ${status}`));
      }
    });
  }
  rl.question(clc.bgBlue.white("\nSalir lista de tareas [s]"), (answer) => {
    if (answer.toLowerCase() === "s") {
      console.clear();
      display_menu();
    }
  });
}

async function get_tasks_list() {
  tasks.forEach((task, index) => {
    let status = task.completed ? "✅" : "❌";
    if (task.completed) {
      console.log(clc.green(`${index + 1}. ${task.task} - ${status}`));
    } else {
      console.log(err(`${index + 1}. ${task.task} - ${status}`));
    }
  });
}

async function save_tasks() {
  try {
    const tasks_to_save = tasks.map((task) => JSON.stringify(task)).join("\n");
    await fs_promises.writeFile(path_file, tasks_to_save + "\n");
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
}

async function complete_task() {
  await get_tasks();
  if (tasks.length >= 1) {
    console.clear();
    console.log(clc.bgGreen.blackBright("    COMPLETAR TAREA     "));
    await get_tasks_list();
    await new Promise((resolve) => {
      rl.question(notice.bold("Digita el numero de la tarea: "), (answer) => {
        const indexTask = Number(answer) - 1;
        if (indexTask >= 0 && indexTask < tasks.length) {
          tasks[indexTask].completed = true;
          console.clear();
          console.log(success("\nSe completó la tarea\n"));
          display_menu();
        } else {
          console.clear();
          console.log(err("Número de tarea inválido"));
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
      display_menu();
    });
  }
}

async function clear_list() {
  try {
    if (fs.existsSync(path_file)) {
      await fs_promises.unlink(path_file);
      console.clear();
      console.log(success("Se eliminaron todos los elementos de la lista"));
      fs.writeFileSync(path_file, "");
    } else {
      console.clear();
      console.log(clc.italic("No hay elementos en la lista"));
      display_menu();
    }
  } catch (error) {
    console.log("Error clearList", error);
  }
  display_menu();
}

function display_menu() {
  console.log(clc.bgCyanBright.bold.blackBright("      TODO APP      "));
  console.log(`
1. Agregar tarea
2. Listar tareas
3. Completar tarea
4. Limpiar lista`);
  console.log(err("5. Salir\n"));
  choose_option();
}

function choose_option() {
  rl.question(clc.bgMagentaBright("Digita una opción: "), (choice) => {
    switch (choice) {
      case "1":
        add_task();
        break;
      case "2":
        list_tasks();
        break;
      case "3":
        complete_task();
        break;
      case "4":
        clear_list();
        break;
      case "5":
        console.log("Adios");
        rl.close();
        break;
      default:
        console.log(error.bgRed("El digito es inválido [1-4]"));
        display_menu();
        break;
    }
  });
}

create_DB();
get_tasks();
display_menu();
