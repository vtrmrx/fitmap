import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './ui.css'

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      roundSize: false,
      roundPosition: false
    }
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange(event) {
    const target = event.target
    const value = target.checked
    const name = target.name

    this.setState({
      [name]: value
    });
  }

  onRasterize = () => {
    const data = {
      type: 'RASTERIZE',
      roundSize: this.state.roundSize,
      roundPosition: this.state.roundPosition,
      roundPaths: false
    }
    console.log("send rasterize command")
    parent.postMessage({pluginMessage: data}, '*')
  }

  onCancel = () => {
    parent.postMessage({ pluginMessage: { type: 'CLOSE' } }, '*')
  }

  render() {
    return <div>
      <h1>Fitmap</h1>
      <label>
        Round size
        <input
          name="roundSize"
          type="checkbox"
          checked={this.state.roundSize}
          onChange={this.handleInputChange} />
      </label>
      <label>
        Round position
        <input
          name="roundPosition"
          type="checkbox"
          checked={this.state.roundPosition}
          onChange={this.handleInputChange} />
      </label>
      <button id="rasterize" onClick={this.onRasterize}>Rasterize</button>
      <button onClick={this.onCancel}>Cancel</button>
    </div>
  }
}

ReactDOM.render(<App />, document.getElementById('react-page'))
