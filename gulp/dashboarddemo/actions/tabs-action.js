export function loadTabs(){
  return function(dispatch){
    return DataApi.getAllData().then(data => {
      dispatch("ACTION CREATOR GOES HERE");
    }).catch(error => {
      throw(error);
    });
  }
}
