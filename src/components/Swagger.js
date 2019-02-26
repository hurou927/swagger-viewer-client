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
// import fetch from 'node-fetch';

function ViewComponent(props){
  const { versions, activeItem, servicies } = props;
  if (activeItem === 'Edit') {
    return <EditVersionView versions={versions} servicies={servicies} />
  } else {
    return <SwaggerView versions={versions} servicies={servicies}/>
  }
}

function Swagger (props) {
  const [versions, setVersions] = useState([]);
  const [activeItem, setActiveItem] = useState('Spec.');
  const { serviceId } = props.match.params;

  const { servicies } = props;
  // let service = undefined;
  // if (servicies) {
  //   service = servicies.filter(service => service.id === serviceId)[0]
  // }
  
  useMemo(() => {
    console.log('fetch service version list');
    fetch(urljoin(config.get('api'), `/versions/${serviceId}`), {
      method: 'GET',
      cors: 'true',
    }).then(response => response.json())
      .then(versions => {
        versions.Items = versions.Items.sort((a, b) => compareVersions(b.version, a.version))
        // console.log(versions.Items);
        setVersions(versions.Items);
      }).catch(error => {
        console.error('fetch error', error)
      }); 
  }, [props.match.params.serviceId]);

  return <div>
    {/* {service ? <Header as='h1'>{service.servicename}</Header> : undefined} */}

    <Menu pointing secondary>
      <Menu.Item name='Spec.' active={activeItem === 'Spec.'} onClick={(e, { name }) => setActiveItem(name)} />
      <Menu.Item name='Edit' active={activeItem === 'Edit'} onClick={(e, { name }) => setActiveItem(name)}/>
    </Menu>

    <ViewComponent activeItem={activeItem} versions={versions} service={servicies}/>

  </div>;
}



export default withRouter(Swagger);