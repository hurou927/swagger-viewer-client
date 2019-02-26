
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom'
import urljoin from 'url-join';
import config from 'react-global-configuration';
import FileDrop from 'react-file-drop';
import yaml from 'js-yaml';
import path from 'path';
import { Header, List, Button, Modal } from 'semantic-ui-react';


function validateSwagger(spec) { // return version
  if (!spec.openapi) {
    return { isSuccess: false, message: 'not swagger' }
  }
  if ((!spec.info) || (!spec.info.version)) {
    return { isSuccess: false, message: 'missing version' }
  }
  const trimed = spec.info.version.trim();
  const splited = trimed.split('.');
  if (splited.length > 3 || splited.filter(s => isNaN(s)).length > 0) {
    return { isSuccess: false, message: 'version must be "x.y.z"(x,y and z is number)' }
  }
  return { isSuccess: true, version: trimed };
}


const FileDescription = (props) => {
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const {name, size, version, contents, serviceId} = props;
  if (props.enable === true) {
    return <div>
      <List>
        <List.Item>
          <List.Icon name='file alternate outline' />
          <List.Content>file {name}</List.Content>
        </List.Item>
        <List.Item>
          <List.Icon name='resize vertical' />
          <List.Content>size {size} [Bytes]</List.Content>
        </List.Item>
        <List.Item>
          <List.Icon name='angle double up' />
          <List.Content>
            <List.Content>ver. {version}</List.Content>
          </List.Content>
        </List.Item>
        <List.Item>
          <List.Icon name='sync' />
          <List.Content>
            <List.Content>
              {/* <Header as='h4' color='green'>Green</Header> */}
              {
                (() => {
                  if (uploadSuccess === true) {
                    return <Header as='h4' color='green'>Success</Header>
                  } else if (uploadSuccess === false) {
                    return <Header as='h4' color='red'>Error</Header>
                  }
                  return <Header as='h4' color='green'></Header>
                })()
              }
            </List.Content>
          </List.Content>
        </List.Item>
      </List>
      {/* <Modal.Actions> */}
        <Button attached='top' onClick={()=>{
          // console.log(props);
          fetch(urljoin(config.get('api'), `/versions/${serviceId}`), {
            method: 'PUT',
            cors: 'true',
            body: JSON.stringify({
              enable: true,
              format: path.extname(name)==='.json' ? 'json' : 'yml',
              tag: '',
              contents,
            }),
          }).then(response => {
            return response.json()
          }).then(response => {
            console.log(response);
            setUploadSuccess(true)
          }).catch(error => {
            console.error('fetch error', error)
          });
        }}>Upload</Button>
      {/* </Modal.Actions> */}
    </div>
  } else {
    return <div>
      <p>undefined</p>
    </div>
  }
}


function UploadSwagger(props) {
  
  const [fileInfo, setFileInfo] = useState({ enable: false, name: undefined, size: undefined, version: undefined, contents: undefined });
  const { serviceId } = props.match.params;
  const onDrop = props.onDrop ? props.onDrop : (result,file,contents)=>{
    // console.log(result, file, contents)
    if(result.isSuccess !== true) {
      setFileInfo({ enable: false, name: undefined, size: undefined, version: undefined, contents: undefined })
    } else {
      setFileInfo({ enable: true, name: file.name, size: file.size, version: result.version, contents: contents })
    }
  };

  return (
    <Modal trigger={<Button attached='top' onClick={() => { setFileInfo({ enable: false, name: undefined, size: undefined, version: undefined });}}>Upload</Button>}>
      <Modal.Header>Upload Swagger</Modal.Header>
      <Modal.Content image>
        <div 
          id="react-file-drop-demo"
          style={{ width: 300, height: 300, border: '1px solid black', color: 'black', padding: 20 }}
        >
          <FileDrop onDrop={(files, event) => {
            console.log(files);
            const file = files[0];
            const ext = path.extname(file.name);
            if (!['.yaml', '.yml', '.json'].includes(ext)) {
              onDrop({ isSuccess: false, message: 'file format error' }, file, null);
              return;
            }
            const reader = new FileReader();
            reader.onloadend = (e) => {

              let spec;
              if (['.yaml', '.yml'].includes(ext)) {
                spec = yaml.safeLoad(e.target.result);
              } else {
                spec = JSON.parse(e.target.result);
              }
              const result = validateSwagger(spec);

              onDrop(result, file, e.target.result);
              console.log('version', result);
            }
            reader.readAsText(file);
          }}>
            Drop some files here!
          </FileDrop>
        </div >
        <Modal.Description style={{ padding: '50px' }}>
          <Header>File</Header>
          <FileDescription 
            enable={fileInfo.enable} 
            name={fileInfo.name}
            size={fileInfo.size}
            version={fileInfo.version}
            contents={fileInfo.contents}
            serviceId={serviceId}
          />
        </Modal.Description>
      </Modal.Content>
    </Modal>

  );
}

export default withRouter(UploadSwagger);

