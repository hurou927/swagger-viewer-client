import React, { Component } from 'react';
import { Menu, Input, Sidebar} from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'
import 'semantic-ui-css/semantic.min.css'
// import LSCache from '../common/localStorageCache.js'


class Common extends Component {

  state = {
    isLoading: false,
    activeItem: 'closest',
    visible: false,
    filter: '',
  }

  handleHomeClick = (e, { name }) => { this.setState({ activeItem: name }); this.props.history.push(`/home`);}
  handleShowClick = (e, { name }) => this.setState({ visible: true, activeItem: name })
  handleSidebarHide = () => this.setState({ visible: false })
  handleHideClick = () => this.setState({ visible: false })
  handleInputStringChange = (e, { value }) => this.setState({ filter: value })

  // componentDidMount() {
  // }


  render() {
    
    const { servicies } = this.props;
    const { activeItem, visible, filter } = this.state

    return (
      <div>
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
