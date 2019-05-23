import React from 'react';

export const List = props => (
  <div className="lists">
    <ul className="nes-list is-disc">
      {props.logs.map(log=> 
        <li key={log.id}>{log.eq}</li>
      )}
    </ul>
  </div>
)
