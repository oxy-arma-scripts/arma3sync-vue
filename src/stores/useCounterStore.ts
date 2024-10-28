import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', () => {
  const count = ref<number | null>(null);

  const bridge = window.ipc;

  // Set the initial value
  bridge.onCounterUpdate((value) => { count.value = value; });

  function increment() {
    bridge.setCounter(count.value + 1);
  }

  function decrement() {
    bridge.setCounter(count.value - 1);
  }

  onMounted(async () => {
    const value = await bridge.getCounter();
    count.value = value;
  });

  return {
    count: computed(() => count.value),
    increment,
    decrement,
  };
});
