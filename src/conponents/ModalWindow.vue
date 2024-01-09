<template>
   <div v-if="tickerDel" class="backdrop" @click="close">   
     <div class="popup" @click.stop>    
       <h1>Внимание!</h1>
       <hr />
       <p>
            Вы действительно хотите удалить тикер  
       </p>
       <div class="ticker">
            <span>{{tickerDel.name }}</span>
       </div>
       <hr />
       <div class="footer">
         <div class="buttons">
            <button @click="close"                     
               class="button-close">
               Отмена
            </button>  
            <button @click="confirm"
               class="button-confirm">
               Ok
            </button> 
         </div>
       </div>
     </div>
   </div>
 </template>

 <script>
 
 export default {
   
   props: {
      tickerDel: { 
         type: Object, 
         required: false, 
         default: null},
   },
   
   emits: {     
     ok: null,      
     close: null,
   },
   mounted() {
     document.addEventListener("keydown", this.handleKeydown);  
   },
   beforeUnmount() {
     document.removeEventListener("keydown", this.handleKeydown);
   },
   
   methods: {
     handleKeydown(e) {			
       if (this.tickerDel && e.key === "Escape") {
         this.close();
       }
     },

     close() {  	
       this.$emit("close");
     },

     confirm() {  
       this.$emit("ok");    },
   },
 };
 </script>
 <style>
   .popup { 
      top: 50px;
      padding: 20px;
      left: 50%; 
      transform: translateX(-50%); 
      position: fixed; 
      z-index: 101; 
      background-color: white;
      border-radius: 10px; 
   }

   .popup h1 { 
      text-align: center;
      margin: 0;
      font-size: 30px;
      padding: 15px 0;
   }

   p {
      font-size: 26px;
      padding: 15px 0;
   }

   span {
      color: rgb(219, 17, 17);
   }

   .backdrop {
      position: fixed; 
      top: 0; 
      left: 0; 
      bottom: 0; 
      right: 0;  
      background-color: rgba(0, 0, 0, 0.6); 
      z-index: 100; 
   }

   .ticker {
      text-align: center;
      font-size: 26px;
      padding-bottom: 15px;
   }

   .buttons {
      display: flex;
      justify-content: center;
      font-size: 24px;
   }

   .button-close {
      border: solid 2px rgba(47, 137, 240, 0.5);
      border-radius: 6px;
      margin: 5px 10px;
      padding: 0px 10px;
   } 

   .button-confirm {
      border: solid 2px rgba(240, 47, 47, 0.5);
      border-radius: 6px;
      margin: 5px 10px;
      padding: 0px 10px;
   }

   .button-close:hover {
      color: rgba(47, 137, 240, 0.7);
   }

   .button-confirm:hover {
      color: rgba(240, 47, 47, 0.7);
   }

   .footer { 
      text-align: right; 
   }
</style>
 