<template>
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
            @click="closeSelectedTicker"
            type="button"
            class="absolute top-0 right-0">
          
          <icon-close-graph />
        </button>
                
      </section>  
</template>

<script>
import IconCloseGraph from './IconCloseGraph.vue';

export default {

  components: {
    IconCloseGraph,
  },
  data() {
    return {
      graph: [],
      maxGraphElements: 24,
      withElementGraph: 22,
    }
  },

  props: {
    selectedTicker: {
      type: Object,
      require: false,
      default: null,
    },
    priceForGraph: {
      type: Number,
      require: false,
      default: null,
    }
  },
  emits: {
    'close-ticker': {
      type: null,
      require: false,
      default: null,
    }
  },
  
  created() {
    window.addEventListener("resize", this.calculatingSizeGraphElements);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.calculatingSizeGraphElements);
  },

  computed:{
    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);

      if(maxValue == minValue) {
        return this.graph.map(() => 50);
      }
      return this.graph.map(
        price => 5 + ((price - minValue) * 95) / (maxValue - minValue));
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
          this.withElementGraph = Math.floor(widthGrapgFact / elementsMin);
      } else if ( widthGrapgFact <= 400 ) {
          this.maxGraphElements = elementsMax;
          this.withElementGraph = Math.floor(widthGrapgFact / elementsMax);
      } else {
          let k = (widthGrapgFact - widthMin) / (widthMax - widthMin);
          this.maxGraphElements = elementsMin + Math.floor( k * (elementsMax - elementsMin));
          this.withElementGraph = Math.floor(widthGrapgFact / this.maxGraphElements)
      }
    }, 
    // метод закрытия графика по кнопке-крестику
    closeSelectedTicker() {
      this.$emit('close-ticker', null);
      this.graph= [];
    }
  },
  
  watch: {
    // следим за изменениями пропса priceForGraph
    priceForGraph() {
      this.graph.push(this.priceForGraph);
      
      if (this.graph.length > this.maxGraphElements) {
        const delta = this.graph.length - this.maxGraphElements;
        this.graph = this.graph.slice(delta);
        }
    },
    // следим за появлением выбранного тиккера
    selectedTicker() {
      this.graph= [];
      this.$nextTick().then(this.calculatingSizeGraphElements);
    },
  }
}
</script>

<style>

</style>