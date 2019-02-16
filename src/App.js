import React, { Component } from 'react';
// import { Menu, Input, Sidebar, Segment, Icon, Header, Image, Button, Search } from 'semantic-ui-react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import 'semantic-ui-css/semantic.min.css'
import Common from './Common'
import Swagger from './Swagger'

function Home(props) {
  console.log(props);
  return <div>Home</div>;
}




class App extends Component {

  render() {
  
    return (
      <div style={{ 'padding': '0 20px 0 20px' }}>
        {/* TopBar */}
      
        <BrowserRouter>
          <div id='browserRouter'>
            <Common />
            <Switch>
              <Route exact path='/' component={Home} />
              <Route path='/servicies/:serviceId/versions/:version' component={Swagger} />
              <Route path='/home' component={Home} />
            </Switch>
          </div>
        </BrowserRouter>
        

    </div>
    )
  }
}

export default App;
