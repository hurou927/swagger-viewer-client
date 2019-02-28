import React, { useState, useContext } from 'react';
// import { Menu, Input, Sidebar, Segment, Icon, Header, Image, Button, Search } from 'semantic-ui-react'
import { withRouter } from 'react-router-dom'
import { Input, Message } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
// import LSCache from '../common/localStorageCache.js'
import config from 'react-global-configuration';
import ServiceListContext from '../contexts/ServiceListContext'
import urljoin from 'url-join'
import axios from 'axios'
// const lsCache = new LSCache();


function AddService(props) {
  const servicies = useContext(ServiceListContext) || [];
  // console.log(servicies);

  const [fetchResult, setFetchResult] = useState({});
  const message = (props) => {
    if (fetchResult.isSuccess === true) {
      return <Message info>
        <Message.Header>Success!</Message.Header>
        <p>{fetchResult.message}</p>
      </Message>
    } else if (fetchResult.isSuccess === false) {
      return <Message negative>
        <Message.Header>Error</Message.Header>
        <p>{fetchResult.message}</p>
      </Message>
    }
  }
  let inputText = ''
  return <div>
    <p> CreateService </p>
    <Input
      icon={{
        name: 'add', circular: true, link: true, onClick: () => {
          if(inputText.length < 4) {
            setFetchResult({
              isSuccess: false,
              message: '4 or more characters'
            })
            return
          }
          
          for(let i=0; i<servicies.length; i++){
            if(servicies[i].servicename === inputText) {
              setFetchResult({
                isSuccess: false,
                message: 'ServiceName may already exist...'
              })
              return;
            }
          }

          axios({
            method: 'post',
            url: urljoin(config.get('api'), '/services'),
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
            data: {
              serviceName: inputText,
            }
          }).then(res=>{
            console.log(res.data);
            console.log(res.status);
            if (res.status === 200) {
              setFetchResult({
                isSuccess: true,
                message: `Add Service Success! ${JSON.stringify(res.data)}`,
              })
            } else {
              setFetchResult({
                isSuccess: false,
                message: JSON.stringify(res.data.error)
              })
            }
          }).catch(err=>{
            console.error(err);
            setFetchResult({
              isSuccess: false,
              message: 'Unknown Error(Please Contact us.)'
            })
          })
        }
      }}
      placeholder='Servicename...'
      onChange={(e, { value }) => { inputText = value }}
      disabled={fetchResult.isSuccess===true}
    />
    {message()}
  </div>;
}

export default withRouter(AddService);