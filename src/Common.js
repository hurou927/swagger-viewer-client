import React, { Component } from 'react';
import { Menu, Input, Sidebar} from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'
import 'semantic-ui-css/semantic.min.css'
import LSCache from './localStorageCache.js'


const lsCache = new LSCache();
const serviceListCacheTimeSec = 60 * 60;

class Common extends Component {
  state = {
    isLoading: false,
    activeItem: 'closest',
    visible: false,
    servicies: [],
    filter: '',
  }

  handleHomeClick = (e, { name }) => { this.setState({ activeItem: name }); this.props.history.push(`/home`);}
  handleShowClick = (e, { name }) => this.setState({ visible: true, activeItem: name })
  handleSidebarHide = () => this.setState({ visible: false })
  handleHideClick = () => this.setState({ visible: false })
  handleInputStringChange = (e, { value }) => this.setState({ filter: value })

  componentDidMount() {

    const cachedServicies = lsCache.get('servicies', serviceListCacheTimeSec)
    // console.log(cachedServicies, lsCache.get('servicies'));
    if ( cachedServicies ){
      console.log('Use ServiceList cached in LocalStorage');
      this.setState({ servicies: cachedServicies.value.Items.sort((a, b) => (a.servicename > b.servicename ? 1 : -1)) })
    } else {
      console.log('Not use cache');
      fetch('https://api.hurouap.com/swagger/services', {
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
    // const servicies = { "Items": [{ "id": "66a36e77-fd00-3779-8097-17841f998f4d", "servicename": "auth", "latestversion": "1.0.0", "lastupdated": 1549282673273 }, { "id": "7876153a-da82-36a2-8c48-647e87674701", "servicename": "audit", "latestversion": "1.0.0", "lastupdated": 1549282673273 }, { "id": "1833d850-2df5-11e9-a6d3-f6d4de7c51b2", "servicename": "swagger", "latestversion": "1.0.0", "lastupdated": 11111 }, { "id": "acb1fad6-2df4-11e9-ad77-429f56b5bbf9", "servicename": "swagger", "latestversion": "1.0.0", "lastupdated": 11111 }, { "id": "524f25fe-b711-3ae8-b7b8-93fffaaeb4e0", "servicename": "ess", "latestversion": "1.0.0", "lastupdated": 1549282673273 }, { "id": "b93026e6-2df4-11e9-ad77-429f56b5bbf9", "servicename": "swagger", "latestversion": "1.0.0", "lastupdated": 11111 }, { "id": "d42f649f-2df5-11e9-80d2-e69a89a681d8", "servicename": "swagger112", "latestversion": "1.0.0", "lastupdated": 11111 }] }
    
  }



  render() {

    const { activeItem, visible, servicies, filter } = this.state

    return (
      <div style={{ 'padding': '0 20px 0 20px' }}>
        {/* TopBar */}
        <div>
          <Menu text size='massive'>
            <Menu.Item header>Swagger Viewer</Menu.Item>
            <Menu.Item
              name='Home'
              active={activeItem === 'closest'}
              onClick={this.handleHomeClick}
            />
            <Menu.Item
              name='Servicies'
              active={activeItem === 'mostComments'}
              onClick={this.handleShowClick}
            />
            <Menu.Menu position='right'>
              <Menu.Item>
                <Input icon='search' placeholder='Search...' />
              </Menu.Item>
            </Menu.Menu>
          </Menu>
        </div>
        {/* SideBar */}
        <div>
          <Sidebar
            as={Menu}
            animation='overlay'
            icon='labeled'
            inverted
            onHide={this.handleSidebarHide}
            vertical
            visible={visible}
            width='thin'
          >

            <Menu.Item>
              <Input focus placeholder='Search...' onChange={this.handleInputStringChange} />
            </Menu.Item>
            {
              servicies.map((s, v) => {
                if (s.servicename.includes(filter))
                  return <Menu.Item as='a' key={v} onClick={() => { this.setState({ visible: false }); this.props.history.push(`/servicies/${s.id}/versions/latest`); }}> {s.servicename} </Menu.Item>
              })
            }
          </Sidebar>
        </div>

      </div>
    )
  }
}

export default withRouter(Common);
