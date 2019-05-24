import React from 'react';
import { List } from '../List/List'

export const Log = props => (
  <div className="nes-container with-title is-centered">
    <p className="title">CALCULATION LOG</p>
    <List logs={props.logs}/>
  </div>
)
