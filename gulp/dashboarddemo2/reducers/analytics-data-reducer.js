// export const initialData = {
//     analyticsData: [],
//     tabs: []
// };
//
// let tabId = 1;
//
// export default function analyticsReducer(state = initialData, action){
//   switch(action.type){
//     case 'INITIAL_ANALYTICS_DATA':
//       return {
//         ...state,
//         analyticsData: action.payload
//       };
//     case 'CHANGE_ANALYTICS_DATA':
//       return {
//         ...state,
//         analyticsData: action.payload
//       };
//     case 'CREATE_NEW_TAB':
//       return {
//         ...state,
//         tabs: [
//           ...state.tabs,
//           {
//             tab: action.payload,
//             id: tabId++
//           }
//         ]
//       }
//     default:
//       return state;
//   }
// }
