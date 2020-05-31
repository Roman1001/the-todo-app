'use strict'

const path = require('path')
const { app, ipcMain } = require('electron')
const { BrowserWindow } = require('electron')
const autoUpdater = require("electron-updater")

const Window = require('./src/class/Window')
const DataStore = require('./src/class/DataStore')

// create a new todo store name "Todos Main"
const todosData = new DataStore({ name: 'Todos Main' })

function main () {
  // todo list window
  let mainWindow = new Window({
    file: path.join('views', 'index.html')
  })

  // add todo window
  let addTodoWin

  // TODO: put these events into their own file

  // initialize with todos
  mainWindow.once('show', () => {
    mainWindow.webContents.send('todos', todosData.todos)
  })

  // create add todo window
  ipcMain.on('add-todo-window', () => {
    // if addTodoWin does not already exist
    if (!addTodoWin) {
      // create a new add todo window
      addTodoWin = new Window({
        file: path.join('views', 'add.html'),
        width: 400,
        height: 400,
        // close with the main window
        parent: mainWindow,
      })

      // cleanup
      addTodoWin.on('closed', () => {
        addTodoWin = null
      })
    }
  })

  // add-todo from add todo window
  ipcMain.on('add-todo', (event, todo, desc) => {
    const updatedTodos = todosData.addTodo(todo, desc).todos

    mainWindow.send('todos', updatedTodos)
  })

  // delete-todo from todo list window
  ipcMain.on('delete-todo', (event, todo) => {
    const updatedTodos = todosData.deleteTodo(todo).todos

    mainWindow.send('todos', updatedTodos)
  })
}

app.on('ready', main)

app.on("ready", () => {
	autoUpdater.checkForUpdatesAndNotify()
})

app.on('window-all-closed', function () {
  app.quit()
})
