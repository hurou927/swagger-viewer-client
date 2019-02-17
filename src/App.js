import React, { Component } from 'react';
// import { Menu, Input, Sidebar, Segment, Icon, Header, Image, Button, Search } from 'semantic-ui-react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import 'semantic-ui-css/semantic.min.css'
import Common from './Common'
import Swagger from './Swagger'
import LSCache from './localStorageCache.js'
import config from 'react-global-configuration';
import urljoin from 'url-join'
const lsCache = new LSCache();
const serviceListCacheTimeSec = 60 * 60;

function Home(props) {
  return <div>Home</div>;
}

class App extends Component {

  state = {servicies: [],}

  componentDidMount() {

    const cachedServicies = lsCache.get('servicies', serviceListCacheTimeSec)
    // console.log(cachedServicies, lsCache.get('servicies'));
    if (cachedServicies) {
      console.log('[Service] Use cache in LocalStorage');
      this.setState({ servicies: cachedServicies.value.Items.sort((a, b) => (a.servicename > b.servicename ? 1 : -1)) })
    } else {
      console.log('[Service] Not use cache');
      fetch(urljoin(config.get('api'), '/services'), {
        method: 'GET',
        cors: 'true',
      }).then(response => response.json())
        .then(servicies => {
          lsCache.put('servicies', servicies);
          this.setState({ servicies: servicies.Items.sort((a, b) => (a.servicename > b.servicename ? 1 : -1)) })
        }).catch(error => {
          console.error('fetch error', error)
        });
        
    }
    
    // fetch('https://s3-ap-northeast-1.amazonaws.com/swagger-repository-test/swagger/auth/swagger0_0_1.yaml', {
    //   method: 'GET',
    //   // cors: 'true',
    // }).then(response => response.text())
    //   .then(servicies => {
    //     console.log(servicies);
    //   }).catch(error => {
    //     console.error('fetch error', error)
    //   })
  }



  render() {
  
    return (
      <div style={{ 'padding': '0 20px 0 20px' }}>
        {/* TopBar */}
      
        <BrowserRouter>
          <div id='browserRouter'>
            <Common servicies={this.state.servicies}/>
            <Switch>
              <Route exact path='/' component={()=>(<Home servicies={this.state.servicies} />)} />
              <Route path='/servicies/:serviceId/versions/:version' component={() => (<Swagger servicies={this.state.servicies} />)} />
              <Route path='/home' component={() => (<Home servicies={this.state.servicies} />)} />
            </Switch>
          </div>
        </BrowserRouter>
        

    </div>
    )
  }
}

export default App;
