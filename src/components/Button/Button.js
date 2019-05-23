import React from 'react';

const btnType = val => {
  let btnClass;
  switch (val) {
    case '=':
      btnClass = 'is-success';
      break;
    case '+':
      btnClass = 'is-warning';
      break;
    case '-':
      btnClass = 'is-warning';
      break;
    case '*':
      btnClass = 'is-warning';
      break;
    case '/':
      btnClass = 'is-warning';
      break;
    default:
      btnClass = 'is-primary';
  }
  return btnClass;
}

export const Button = props => (
  <button className={`btn nes-btn ${btnType(props.children)}`} type='button' onClick={props.btnClick} value={props.children}>
    {props.children}
  </button>
)