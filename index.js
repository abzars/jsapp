const { getAllFilePathsWithExtension, readFile } = require('./fileSystem');
const { readLine } = require('./console');

app();

function app () {

  console.log('Please, write your command!');
  readLine(processCommand);
}

/**
 * Вычисление приоритета "todo"
 *
 * @param {string} todoTemp Строка, в которой необходимо провести поиск и подсчет восклицательных знаков.
 * @return {number} Число, показывающее приоритет "todo".
 */
function importantTodo(todoTemp) {
  const target = "!";
  let pos = 0;
  let counter = 0;

  while (true) {
    const foundPos = todoTemp.indexOf(target, pos);
    if (foundPos === -1) {
      if (counter!==0) {
        return counter
      } else {
        return counter
      }
    }

    counter++;
    pos = foundPos + 1;
  }
}

/**
 * Поиск в строке имени, даты и комментария
 *
 * @param {string} todoTemp Строка, в которой необходимо провести поиск.
 * @param {array} findData Массив, в который будет складываться найденная информация
 * @return {array} Массив с найденной информацией.
 */
function findNameDateComment(todoTemp, findData){
  const target = todoTemp.indexOf(";");

  let nameDateComment = '';

  if (target!==-1 && todoTemp.length!==0) {

    let reg = /[^ ].+/gi; //
    nameDateComment = todoTemp.slice(0, target).match(reg);

    findNameDateComment(todoTemp.slice(target+1), findData);

    if (nameDateComment!==null) {
      findData.push(nameDateComment[0])
    } else {
      findData.push(' ')
    }
    return findData

  } else {
    let reg = /[^: ].+/gi; //
    nameDateComment = todoTemp.match(reg);

    if (nameDateComment!==null) {
      findData.push(nameDateComment[0])
    } else {
      findData.push(' ')
    }
    return findData
  }
}

/**
 * Возвращает все найденные "todo"
 *
 * @return {array} Массив объектов со всеми найденными "todo" и информацией о них.
 */
function getData() {
  const fileName = getAllFilePathsWithExtension(process.cwd(), 'js');
  const todoForEachFiles = [];

  for (let i=0; i<fileName.length; i++){

    const text = readFile(fileName[i]).split('\n');
    let todo = [];

    for (let j=0; j<text.length; j++) {
      const reg = /\/\/ ?TODO .+/gi;
      let todoTemp = String(text[j]).match(reg);
      if (todoTemp !== null) todo.push(...todoTemp)
    }

    const fileTodo = [];

    for (let j=0; j<todo.length; j++){

      let todoTemp = String(todo[j].slice(7));
      const importance = importantTodo(todoTemp);
      const target = todoTemp.indexOf(";");

      if (target===-1){
        const reg = /[^: ].+/gi;
        todoTemp = todoTemp.match(reg);
        fileTodo.push({
          fileName: fileName[i].substring(fileName[i].lastIndexOf('/')+1),
          todo: todo[j],
          importance: importance,
          user: '',
          date: '',
          comment: todoTemp[0].slice(0)
        });

      } else {
        const findData = [];
        let a = findNameDateComment(todoTemp, findData);
        fileTodo.push({
          fileName: fileName[i].substring(fileName[i].lastIndexOf('/')+1),
          todo: todo[j],
          importance: importance,
          user: a[2],
          date: a[1],
          comment: a[0]
        })
      }

      if (fileTodo[fileTodo.length-1].user===' ') {
        fileTodo[fileTodo.length-1].user=''
      }
    }

    todoForEachFiles.push(...fileTodo)
  }

  return todoForEachFiles
}

/**
 * Возвращает строку с нужным количеством пробелов
 *
 * @param {string} str Строка, длину которой нужно изменить, добвив пробелы.
 * @param {number} size Необходимая длина строки.
 * @return {string} Строка с необходимым количеством пробелов.
 */
function stringSize(str, size){
  if (str===undefined || str.length<=size){
    return str + ' '.repeat(size-str.length)
  } else {
    return str.substr(0,size-3) + '...'
  }
}

/**
 * Выводит данные в консоль
 *
 * @param {object} data Данные, которые необходимо вывести.
 */
function display(data) {

  const labelLength = {
    max: {
      user: 10,
      date: 10,
      comment: 50,
      fileName: 15,
    },
    real: {
      user: 0,
      date: 0,
      comment: 0,
      fileName: 0,
    },
    toDisplay: {
      user: 4,
      date: 4,
      comment: 7,
      fileName: 8,
    }
  };

  // вычисление реальной длины строки и установки минимального значения
  for (let key in labelLength.max) {
    data.filter(x => {
      x[key].length > labelLength.real[key] ? labelLength.real[key] = x[key].length : null
    });
  }

  // вычисление значений для вывода
  for (let i=0; i<data.length; i++) {
    for (let key in labelLength.max) {
      if (labelLength.real[key] > key.length && labelLength.real[key] < labelLength.max[key]) {
        labelLength.toDisplay[key] = labelLength.real[key]
      } else if (labelLength.real[key] >= labelLength.max[key]) {
        labelLength.toDisplay[key] = labelLength.max[key]
      } else {
        labelLength.toDisplay[key] = key.length
      }
    }
  }

  // вывод заголовка
  let head = ('  ' + '!');
  for (let key in labelLength.max) {
    head = head + ('  ' + '|' + '  ' + stringSize(key, labelLength.toDisplay[key]))
  }
  head = head + '  ' + '\n';
  for (let key in labelLength.max) {
    head=head + ('-'.repeat(labelLength.toDisplay[key]+6))
  }
  head = head + ('-') + '\n';

  // вывод данных
  let body='';
  for (let i=0; i<data.length; i++) {
    if (data[i].importance!==0) {
      body = body + ('  ' + '!');
      for (let key in labelLength.max){
        body=body + ('  ' + '|' + '  ' + stringSize(data[i][key], labelLength.toDisplay[key]))
      }

      body = body + '  ' + '\n'
    } else {
      body = body + ('  ' + ' ');
      for (let key in labelLength.max){
        body = body + ('  ' + '|' + '  ' + stringSize(data[i][key], labelLength.toDisplay[key]))
      }
      body = body + '  ' + '\n'
    }
  }
  let footer='';
  for (let key in labelLength.max) {
    footer = footer + ('-'.repeat(labelLength.toDisplay[key]+6))
  }
  footer = footer + ('-');
  console.log(`${head}${body}${footer}`)
}

/**
 * Проверка на число
 *
 * @param {string} n Переменная, которая должна хранить в себе число в виде строки.
 * @return {boolean} Результат проверки на число.
 */
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Команда "show"
 */
function show() {
  display(getData())
}

/**
 * Команда "important"
 */
function searchImportance() {
  display(getData().filter(x => x.importance!== 0))
}

/**
 * Команда "user {username}"
 *
 * @param {string} userName Имя пользователя, "todo" которого необходимо вывести.
 */
function searchUser(userName) {
  if (userName===''){
    display(getData().filter(x => userName === x.user))
  }else {
    display(getData().filter(x => x.user.toLowerCase().substr(0, userName.length) === userName.toLowerCase()))
  }
}

/**
 * Команда "sort {importance | user | date}"
 *
 * @param {string} field Поле по которому необходимо сделать вывод и сортировку.
 */
function searchSort(field) {
  const data = getData();

  if (field === 'importance') {
    function sortImp(param1, param2) {
      if (param2.importance>param1.importance){
        return 1;
      } else {
        return -1
      }
    }
    data.sort(sortImp);
    display(data);

  } else if (field === 'user') {
    function sortImp(param1, param2) {
      if (param1.user.toLowerCase()==='' && param2.user.toLowerCase()===''){
        if (param1.user.toLowerCase()>param2.user.toLowerCase()){
          return 1;
        } else {
          return -1
        }
      }
      else if(param1.user.toLowerCase()===''){
        return 1
      }
      else if (param2.user.toLowerCase()===''){
        return -1
      }
      else if (param1.user.toLowerCase()>param2.user.toLowerCase()){
        return 1;
      } else {
        return -1
      }
    }

    data.sort(sortImp);
    display(data);

  } else if (field === 'date') {
    function sortImp(param1, param2) {
      if (param2.date>param1.date){
        return 1;
      } else {
        return -1
      }
    }
    data.sort(sortImp);
    display(data);
  }

}

/**
 * Команда "date {yyyy[-mm-dd]}"
 *
 * @param {string} date Дата с которой начинается вывод.
 */
function searchDate (date) {
  const data = getData();
  if (date===''){
    display(data.filter(x => date === x.date.split('-').join('')))
  } else {
    date = date.split('-').join('');
    display(data.sort((a, b) => a.date > b.date).filter(x => date <= x.date.split('-').join('')))
  }
}

function processCommand (command) {
  switch (true) {
    case command === 'exit':
      process.exit(0);
      break;
    case command === 'show':
      show();
      break;
    case command ==='important':
      searchImportance();
      break;
    case (command.substr(0,4) === 'user' && (
        (command.length>4 && command[5]!==undefined && command[5]!==' ') ||
        (command.length===4)
      )
    ):
      searchUser(command.substr(5));
      break;
    case (command.substr(0,4) === 'sort' && (
        (command.substr(5,4) === 'user' && command.length===9) ||
        (command.substr(5,4) === 'date' && command.length===9) ||
        (command.substr(5,10) === 'importance' && command.length===15)
      )
    ):
      searchSort(command.substr(5));
      break;
    case (command.substr(0,4) === 'date' && (
        (command.length===15 && isNumeric(command.substr(5, 4)) &&
          command[9]==='-' && isNumeric(command.substr(10,2)) &&
          command[12]==='-' && isNumeric(command.substr(13,2)) ) ||
        (command.length===12 && isNumeric(command.substr(5, 4)) &&
          command[9]==='-' && isNumeric(command.substr(10,2)) ) ||
        (command.length===9 && isNumeric(command.substr(5, 4)) ) ||
        (command.length===4)
      )
    ):
      searchDate(command.substr(5));
      break;
    default:
      console.log('wrong command');
      break;
  }
}

// TODO you can do it!
