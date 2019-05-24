import React, { Component } from 'react';
import * as math from 'mathjs';
import * as firebase from 'firebase';
import uuid from 'uuid/v4';

import './App.css';
import { Button } from './Button/Button';
import { Clear } from './Clear/Clear';
import { Input } from './Input/Input';
import { Log } from './Log/Log';
import { Header } from './Header/Header'

// Firebase Config (should be hidden in different document)
var firebaseConfig = {
  apiKey: "AIzaSyCKD5bCwEI5PUw9vz6ELJ0aWdFec0hcRVQ",
  authDomain: "calculator-c9f58.firebaseapp.com",
  databaseURL: "https://calculator-c9f58.firebaseio.com",
  projectId: "calculator-c9f58",
  storageBucket: "calculator-c9f58.appspot.com",
  messagingSenderId: "1077566705250",
  appId: "1:1077566705250:web:656cc89503f93b8d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// buttons array maps to li elements
const buttons = [1,2,3,'+',4,5,6,'-',7,8,9,'*','.',0,'=','/'];
// validates key presses
const keyCodes = [42,43,45,46,47,48,49,50,51,52,53,54,55,56,57,61];
// list of 10 most recent equations

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // input builds a string of user inputs
      input: '',
      // display is for the calculator screen
      display: '...',
      // stores all logs from db
      logs: {},
      // Make a list for 10 recent posts
      list: []
    }
}

  componentDidMount() {
    this.fetchData();
    document.addEventListener("keypress", this.handleKeyPress, true);
  }  

  // should fetch data (previous logs) for app on first render,
  // and also update logs live from user and other users
  fetchData = () => {
    // creating reference to root node of firebase db
    const rootRef = firebase.database().ref().child('/logs');
    // on "change" in db, pull all logs
    rootRef.on('value', snapshot => {
      this.setState({
        logs: snapshot.val()
      });
      // call function to make array of 10 most recent for list
      return this.tenMostRecentLogs(snapshot.val())
    }, function (errorObject) {
      return console.log("The read failed: " + errorObject.code);
    })
  }

  // take db object and update app state
  tenMostRecentLogs = obj => {
    // make array of all logs
    const logs = [
      Object.entries(obj)
    ];
    // create array of all logs sorted by timestamp
    const sortedLogs = logs[0].sort((a,b) => (a.timestamp < b.timestamp) ? 1 : -1)
    // create an array of ten most recent posted logs
    let tenLogsSorted = [];
    for (let i=0;i<10;i++) {
      let log = [];
      log.push(sortedLogs[i][1].eq);
      log.push(sortedLogs[i][1].id);
      tenLogsSorted.push(log)
    }
    this.setState({
      list: tenLogsSorted
    })
  }

  writeDataToDb = (uuid, eq) => {
    // create obj that will be sent to firebase db
    const log = {
      id: uuid,
      eq: eq,
      timestamp: Date.now()
    }
    // reference to firebase db
    const logs = firebase.database().ref().child('logs');
    // pushing obj to firebase db
    logs.push(log);
  }

  // simple function to handle btn clicks and run handleInput
  btnClick = val => {
    const value = val.target.value
    this.handleInput(value);
  }

  // simple function to handle key presses and run handleInput
  handleKeyPress = e => {
    if (!keyCodes.includes(e.keyCode)) return;
    this.handleInput(e.key)
  }

  // handles user input
  handleInput = value => {
    // if user presses equal sign, run handleEqual (handleEqual has error catching)
    if (value === '=') { 
      return this.handleEqual()
    }
    // if no values yet, set display and input to first key pressed.
    if (this.state.display === '...') {
      return this.setState({
        input: value,
        display: value
      })
    }
    // if previous error, set display and input to first key pressed.
    else if (this.state.display === 'ERROR!') {
      return this.setState({
        input: value,
        display: value
      })
    }
    // if handleEqual was previously ran succesfully start new equation
    else if (this.state.input === '') {
      console.log('hello?');
      return this.setState({
        input: value,
        display: value
      })
    }
    // Default behavior is to append user input to input state and display
    this.setState({
      input: this.state.input + value,
      display: this.handleLongInput(this.state.display + value)
    });
  }

  // handles = operation and keypress/button click
  handleEqual = () => {
    // if display has ... nothing will happen
    if (this.state.display === '...') {
      return;
    }
    // if error occurs in math, i.e. a bad user input, displays error on calculator
    try { 
      math.eval(this.state.input) 
    }
    catch(error) {
      this.setState({
        display: 'ERROR!'
      });
      return;
    }
    // evaluates user input, runs handleLog with answer, and updates input and display states
    const answer = math.eval(this.state.input);
    this.handleLog(answer);
    this.setState({display: answer});
    this.setState({input: ''})
  }

  handleLog = answer => {
    // builds equation string for db and logging
    const equation = this.state.input + '=' +answer;
    // creates unique uuid(v4) for each logged equation
    const newId = uuid();
    this.writeDataToDb(newId, equation);
  }

  // For equations that would run off the display
  handleLongInput = input => {
    const length = input.length;
    // if the input is loner than 15 characters...
    if (length > 15) {
      // create new display with ellipsis and last 12 characters of input string
      const newDisplay = "..."
      const cut = input.length - 12;
      return newDisplay + input.slice(cut)
    }
    // otherwise return user input
    return input;
  }

  render( ) {
    return (
      <div className='app'>
        <div className='header'>
          <Header/>
        </div>
        <div className='calculator nes-container is-rounded'>
          
        <div className='input'>
          <Input display={this.state.display}></Input>
        </div>

        <div className='square-btns'>
          {buttons.map(btn => 
            <Button btnClick={this.btnClick} key={btn}>
              {btn}
            </Button>
          )}
        </div>

        <div className='clear'>
          <Clear handleClear={() => this.setState({display: '...'})}/>
        </div>
            
        </div>
        <div className='log'>
          <Log logs={this.state.list}/>
        </div>
      </div>
    );
  }
  
}

export default App;
