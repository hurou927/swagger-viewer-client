import React, { useState, useMemo} from 'react';
import 'swagger-ui/dist/swagger-ui.css';
import {withRouter} from 'react-router-dom'
import compareVersions from 'compare-versions';
import { Menu} from 'semantic-ui-react'
import config from 'react-global-configuration';
import urljoin from 'url-join';
import '../style/FileDrop.css'
import SwaggerView from './SwaggerView'
import EditVersionView from './EditVersionView';
import axios from 'axios';
// import fetch from 'node-fetch';

function ViewComponent(props){
  const { versions, activeItem, servicies, service } = props;
 
  if (activeItem === 'Edit') {
    return <EditVersionView versions={versions} servicies={servicies} service={service}/>
  } else {
    return <SwaggerView versions={versions} servicies={servicies} service={service}/>
  }
}

function Swagger (props) {
  const [versions, setVersions] = useState([]);
  const [activeItem, setActiveItem] = useState('Spec.');
  const { serviceId } = props.match.params;

  const { servicies } = props;
  const service = servicies.filter(v => v.id === serviceId)[0]
  
  useMemo(() => {
    console.log('fetch service version list');
    axios({
      method: 'get',
      url: urljoin(config.get('api'), `/versions/${serviceId}`),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    }).then(res => {
      const versions = res.data;
      versions.Items = versions.Items.sort((a, b) => compareVersions(b.version, a.version))
      setVersions(versions.Items);
    }).catch(err => {
      console.log(err.response);
      setVersions([]);
    })
  }, [props.match.params.serviceId]);

  return <div>
    {/* {service ? <Header as='h1'>{service.servicename}</Header> : undefined} */}

    <Menu pointing secondary>
      <Menu.Item name='Spec.' active={activeItem === 'Spec.'} onClick={(e, { name }) => setActiveItem(name)} />
      <Menu.Item name='Edit' active={activeItem === 'Edit'} onClick={(e, { name }) => setActiveItem(name)}/>
    </Menu>

    <ViewComponent activeItem={activeItem} versions={versions} servicies={servicies} service={service}/>

  </div>;
}



export default withRouter(Swagger);