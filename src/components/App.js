import React, { Component } from 'react';
// import { Menu, Input, Sidebar, Segment, Icon, Header, Image, Button, Search } from 'semantic-ui-react'
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom'
import 'semantic-ui-css/semantic.min.css'
import Common from './Common'
import Swagger from './Swagger'
import LSCache from '../common/localStorageCache.js'
import ServiceListContext from '../contexts/ServiceListContext'
import config from 'react-global-configuration';
import urljoin from 'url-join'
import AddService from './AddService'
import { Feed } from 'semantic-ui-react'
const lsCache = new LSCache();
const serviceListCacheTimeSec = 60 * 60;

function Home(props) {
  return <div>
    <p>Home(test)</p>
    <Feed>
      <Feed.Event
        icon='pencil'
        date='Today'
        summary="You posted on your friend Stevie Feliciano's wall."
      />

      <Feed.Event>
        <Feed.Label icon='pencil' />
        <Feed.Content>
          <Feed.Date>Today</Feed.Date>
          <Feed.Summary>
            You posted on your friend <Link to="/servicies/66a36e77-fd00-3779-8097-17841f998f4d/versions/latest">Page A</Link> wall.
        </Feed.Summary>
        </Feed.Content>
      </Feed.Event>
    </Feed>
  </div>;
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
  }



  render() {
    const {servicies} = this.state;
    return (
      <div style={{ 'padding': '0 20px 0 20px' }}>
        {/* TopBar */}
        <ServiceListContext.Provider value={servicies}>
          <BrowserRouter>
            <div id='browserRouter'>
                <Common servicies={servicies}/>
              <Switch>
                <Route exact path='/' component={()=>(<Home servicies={this.state.servicies} />)} />
                <Route path='/servicies/:serviceId/versions/:version' component={() => (<Swagger servicies={this.state.servicies} />)} />
                <Route path='/create-service' component={() => (<AddService servicies={this.state.servicies} />)} />
                <Route path='/home' component={() => (<Home servicies={this.state.servicies} />)} />
              </Switch>
            </div>
          </BrowserRouter>
        </ServiceListContext.Provider>

      </div>
    )
  }
}

export default App;
