
import { stringify } from "postcss";

const API_KEY = '97ccca707d627ca204a2c8058a751cf42e7de0144f03f5081b95e336adc8a438';
let krosList = []; 
const tickersHandlers = new Map(); // объект
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?&api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";
const TYPE500 = "500";

socket.addEventListener("message", e => {
   const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice, TOSYMBOL: 
   baseCurrency, MESSAGE: mess, PARAMETER: param } = JSON.parse(e.data);
   if ((type === AGGREGATE_INDEX && newPrice != undefined) || (type === TYPE500) ) {
      const pointer = mess === "INVALID_SUB" ? 1 : 0;
     
      if (pointer === 1) {
         let currency = param.split('~')[2];  
         if (!krosList.includes(currency)) {
            krosList.push(currency);
         }
         let newPrice = "-"; 
         callHandlers(newPrice, currency, pointer);
      }
      callHandlers(newPrice, currency, pointer);    
   }
   return;
   
});

function callHandlers(newPrice, currency, pointer) {
   const handlers = tickersHandlers.get(currency) ?? [];
   handlers.forEach(fn => fn(newPrice, pointer));
}



//второй вариант загрузки списка криптовалют
export const  loadCoins =  () => { 
      let r = fetch(`https://min-api.cryptocompare.com/data/all/coinlist?ummary=true`)
       .then(r =>  r.json())  
       .then(r => Object.keys(r.Data));
       return r
            
 }

//  WebSocket
function sentToWebSocket(message) {
   const stringifiedMessage = JSON.stringify(message);
   if (socket.readyState === WebSocket.OPEN) {
      socket.send(stringifiedMessage);
      return;
   }

   socket.addEventListener('open', () => {
      socket.send(stringifiedMessage);
   }, { once: true });
}


function subscribeToTickerOnWs(ticker) {
   //if (krosList.includes(ticker)) {
   //   console.log(`in if subscribeToTickerOnWs`)
   //}
   sentToWebSocket({
      "action": "SubAdd",
      "subs": [`5~CCCAGG~${ticker}~USD`]
   });
}



function unSubscribeFromTickerOnWs(ticker) {
   sentToWebSocket({
      "action": "SubRemove",
      "subs": [`5~CCCAGG~${ticker}~USD`]
   });
}


//  Подписка на изменения теккеров
export const subscribeToTicker = (ticker, cb)  => {
   const subscribers = tickersHandlers.get(ticker) || [];
   tickersHandlers.set(ticker, [...subscribers, cb]); 
   subscribeToTickerOnWs(ticker); 
};

// Отписка от  тиккеров
export const unsubscribeFromTicker = ticker  => {
   tickersHandlers.delete(ticker);
   unSubscribeFromTickerOnWs(ticker);
};

// Удаление тиккера из списка кроскурсов
export const deletingFromKroslist = ticker  => {
   krosList = krosList.filter( t => t != ticker)
};


////
// const API_KEY = '97ccca707d627ca204a2c8058a751cf42e7de0144f03f5081b95e336adc8a438';

// const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?&api_key=${API_KEY}`
// );
// socket.readyState


// socket.send(JSON.stringify({
//    "action": "SubAdd",
//    "subs": ['5~CCCAGG~BTCD~BTC' ]
// }));