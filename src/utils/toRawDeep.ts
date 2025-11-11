import type { MaybeRefOrGetter } from 'vue';

const toRawDeep = <Type>(data: MaybeRefOrGetter<Type>): Type =>
  JSON.parse(JSON.stringify(data));

export default toRawDeep;
