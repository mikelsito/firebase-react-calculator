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
      input: '...',
      buttons: [1,2,3,'+',4,5,6,'-',7,8,9,'*','.',0,'=','/'],
      logs: []
    }
  }

  componentDidMount() {
    this.initializeData();
  }  

  initializeData = () => {
    let rootRef = firebase.database().ref().child('/');
    let logsRef = rootRef.child('logs').limitToLast(10);
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

  writeDataToDb = (uuid, eq) => {
    let log = {
      id: uuid,
      eq: eq
    }
    let logs = firebase.database().ref().child('logs');
    logs.push(log);
  }

  handleLog = answer => {
    let equation = this.state.input + '=' +answer;
    let newId = uuid();
    this.writeDataToDb(newId, equation);
  }

  handleEqual = () => {
    try { 
      math.eval(this.state.input) 
    }
    catch(error) {
      this.setState({
        input: 'ERROR!'
      });
      return;
    }
    let answer = math.eval(this.state.input);
    this.handleLog(answer);
    this.setState({input: '...'});
  }

  btnClick = val => {
    let value = val.target.value
    if (value === '=') { 
      return this.handleEqual()
    }
    if (this.state.input === '...') {
      this.setState({
        input: value
      })
    }
    else if (this.state.input === 'ERROR!') {
      this.setState({
        input: value
      })
    }
    else {
      this.setState({
        input: this.state.input + value
      });
      
    }
  }

  handleLongInput = input => {
    let length = input.length;
    if (length > 15) {
      let cut = input.length - 15;
      console.log(input.slice(cut))
    }
  }

  render( ) {
    return (
      <div className='app'>
        <div className='header'>
          <Header/>
        </div>
        <div className='calculator nes-container is-rounded'>
          
        <div className='input'>
          <Input input={this.state.input}></Input>
        </div>

        <div className='square-btns'>
          {this.state.buttons.map(btn => 
            <Button btnClick={this.btnClick} key={btn}>
              {btn}
            </Button>
          )}
        </div>

        <div className='clear'>
          <Clear handleClear={() => this.setState({input: '...'})}/>
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
