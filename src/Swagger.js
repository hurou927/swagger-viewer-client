import React, { Component } from 'react';
import SwaggerUi, { presets } from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import {withRouter} from 'react-router-dom'
import compareVersions from 'compare-versions';
import { Dropdown, Header, Menu, List ,Label, Button, Image, Checkbox, Input, Modal} from 'semantic-ui-react'
import config from 'react-global-configuration';
import urljoin from 'url-join';
import dateformat from 'dateformat';

// import LSCache from './localStorageCache.js'
// const lsCache = new LSCache();
// const serviceListCacheTimeSec = 60 * 60;


// serviceIdとversionはURLから得られる．da
// setStateやVersionが変わるたびにVersion情報のGetはしたくない
//  -> SeriviceIdが変更したときのみ
// setStateのたびにswaggerの表示をしたくない．

const colors = ['red','orange','yellow','olive','green','teal','blue','violet','purple','pink','brown','grey','black',]


class Swagger extends Component {

  state = { versions: [], options: [], activeItem: 'Spec.'} //versions and options are sorted by version always 

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

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
    return null
  }

  shouldComponentUpdate(nextProps, nextState) {
    
    const nextParams = nextProps.match.params;
    const oldParams = this.props.match.params;
    this._shouldFetchVersions = this._shouldFetchVersions || (oldParams.serviceId !== nextParams.serviceId);
    this._shouldUpdateSwagger = this._shouldUpdateSwagger || (oldParams.serviceId !== nextParams.serviceId) || (oldParams.version !== nextParams.version) || (this.state.versions.length === 0 && nextState.versions.length > 0)
      || (nextState.activeItem === 'Spec.' && this.state.activeItem !== 'Spec.');
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
    let swaggerURL;
    const { version } = this.props.match.params;
    const { versions, activeItem} = this.state;
    console.log('display swagger', activeItem);
    if (activeItem !== 'Spec.') {
      return;
    }

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

  
  settingsComponent(){
    const { serviceId } = this.props.match.params;
    const { versions } = this.state;

    return (
      <div>
        <Modal trigger={<Button attached='top'>Upload</Button>}>
          <Modal.Header>Select a Photo</Modal.Header>
          <Modal.Content image>
            <Image wrapped size='medium' src='https://react.semantic-ui.com/images/avatar/large/rachel.png' />
            <Modal.Description>
              <Header>Default Profile Image</Header>
              <p>We've found the following gravatar image associated with your e-mail address.</p>
              <p>Is it okay to use this photo?</p>
            </Modal.Description>
          </Modal.Content>
        </Modal>
        {/* <Button attached='top'>Upload</Button> */}
        <List divided relaxed>
          {
            versions.map((v) => {
              const date = new Date(v.lastupdated);
              const majorVersion = parseInt((v.version || '0').split('.')[0] || '0');
              let updateTagValue = v.tag;
              let updateEnable = (v.enable === true);
              let changed = false;
              return (
                <List.Item key={v.version}>
                  <List.Content floated='left' verticalAlign='middle' style={{ minWidth: '60px', textAlign: 'center' }}>
                    <Label circular color={colors[majorVersion % 10]}>{majorVersion}</Label>
                  </List.Content>
                  <List.Content floated='left' verticalAlign='middle' style={{ minWidth: '300px' }}>
                    <List.Header as='a'>{v.version}</List.Header>
                    <List.Description as='a'>{`Updated ${dateformat(date, 'yyyy/mm/dd HH:MM')}`}</List.Description>
                  </List.Content>

                  <List.Content floated='left' verticalAlign='middle'>
                    <Input placeholder='Tag...' defaultValue={v.tag} onChange={(e, { value }) => { changed=true;updateTagValue=value}}/>
                  </List.Content>

                  <List.Content floated='left' verticalAlign='middle'>
                    <Checkbox toggle defaultChecked={v.enable === true} onChange={(e, { checked }) => { changed=true;updateEnable=checked }}/>
                  </List.Content>

                  <List.Content floated='left' verticalAlign='middle'>
                    <Button onClick={() => { 
                      console.log(`call API${serviceId}/${v.version}`, updateTagValue, updateEnable, v.path);
                      if(changed){
                        //API Call
                      }
                    }}>Update</Button>
                  </List.Content>
                </List.Item>
              )
            })
          }
        </List>
      </div>
    );
  }


  render(){
    console.log('Swagger Render', this.state);
    const { serviceId} = this.props.match.params;
    const { versions, options, activeItem} = this.state;
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

      {/* <div style={{ 'maxWidth': '1000px', display: 'flex', 'flex-direction': 'column', 'justify-content': 'center' }}> */}
      {      
      <div>
        {(()=>{
          console.log('if..?',activeItem);
          if (activeItem === 'Edit'){
            return this.settingsComponent();
          }

          return (
            <div>
              <Dropdown
                placeholder='Versions' fluid search selection
                options={options}
                onChange={(e, { value }) => {
                  console.log(value);
                  this.props.history.push(`/servicies/${serviceId}/versions/${value}`);
                }}
              />
              <div id="swaggerContainer" />
            </div> 
          )
        })()}
      </div> }
      
      {/* {this.settingsComponent()} */}

      

    </div>;
  }
}


export default withRouter(Swagger);