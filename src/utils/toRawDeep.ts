import type { MaybeRefOrGetter } from 'vue';

const toRawDeep = <T>(data: MaybeRefOrGetter<T>): T => JSON.parse(JSON.stringify(data));

export default toRawDeep;
