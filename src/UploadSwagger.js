
import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom'
import urljoin from 'url-join';
import config from 'react-global-configuration';
import FileDrop from 'react-file-drop';
import yaml from 'js-yaml';
import path from 'path';


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


function UploadSwagger(props) {
  // const styles = { border: '1px solid black', width: 600, color: 'black', padding: 20 };
  const onDrop = props.onDrop ? props.onDrop : (result,file,content)=>{};
  return (
    <div id="react-file-drop-demo" style={{ width: 300, height: 300, border: '1px solid black', color: 'black', padding: 20 }}>
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
          // console.log(e.target.result)
          let spec;
          if (['.yaml', '.yml'].includes(ext)) {
            spec = yaml.safeLoad(e.target.result);
          } else {
            spec = JSON.parse(e.target.result);
          }
          const result = validateSwagger(spec);
          // if (result.isSuccess !== true) {
          //   console.log(result.message);
          //   return
          // }
          onDrop(result, file, e.target.result);
          console.log('version', result);
        }
        reader.readAsText(file);
      }}>
        Drop some files here!
      </FileDrop>
    </div >
  );
}

export default withRouter(UploadSwagger);

