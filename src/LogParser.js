import React, { Component } from 'react';
import Dropzone from 'react-dropzone';

import logo from './lenovo-logo.jpg';
import './LogParser.css';

const DropZoneStyle = {
  width: '80%',
  height: '80px',
  padding: '8px',
  margin: '8px',
  marginLeft: 'auto',
  marginRight: 'auto',
  textAlign: 'center',
  border: '2px dashed black',
  borderRadius: '10px',
};

class LogParser extends Component {
  constructor() {
    super()
    this.state = {
      acceptedFiles: [],
      rejectedFiles: []
    }
  }

  onDrop(acceptedFiles, rejectedFiles) {
    console.log('acceptedFiles', acceptedFiles);
    console.log('rejectedFiles', rejectedFiles);
    this.setState({
      acceptedFiles,
      rejectedFiles,
    });
  }

  render() {
    return (
      <div className="LogParser">
        <header className="LogParser-header">
          <img src={logo} className="LogParser-logo" alt="logo" />
          <h1 className="LogParser-title">Workstation Performance Team Log Parser</h1>
        </header>
        <div>
          <Dropzone style={DropZoneStyle} onDrop={this.onDrop.bind(this)}>
            <p>Drop log file(s) here or click to select files.</p>
            <button>Browse...</button>
          </Dropzone>
        </div>
        <div>
        <h3>Dropped files</h3>
          <ul>
            {
              this.state.acceptedFiles.map(f => <li key={f.name}>{f.name} - {f.size} bytes: <img src={f.preview} alt={f.name} /></li>)
            }
          </ul>
        </div>
      </div>
    );
  }
}

export default LogParser;
