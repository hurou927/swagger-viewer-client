import React, { Component, useState, useMemo, useEffect } from 'react';
import 'swagger-ui/dist/swagger-ui.css';
import {withRouter} from 'react-router-dom'
import compareVersions from 'compare-versions';
import { Header, Menu} from 'semantic-ui-react'
import config from 'react-global-configuration';
import urljoin from 'url-join';
import './FileDrop.css'
import SwaggerView from './SwaggerView'
import EditVersionView from './EditVersionView';
// import fetch from 'node-fetch';

function ViewComponent(props){
  const { versions, activeItem } = this.props;
  if (activeItem === 'Edit') {
    return <EditVersionView versions={versions} />
  } else {
    return <SwaggerView versions={versions} />
  }
}

function Swagger (props) {
  const [versions, setVersions] = useState([]);
  const [activeItem, setActiveItem] = 'Spec.';
  // const versions = [];
  const { serviceId } = props.match.params;

  const { servicies } = props;
  console.log(props);
  let service = undefined;
  if (servicies) {
    service = servicies.filter(service => service.id === serviceId)[0]
  }
  
  // useEffect(() => {
  //   fetch(urljoin(config.get('api'), `/versions/${serviceId}`), {
  //     method: 'GET',
  //     cors: 'true',
  //   }).then(response => response.json())
  //     .then(versions => {
  //       versions.Items = versions.Items.sort((a, b) => compareVersions(b.version, a.version))
  //       setVersions(versions.Items);
  //     }).catch(error => {
  //       console.error('fetch error', error)
  //     }); 
  // });
  
  return <div>
    {/* {service ? <Header as='h1'>{service.servicename}</Header> : undefined} */}

    <Menu pointing secondary>
      <Menu.Item name='Spec.' active={activeItem === 'Spec.'} onClick={(e, { name }) => setActiveItem(name)} />
      <Menu.Item name='Edit' active={activeItem === 'Edit'} onClick={(e, { name }) => setActiveItem(name)}/>
    </Menu>

    {/* <ViewComponent activeItem={activeItem} versions={versions}/> */}

  </div>;
}


class Swagger2 extends Component {

  state = { versions: [], activeItem: 'Spec.'} //versions and options are sorted by version always 

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  _shouldFetchVersions = true;
  // _shouldUpdateSwagger = true;

  fetchVersionData(){
    const { serviceId } = this.props.match.params;
    // if (this._shouldFetchVersions === true) {
    console.log('fetch service data(versionList)');
    fetch(urljoin(config.get('api'), `/versions/${serviceId}`), {
      method: 'GET',
      cors: 'true',
    }).then(response => response.json())
      .then(versions => {
        // lsCache.put(`versions.${serviceId}`, versions);
        versions.Items = versions.Items.sort((a, b) => compareVersions(b.version, a.version))

        this.setState({ versions: versions.Items});
      }).catch(error => {
        console.error('fetch error', error)
      });

  }


  componentDidMount() {
    if (this._shouldFetchVersions === true) {
      this._shouldFetchVersions = false;
      this.fetchVersionData();
    }

  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextParams = nextProps.match.params;
    if (nextParams.serviceId !== prevState.serviceId) {
      console.log('getDerivedStateFromProps: initialize versions and options');
      return { versions: [], serviceId: nextParams.serviceId}
    }
    return null
  }

  shouldComponentUpdate(nextProps, nextState) {
    
    const nextParams = nextProps.match.params;
    const oldParams = this.props.match.params;
    this._shouldFetchVersions = this._shouldFetchVersions || (oldParams.serviceId !== nextParams.serviceId);

    console.log('shouldComponentUpdate?', this._shouldFetchVersions, this._shouldUpdateSwagger );
    return true;
  }


  componentDidUpdate() {
    if (this._shouldFetchVersions === true){
      this._shouldFetchVersions = false;
      this.fetchVersionData();
    }
  
  }

  ViewComponent(){
    const { versions, activeItem } = this.state;
    if (activeItem === 'Edit') {
      return <EditVersionView versions={versions} />
    } else {
      return <SwaggerView versions={versions} />
    }
  }

  render(){
    console.log('Swagger Render', this.state);
    const { serviceId} = this.props.match.params;
    const { activeItem} = this.state;
    console.log(this.state);
    const { servicies } = this.props;
    let service = undefined;
    if (servicies){
      service = servicies.filter(service => service.id === serviceId)[0]
    }


    return <div>
      {service ? <Header as='h1'>{service.servicename}</Header> : undefined}
      
      <Menu pointing secondary>
        <Menu.Item name='Spec.' active={activeItem === 'Spec.'} onClick={this.handleItemClick} />
        <Menu.Item
          name='Edit'
          active={activeItem === 'Edit'}
          onClick={this.handleItemClick}
        />
      </Menu>

      { this.ViewComponent() }
    
    </div>;
  }
}


export default withRouter(Swagger);