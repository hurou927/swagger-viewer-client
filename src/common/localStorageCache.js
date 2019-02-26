

const getTimeSec = () => {
  return Math.floor((new Date()).getTime() / 1000)
}

const keyListName = 'KeyList'

class LSCache {
  constructor(prefix='lscache'){
    this.prefix = prefix
  }
  
  getKeyName(key){
    return `${this.prefix}.${key}`;
  }

  clear() {
    const keyList = JSON.parse(window.localStorage.getItem(this.getKeyName(keyListName)) || '{"keys":[]}');
    keyList.keys.forEach(v=>{
      window.localStorage.removeItem(v);
    })
  }

  put(key, value){
    const keyName = this.getKeyName(key)
    const keyList = JSON.parse(window.localStorage.getItem(this.getKeyName(keyListName)) || '{"keys":[]}');
    if (!(keyName in keyList.keys)) {
      keyList.keys.push(keyName);
    }
    window.localStorage.setItem(this.getKeyName(keyListName), JSON.stringify(keyList))
    window.localStorage.setItem(keyName, JSON.stringify({ value: value, time: getTimeSec()})) 
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