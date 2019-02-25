import React, { useState } from 'react';
import { withRouter } from 'react-router-dom'
import 'swagger-ui/dist/swagger-ui.css';
import dateformat from 'dateformat';
import urljoin from 'url-join';
import config from 'react-global-configuration';
import { Header, List, Label, Button, Checkbox, Input, Modal } from 'semantic-ui-react';
import UploadSwagger from './UploadSwagger';

const colors = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black',]


function EditVersionInfo(props) {

  const { serviceId, unixtime, version, tag, enable, path } = props;
  const date = new Date(unixtime);
  const majorVersion = parseInt((version || '0').split('.')[0] || '0');
  let updateTagValue = tag;
  let updateEnable = (enable === true);

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
        if (!(isChanged)) setIsChanged(true);
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
      <Button disabled={isChanged == false} onClick={() => {
        // console.log(`call API${serviceId}/${version}`, updateTagValue, updateEnable, path);
        const body = JSON.stringify({
          enable: updateEnable,
          path: path,
          tag: updateTagValue,
        });
        console.log('Update:', body);
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



function EditVersionView(props){
  const { serviceId } = props.match.params;
  const { versions } = props;

  return (
    <div style={{minWidth:'800px'}}>
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
