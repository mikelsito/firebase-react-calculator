import React from 'react';

export const List = props => (
  <div className="lists">
    <ul className="nes-list is-disc">
      {props.logs.map(log=> 
        <li key={log[1].id}>{log[1].eq}</li>
      )}
    </ul>
  </div>
)
