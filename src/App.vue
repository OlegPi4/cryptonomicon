<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
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
            <button
              @click.stop="handleDelete(t)"
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

      <section v-if="selectedTicker" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker.name }} - USD
        </h3>
        <div 
          class="flex items-end border-gray-600 border-b border-l h-64"
          ref="graph" >
          <div 
          v-for="(bar, idx) in normalizedGraph"
          :key="idx"
          :style="{ 
            height: `${bar}%`,
            width: `${withElementGraph}`
             }"
          class="bg-purple-800 border w-7" 
            ></div>
        </div>
        <button 
            @click="selectedTicker = null"
            type="button"
            class="absolute top-0 right-0">
          
          <icon-close-graph />
        </button>
                
      </section>
    </div>
  </div>
</template>

<script>
import { nextTick } from 'vue';

import { subscribeToTicker, unsubscribeFromTicker, deletingFromKroslist } from './api';
import AddTicker from '@/conponents/AddTicker.vue';
import IconCloseGraph from '@/conponents/IconCloseGraph.vue';

export default {
  name: "App",

  components: {
    AddTicker,
    IconCloseGraph,
  },

  data() {
    return {
      tickers: [],
      selectedTicker: null,
      graph: [],
      page: 1,
      filter: "",
      maxGraphElements: 24,
      withElementGraph: 22,
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
    window.addEventListener("resize", this.calculatingSizeGraphElements);
    
  },

  beforeUnmount() {
    
    window.removeEventListener("resize", this.calculatingSizeGraphElements);
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

    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);

      if(maxValue == minValue) {
        return this.graph.map(() => 50);
      }
      return this.graph.map(
        price => 5 + ((price - minValue) * 95) / (maxValue - minValue));
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },  
  
  },

  methods: {
    // метод расчета количества и ширины элементов графика 
    // принято что при ширине графика до 400px будет 20 элементов
    // при ширине более 1400рх - 60 элементов, в среднем диапазоне будет расчет 
    calculatingSizeGraphElements() {
      
      if(!this.$refs.graph) {
        return;
      }

      const widthMin = 400;   
      const widthMax = 1400;
      const elementsMin = 20;
      const elementsMax = 60;
      const widthGrapgFact = this.$refs.graph.clientWidth
      
      if ( widthGrapgFact <= 400) {
          this.maxGraphElements = elementsMin;
          this.withElementGraph = widthGrapgFact / elementsMin;
      } else if ( widthGrapgFact <= 400 ) {
          this.maxGraphElements = elementsMax;
          this.withElementGraph = widthGrapgFact / elementsMax;
      } else {
          let k = (widthGrapgFact - widthMin) / (widthMax - widthMin);
          this.maxGraphElements = elementsMin + Math.floor( k * (elementsMax - elementsMin));
          this.withElementGraph = Math.floor(widthGrapgFact / this.maxGraphElements)
      }
      console.log(`Graph  N - ${this.maxGraphElements}  W - ${this.withElementGraph}`)
    },  

    updateTicker(tickerName, price, pointer) {
      this.tickers
        .filter(t => t.name === tickerName)
        .forEach(t => {
          if(t === this.selectedTicker) {
            this.graph.push(price);
            if (this.graph.length > this.maxGraphElements) {
              const delta = this.graph.length - this.maxGraphElements;
              this.graph = this.graph.slice(delta);
            }

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

    handleDelete(tickerRemove) {
      this.tickers = this.tickers.filter((t) => t !== tickerRemove);
      if(this.selectedTicker == tickerRemove) {
        this.selectedTicker = null;
      }
      unsubscribeFromTicker(tickerRemove.name);
      deletingFromKroslist(tickerRemove.name);
    },
  },

  watch: {
    selectedTicker() {
      this.graph= [];

      this.$nextTick().then(this.calculatingSizeGraphElements);
    },

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


