import React, { Component, useState } from 'react';
import SwaggerUi, { presets } from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import {withRouter} from 'react-router-dom'
import compareVersions from 'compare-versions';
import { Dropdown, Header, Menu, List ,Label, Button, Image, Checkbox, Input, Modal} from 'semantic-ui-react'
import config from 'react-global-configuration';
import urljoin from 'url-join';
import dateformat from 'dateformat';
import FileDrop from 'react-file-drop';
import './FileDrop.css'
const path = require('path');
const yaml = require('js-yaml');

// import LSCache from './localStorageCache.js'
// const lsCache = new LSCache();
// const serviceListCacheTimeSec = 60 * 60;


// serviceIdとversionはURLから得られる．da
// setStateやVersionが変わるたびにVersion情報のGetはしたくない
//  -> SeriviceIdが変更したときのみ
// setStateのたびにswaggerの表示をしたくない．

const colors = ['red','orange','yellow','olive','green','teal','blue','violet','purple','pink','brown','grey','black',]


function validateSwagger(spec) { // return version
  if (!spec.openapi) {
    return {isSuccess: false, message: 'not swagger'}
  }
  if ((!spec.info) || (!spec.info.version)) {
    return {isSuccess: false, message: 'missing version'}
  }
  const trimed = spec.info.version.trim();
  const splited = trimed.split('.');
  if (splited.length > 3 || splited.filter(s => isNaN(s)).length > 0) {
    return { isSuccess: false, message: 'version must be "x.y.z"(x,y and z is number)' }
  }
  return {isSuccess: true, version: trimed};
}


function UploadSwagger(props){
  // const styles = { border: '1px solid black', width: 600, color: 'black', padding: 20 };
  return (
    <div id="react-file-drop-demo" style={{ width: 400, height:400, border: '1px solid black', color: 'black', padding: 20 }}>
      <FileDrop onDrop={(files, event) => {
        const file = files[0];
        const ext = path.extname(file.name);
        if (! ['.yaml', '.yml', '.json'].includes(ext)){
          return;
        }
        const reader = new FileReader();
        reader.onloadend = (e) => {
          // console.log(e.target.result)
          let spec;
          if (['.yaml', '.yml'].includes(ext)){
            spec = yaml.safeLoad(e.target.result);
          }else{
            spec = JSON.parse(e.target.result);
          }
          const result = validateSwagger(spec);
          if (result.isSuccess !== true) {
            console.log(result.message);
            return
          }
          console.log('version',result);
        }
        reader.readAsText(file);
      }}>
        Drop some files here!
      </FileDrop>
    </div >
  );
}



function EditVersionInfo(props) {

  const {serviceId, unixtime, version, tag, enable, path} = props;
  const date = new Date(unixtime);
  const majorVersion = parseInt((version || '0').split('.')[0] || '0');
  let updateTagValue = tag;
  let updateEnable = (enable === true);
  // let changed = false;

  const [isChanged, setIsChanged] = useState(false);


  return (<List.Item key={version}>
    <List.Content floated='left' verticalAlign='middle' style={{ minWidth: '60px', textAlign: 'center' }}>
      <Label circular color={colors[majorVersion % 10]}>{majorVersion}</Label>
    </List.Content>
    <List.Content floated='left' verticalAlign='middle' style={{ minWidth: '300px' }}>
      <List.Header as='a'>{version}</List.Header>
      <List.Description as='a'>{`Updated ${dateformat(date, 'yyyy/mm/dd HH:MM')}`}</List.Description>
    </List.Content>

    <List.Content floated='left' verticalAlign='middle'>
      <Input placeholder='Tag...' defaultValue={tag} onChange={(e, { value }) => { 
        if(!(isChanged)) setIsChanged(true); 
        updateTagValue = value;
      }} />
    </List.Content>

    <List.Content floated='left' verticalAlign='middle'>
      <Checkbox toggle defaultChecked={enable === true} onChange={(e, { checked }) => { 
        if (!isChanged) setIsChanged(true); 
        updateEnable = checked 
      }} />
    </List.Content>

    <List.Content floated='left' verticalAlign='middle'>
      <Button disabled={isChanged==false} onClick={() => {
        // console.log(`call API${serviceId}/${version}`, updateTagValue, updateEnable, path);
        const body = JSON.stringify({
          enable: updateEnable,
          path: path,
          tag: updateTagValue,
        });
        console.log('Update:',body);
        fetch(urljoin(config.get('api'), `/versions/${serviceId}/versions/${version}`), {
          method: 'PATCH',
          cors: 'true',
          body: body,
        }).then(response => {
          // console.log(response.status);
          setIsChanged(false);
        }).catch(error => {
          console.error('fetch error', error)
        });
         
      }}>Update</Button>
    </List.Content>
  </List.Item>);
}









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
          return { key: v.version, text: v.version, value: v.version, description: v.tag }
        })
        this.setState({ versions: versions.Items, options: options });
      }).catch(error => {
        console.error('fetch error', error)
      });

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
          <Modal.Header>Upload Swagger</Modal.Header>
          <Modal.Content image>
            {/* <Image wrapped size='medium' src='https://react.semantic-ui.com/images/avatar/large/rachel.png' /> */}
            <UploadSwagger />
            <Modal.Description>
              <Header>Default Profile Image</Header>
              <p>We've found the following gravatar image associated with your e-mail address.</p>
              <p>Is it okay to use this photo?</p>
            </Modal.Description>
          </Modal.Content>
        </Modal>
        {/* <UploadSwagger /> */}
        <List divided relaxed>
          {
            versions.map((v) => {
              return <EditVersionInfo 
                serviceId={serviceId} 
                unixtime={v.lastupdated} 
                tag={v.tag} 
                version={v.version} 
                enable={v.enable} 
                path={v.path}
                key={v.version}
                />
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
      
    </div>;
  }
}


export default withRouter(Swagger);