

const getTimeSec = () => {
  return Math.floor((new Date()).getTime() / 1000)
}

class LSCache {
  constructor(prefix='lscache'){
    this.prefix = prefix
  }
  
  getKeyName(key){
    return `${this.prefix}.${key}`;
  }

  put(key, value){
    window.localStorage.setItem(this.getKeyName(key), JSON.stringify({ value: value, time: getTimeSec()})) 
  }

  get(key, ttl=undefined){
    const str = window.localStorage.getItem(this.getKeyName(key));
    if( !str ){
      return undefined;
    }
    const value = JSON.parse(str);
    if( !ttl || !('time' in value) ){
      return value;
    }
    const now = getTimeSec();
    if( now <= value.time+ttl ){
      return value;
    }
    return undefined
  }
}

export default LSCache;