import React, { useState } from 'react';
import { withRouter } from 'react-router-dom'
import 'swagger-ui/dist/swagger-ui.css';
import dateformat from 'dateformat';
import urljoin from 'url-join';
import config from 'react-global-configuration';
import { List, Label, Button, Checkbox, Input } from 'semantic-ui-react';
import UploadSwagger from './UploadSwagger';
import axios from 'axios';

const colors = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black',]


function EditVersionInfo(props) {

  const { serviceId, unixtime, version, tag, enable, path } = props;
  const date = new Date(unixtime);
  const majorVersion = parseInt((version || '0').split('.')[0] || '0');
  const [state, setState] = useState({ isChanged: false, updateTagValue: tag, updateEnable: (enable === true)})


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
        setState({ ...state, isChanged: true, updateTagValue: value });
      }} />
    </List.Content>

    <List.Content floated='left' verticalAlign='middle'>
      <Checkbox toggle defaultChecked={enable === true} onChange={(e, { checked }) => {
        setState({ ...state, isChanged: true, updateEnable: checked });
      }} />
    </List.Content>

    <List.Content floated='left' verticalAlign='middle'>
      <Button disabled={state.isChanged === false} onClick={() => {
        // console.log(`call API${serviceId}/${version}`, state.updateTagValue, updateEnable, path);
        const body = {
          enable: state.updateEnable,
          path: path,
          tag: state.updateTagValue,
        };
        console.log('Update:', body);
        axios({
          method: 'patch',
          url: urljoin(config.get('api'), `/versions/${serviceId}/versions/${version}`),
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          data: body
        }).then(res => {
          setState({ ...state, isChanged: false});
        }).catch(err => {
          console.error('fetch error', err.response)
        })
      }}>Update</Button>
    </List.Content>
  </List.Item>);
}

function EditServiceName(props) {
  const {service} = props;
  const [name, setName] = useState(service.servicename)
  return (
    < Input 
      // action='Update'
      action={{
        icon: 'edit', onClick: (event, data) => { 
          console.log(name);
          axios({
            method: 'patch',
            url: urljoin(config.get('api'), `/services/${props.serviceId}`),
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            data: {
              servicename: name,
            }
          }).then(res => {
            console.log(res);
          }).catch(err => {
            console.error('fetch error', err.response)
          })
        }
      }}
      placeholder='Searvicename...'
      style={{ 'marginBottom': '30px' }}
      defaultValue={service.servicename}
      onChange = {(e,{value}) => {setName(value)}}
      />
  )
}


function EditVersionView(props){
  const { serviceId } = props.match.params;
  const { versions, service } = props;
  console.log(props);
  return (
    <div style={{minWidth:'800px'}}>
      <EditServiceName service={service} serviceId={serviceId}/>
      <UploadSwagger/>
      <List divided relaxed verticalAlign='middle'>
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


export default withRouter(EditVersionView);
