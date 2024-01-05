<template>
  <div class="flex">
      <div class="max-w-xs">
      <label for="wallet" class="block text-sm font-medium text-gray-700"
         >Тикер</label
      >
      <div class="mt-1 relative rounded-md shadow-md">
         <input
            v-model="ticker"
            @keydown.enter="add"
            @click="showMessage = fals"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
         />
      </div>
      <div
         class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
      >
         <span
            v-for="t in selectFourCoins"
            :key="t.id"
            @click="chosCoins(t)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
         >
            {{ t }} 
         </span>
      </div>
         <div 
            v-if="showMessage"
            class="text-lg text-red-600">Такой тикер уже добавлен
         </div>
      </div>
   </div>
   <button
      @:click="add"
      type="button"
      class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
   >
      <plus-sign-icon />
      Добавить
   </button>
</template>

<script>
import { loadCoins } from '@/api';

import PlusSignIcon from './PlusSignIcon.vue';

export default {

   components: {
      PlusSignIcon,
   },

   data() {
      return {
         ticker: "",
         showMessage: false,
         listCoins: [],
      }
   },

   props: {
      listTickers: {
         type: Array,
         required: false,
         default: [],
      },
   },

   emits: {
      'add-ticker': {
         type: String,
         require: false,
         default: '',
      },    
   },

   computed: {
      selectFourCoins() {
         if(this.ticker.length === 0) {
         return ['BTC', 'DOGE', 'BCH', 'CDH']
         } else {
         return this.listCoins.filter((item) => item.includes(this.ticker.toUpperCase())).slice(0, 4)  
         }  
      }
   },

   methods: {
      add() {

         if (this.listTickers.find(item => item.name === this.ticker.toUpperCase()) === undefined) {

            this.$emit('add-ticker', this.ticker);
            this.ticker = "";
         } else {
            this.showMessage = true
      }    
      },

      chosCoins(t) {
         this.ticker = t;
         this.showMessage = false
      },

      async fetchCoins() {
         const coins = await loadCoins();  
         this.listCoins = coins;
    }, 
     
   },

   mounted() {
      this.fetchCoins();
   }, 
    
}
</script>

<style>
</style>