import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom'
import SwaggerUi, { presets } from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import urljoin from 'url-join';
import config from 'react-global-configuration';
import { Dropdown } from 'semantic-ui-react'

function SwaggerView (props) {
  
  const { version, serviceId } = props.match.params;
  const {versions} = props;
  let versionSettings;
  let swaggerURL;
  let options = [];
  if (versions.length > 0) {
    if (version == 'latest') {
      versionSettings = versions[0];
    } else {
      versionSettings = versions.filter(v => v.version === version)[0];
    }
    swaggerURL = urljoin(config.get('swagger-bucket'), versionSettings.path);

    options = versions.map((v, i) => {
      return { key: v.version, text: v.version, value: v.version, description: v.tag }
    })
  }
  

  useEffect(() => {

    SwaggerUi({
      dom_id: '#swaggerContainer',
      url: swaggerURL,
      spec: props.spec,
      presets: [presets.apis]
    });
  });
  return (<div>
    <Dropdown
      placeholder='Versions' fluid search selection
      options={options}
      onChange={(e, { value }) => {
        console.log(value);
        props.history.push(`/servicies/${serviceId}/versions/${value}`);
      }}
    />
    <div id="swaggerContainer" />
  </div>);

}

export default withRouter(SwaggerView);