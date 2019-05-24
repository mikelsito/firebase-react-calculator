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

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // input builds a string of user inputs
      input: '',
      // display is for the calculator screen
      display: '...',
      // buttons array maps to li elements
      buttons: [1,2,3,'+',4,5,6,'-',7,8,9,'*','.',0,'=','/'],
      // validats key presses
      keyCodes: [42,43,45,46,47,48,49,50,51,52,53,54,55,56,57,61],
      // empty array to store previous equations
      logs: []
    }
  }

  componentDidMount() {
    this.initializeData();
    document.addEventListener("keypress", this.handleKeyPress, true);
  }  

  // should initialize data (previous logs) for app on first render,
  // and also update logs live from user and other users
  initializeData = () => {
    // creating reference to logs node of firebase db
    let rootRef = firebase.database().ref().child('/');
    let logsRef = rootRef.child('logs');
    // on "change" in db, pull each 
    logsRef.on('value', snap => {
      snap.forEach(log => {
        let logVal = log.val();
        this.setState({
          logs: [
            logVal,
            ...this.state.logs
          ]
        })
      })
    })
  }

  // eliminates repeating logs in logs state
  logsHasLog = data => {

  }

  writeDataToDb = (uuid, eq) => {
    // create obj that will be sent to firebase db
    let log = {
      id: uuid,
      eq: eq,
      timestamp: Date.now()
    }
    // reference to firebase db
    let logs = firebase.database().ref().child('logs');
    // pushing obj to firebase db
    logs.push(log);
  }

  // simple function to handle btn clicks and run handleInput
  btnClick = val => {
    let value = val.target.value
    this.handleInput(value);
  }

  // simple function to handle key presses and run handleInput
  handleKeyPress = e => {
    if (!this.state.keyCodes.includes(e.keyCode)) return;
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
    let answer = math.eval(this.state.input);
    this.handleLog(answer);
    this.setState({display: answer});
    this.setState({input: ''})
  }

  handleLog = answer => {
    // builds equation string for db and logging
    let equation = this.state.input + '=' +answer;
    // creates unique uuid(v4) for each logged equation
    let newId = uuid();
    this.writeDataToDb(newId, equation);
  }

  // For equations that would run off the display
  handleLongInput = input => {
    let length = input.length;
    // if the input is loner than 15 characters...
    if (length > 15) {
      // create new display with ellipsis and last 12 characters of input string
      let newDisplay = "..."
      let cut = input.length - 12;
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
          {this.state.buttons.map(btn => 
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
          <Log logs={this.state.logs}/>
        </div>
      </div>
    );
  }
  
}

export default App;
