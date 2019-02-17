import React, { Component } from 'react';
import SwaggerUi, { presets } from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import {withRouter} from 'react-router-dom'
import compareVersions from 'compare-versions';
import { Dropdown, Header } from 'semantic-ui-react'
import config from 'react-global-configuration';
import urljoin from 'url-join'
// import LSCache from './localStorageCache.js'
// const lsCache = new LSCache();
// const serviceListCacheTimeSec = 60 * 60;


// serviceIdとversionはURLから得られる．
// setStateやVersionが変わるたびにVersion情報のGetはしたくない
//  -> SeriviceIdが変更したときのみ
// setStateのたびにswaggerの表示をしたくない．


class Swagger extends Component {

  state = { versions: [], options: []} //versions and options are sorted by version always 
  
  _shouldFetchVersions = true;
  _shouldUpdateSwagger = true;

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
        const options = versions.Items.map((v, i) => {
          return { key: v.version, text: v.version, value: v.version, description: i === 0 ? `${v.tag}|latest` : v.tag }
        })
        // this._shouldFetchVersions = false;
        this.setState({ versions: versions.Items, options: options });
      }).catch(error => {
        console.error('fetch error', error)
      });
      // const versions = { "Items": [{ "id": "66a36e77-fd00-3779-8097-17841f998f4d", "version": "0.0.1", "path": "swagger/auth/swagger0_0_1.yaml", "lastupdated": 1550318102190, "enable": true, "tag": "dev" }, { "id": "66a36e77-fd00-3779-8097-17841f998f4d", "version": "0.0.2", "path": "swagger/auth/swagger0_0_2.yaml", "lastupdated": 1550318102190, "enable": true, "tag": "prod" }, { "id": "66a36e77-fd00-3779-8097-17841f998f4d", "version": "1.0.0", "path": "swagger/auth/swagger1_0_0.yaml", "lastupdated": 1550318102190, "enable": true, "tag": "no" }] }
  }


  componentDidMount() {
    if (this._shouldFetchVersions === true) {
      this._shouldFetchVersions = false;
      this.fetchVersionData();
    }

    if (this._shouldUpdateSwagger === true) {
      this._shouldUpdateSwagger = false;
      this.displaySwagger();
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextParams = nextProps.match.params;
    if (nextParams.serviceId !== prevState.serviceId) {
      console.log('getDerivedStateFromProps: initialize versions and options');
      return { versions: [], options: [], serviceId: nextParams.serviceId}
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    
    const nextParams = nextProps.match.params;
    const oldParams = this.props.match.params;
    this._shouldFetchVersions = this._shouldFetchVersions || (oldParams.serviceId !== nextParams.serviceId);
    this._shouldUpdateSwagger = this._shouldUpdateSwagger || (oldParams.serviceId !== nextParams.serviceId) || (oldParams.version !== nextParams.version) || (this.state.versions.length === 0 && nextState.versions.length > 0);
    // versionsのフェッチが終わったらSwaggerの表示を行う．
    console.log('shouldComponentUpdate?', this._shouldFetchVersions, this._shouldUpdateSwagger );
    return true;
  }


  componentDidUpdate() {
    if (this._shouldFetchVersions === true){
      this._shouldFetchVersions = false;
      this.fetchVersionData();
    }
    
    if (this._shouldUpdateSwagger === true){
      this._shouldUpdateSwagger = false;
      this.displaySwagger();
    }
  }

  displaySwagger() {
    console.log('fetch swagger file!!');
    // let swaggerURL = 'https://s3-ap-northeast-1.amazonaws.com/swagger-repository-test/swagger/auth/swagger0_0_1.yaml';
    let swaggerURL;
    const { version } = this.props.match.params;
    const { versions} = this.state;
    let versionSettings;
    if(versions.length > 0) {
      if(version == 'latest'){
        versionSettings = versions[0];
      } else {
        versionSettings = versions.filter(v => v.version === version)[0];
      }
      swaggerURL = urljoin(config.get('swagger-bucket'), versionSettings.path); 
    }


    SwaggerUi({
      dom_id: '#swaggerContainer',
      url: swaggerURL,
      spec: this.props.spec,
      presets: [presets.apis]
    });

  }

  render(){
    console.log('Swagger Render', this.state);
    const { serviceId} = this.props.match.params;
    const {options} = this.state;
    const { servicies } = this.props;
    let service = undefined;
    if (servicies){
      service = servicies.filter(service => service.id === serviceId)[0]
    }


    return <div>
      {service ? <Header as='h1'>{service.servicename}</Header> : undefined}
      <Dropdown 
        placeholder='Versions' fluid search selection 
        options={options} 
        onChange={(e, { value }) => { 
          console.log(value);
          this.props.history.push(`/servicies/${serviceId}/versions/${value}`);
        }} 
      />
      <div id="swaggerContainer" />
    </div>;
  }
}


export default withRouter(Swagger);