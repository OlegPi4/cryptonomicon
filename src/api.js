import { stringify } from "postcss";

const API_KEY = '97ccca707d627ca204a2c8058a751cf42e7de0144f03f5081b95e336adc8a438';

const tickersHandlers = new Map(); // объект
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?&api_key=${API_KEY}`
);

const AGGREGATE_INDEX = "5";

socket.addEventListener("message", e => {
   const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data);
   if (type != AGGREGATE_INDEX) {
      return;
   }

   const handlers = tickersHandlers.get(currency) ?? [];
   handlers.forEach(fn => fn(newPrice));
});

// запрос цен тиккеров 
// export const loadTickers = () => { 
//    if(tickersHandlers.size === 0) {  
//       return;
//    }
   
//    fetch(
//    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
//       ...tickersHandlers.keys()
//       ]}&tsyms=USD&extraParams=Pi4`)
//    .then(r => r.json())
//    .then(rawData => {
//       const updatePrices = Object.fromEntries(
//          Object.entries(rawData).map(([key, value]) => [key, value.USD])
//       );

//       Object.entries(updatePrices).forEach(([currency, newPrice]) => {
//          const handlers = tickersHandlers.get(currency) ?? [];
//          handlers.forEach(fn => fn(newPrice));
//       });
//    });
// }   
//загрузка базы криптовалют для выведения подсказки под добавлением тиккера 
// export const  loadCoins = async  function() { 
//     try {
//         const res = await fetch(
//          `https://min-api.cryptocompare.com/data/all/coinlist?summary=true`);
//          const data =   await res.json();  
//          const coins = Object.keys(data.Data);
//          return coins
//       } catch(e) {
//         alert('Ошибка получения данных')
//       }
//    }    

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
   }, { once: true});
}

function subscribeToTickerOnWs(ticker) {
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

// setInterval(loadTickers, 5000);