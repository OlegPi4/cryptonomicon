<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4"
    :class="{
      'wrapper': showModalWindow == true 
    }
    "
  >
    <!-- <div
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div> -->
    <modal-window
       v-if="showModalWindow" 
       :tickerDel="tickerForDelet"
       @ok="handleDelete"
       @close="cleareDelete" />
    <div class="container">
      <section>
        <add-ticker :listTickers="tickers" @add-ticker="add" />
      </section>
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>Фильтр: 
          <input 
          v-model="filter"
          class="pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"/> 
          <button
            v-if="page > 1"
            @click="page = page - 1"
            class="ml-10  my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
          Назад
          </button>
          <button
            v-if="hasNextPage"
            @click="page = page + 1"
            class="ml-5 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Вперед
          </button>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
          <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            @click="select(t)"
            :class="{
              'border-4': selectedTicker === t
            }" 
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          > 
            <div 
            :class="{
              'bg-red-100' : t.pointerBg === 1
            }" 
            class="px-4 py-5 sm:p-6 text-center"
            >
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <!-- @click.stop="handleDelete(t)"  -->
            <button
              @click.stop="hendleModalWindow(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
    
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <building-graph  
        :selectedTicker = "selectedTicker"
        :priceForGraph = "priceForGraph"
        @close-ticker="selectedTicker = null"/>
    </div>
  </div>
</template>

<script>
import { handleError, nextTick } from 'vue';

import { subscribeToTicker, unsubscribeFromTicker, deletingFromKroslist } from './api';
import AddTicker from '@/conponents/AddTicker.vue';
import BuildingGraph from './conponents/BuildingGraph.vue';
import ModalWindow from './conponents/ModalWindow.vue';

export default {
  name: "App",

  components: {
    AddTicker,
    BuildingGraph,
    ModalWindow,
  },

  data() {
    return {
      tickers: [],
      selectedTicker: null,
      priceForGraph: null,
      page: 1,
      filter: "",
      showModalWindow: false,
      tickerForDelet: null,
     };
  },
  created() {
    const windowData = Object.fromEntries(new URL(
    window.location).searchParams.entries());
    
    if(windowData.filter) {
      this.filter = windowData.filter;
    }

    if (windowData.page) {
      this.page = windowData.page
    }

    const tickersData = localStorage.getItem('cryptonomicon-list');

    if(tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach(ticker => {
        subscribeToTicker(ticker.name, (newPrice, pointer) => { 
          this.updateTicker(ticker.name, newPrice, pointer);
          }
        );
      })
    }
  },

  beforeUnmount() {
    localStorage.setItem('cryptonomicon-list', JSON.stringify(this.tickers));
  }, 

  computed: {
    
    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter((item) => item.name.includes(this.filter.toUpperCase()))
    },
    
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex)
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },  
  
  },

  methods: {

    updateTicker(tickerName, price, pointer) {
      this.tickers
        .filter(t => t.name === tickerName)
        .forEach(t => {
          if(t === this.selectedTicker) {
            this.priceForGraph = price;
          }
        t.price = price;
        t.pointerBg = pointer;
      });
    }, 

    formatPrice(price) {
      if (price === "-") {
        return price
      }
      return  price > 1 ? price.toFixed(2) : price.toPrecision(2);  
    },

    add(ticker) {
      const currentTicker = {
        name: ticker.toUpperCase(),
        price: "-",
        pointerBg: "",
      };
      this.tickers = [...this.tickers, currentTicker];
      this.filter = "";
      subscribeToTicker(currentTicker.name, (newPrice, pointer) => { 
      this.updateTicker(currentTicker.name, newPrice, pointer);
      })
  
    },

    select(ticker){
      this.selectedTicker = ticker;
 
    },

    hendleModalWindow(t) {
      this.showModalWindow = !this.showModalWindow
      this.tickerForDelet = t;
    },

    cleareDelete() {
      this.showModalWindow = !this.showModalWindow
      this.tickerForDelet = {};
    },

    handleDelete() {
      this.tickers = this.tickers.filter((t) => t !== this.tickerForDelet);

      if(this.selectedTicker == this.tickerForDelet) {
        this.selectedTicker = null;
      }
      unsubscribeFromTicker(this.tickerForDelet.name);
    //  deletingFromKroslist(this.tickerForDelet.name);
      this.cleareDelete();
    },
  },

  watch: {
    tickers() {
      localStorage.setItem('cryptonomicon-list', JSON.stringify(this.tickers));
    }, 

    paginatedTickers() {
      if(this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    filter() {
      this.page = 1; 
    },

    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    }
  },
}

</script>

<style>
  .wrapper{
    background-color: rgba(0, 0, 0, 0.1);
  }
</style>
