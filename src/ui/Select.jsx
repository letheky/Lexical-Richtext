import './Select.css';

import * as React from 'react';

export default function Select({
  children,
  label,
  className,
  ...other
}){
  return (
    <div className="Input__wrapper">
      <label style={{marginTop: '-1em'}} className="Input__label">
        {label}
      </label>
      <select {...other} className={className || 'select'}>
        {children}
      </select>
    </div>
  );
}
