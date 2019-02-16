import React, { Component } from 'react';
import SwaggerUi, { presets } from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import {withRouter} from 'react-router-dom'
import compareVersions from 'compare-versions';
import { Dropdown } from 'semantic-ui-react'
import LSCache from './localStorageCache.js'

// const lsCache = new LSCache();


class Swagger extends Component {

  state = {versions: [], options: []}

  componentDidMount() {
    console.log('DidMount');
    const versions = { "Items": [{ "id": "66a36e77-fd00-3779-8097-17841f998f4d", "version": "0.0.1", "path": "swagger/auth/swagger0_0_1.yaml", "lastupdated": 1550318102190, "enable": true, "tag": "dev" }, { "id": "66a36e77-fd00-3779-8097-17841f998f4d", "version": "0.0.2", "path": "swagger/auth/swagger0_0_2.yaml", "lastupdated": 1550318102190, "enable": true, "tag": "prod" }, { "id": "66a36e77-fd00-3779-8097-17841f998f4d", "version": "1.0.0", "path": "swagger/auth/swagger1_0_0.yaml", "lastupdated": 1550318102190, "enable": true, "tag": "no" }] }


    versions.Items = versions.Items.sort((a, b) => compareVersions(b.version, a.version))
    const options = versions.Items.map((v, i) => { 
      return { key: v.version, text: v.version, value: v.version, description: i === 0 ? `${v.tag}|latest` : v.tag }
    })

    this.setState({ versions: versions.Items, options: options })
  }
  componentDidMount() {
    this.displaySwagger();
  }

  componentDidUpdate() {
    this.displaySwagger();
  }

  displaySwagger() {
    let swaggerURL = 'http://petstore.swagger.io/v2/swagger.json';
    SwaggerUi({
      dom_id: '#swaggerContainer',
      url: swaggerURL,
      spec: this.props.spec,
      presets: [presets.apis]
    });
  }

  render(){
    console.log('Swagger');
    const { serviceId, version } = this.props.match.params;
    const {versions, options} = this.state;
    return <div>
      <p>Swagger</p>
      <Dropdown placeholder='Versions' fluid search selection options={options} onChange={(e,{value})=>{console.log(value)}} />
      <p>{`ServiceId:${serviceId}`}</p>
      <p>{`version:${version}`}</p>
      <p>{`${versions}`}</p>
      <div id="swaggerContainer" />
    </div>;
  }
}


export default withRouter(Swagger);