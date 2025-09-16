// // // src/shims/es-toolkit-compat-get.js
// // // recharts가 기대하는 default export와 named export(get) 둘 다 제공
// // function getImpl(obj, path, defVal) {
// //   if (!path) return obj ?? defVal;
// //   try {
// //     const keys = Array.isArray(path) ? path : String(path).split('.');
// //     let cur = obj;
// //     for (const k of keys) {
// //       if (cur == null) return defVal;
// //       cur = cur[k];
// //     }
// //     return cur ?? defVal;
// //   } catch {
// //     return defVal;
// //   }
// // }

// // export default getImpl;
// // export const get = getImpl;
// // 기본 export를 기대하는 코드 호환용 shim
// export { get as default, get } from 'es-toolkit/compat/get.js';

// src/shims/es-toolkit-compat-get.js
// recharts 등에서 'default'와 'get' 둘 다 기대하는 상황을 호환해 주는 로컬 구현

function getImpl(obj, path, defVal) {
  if (path == null || path === '') return obj ?? defVal;
  try {
    const keys = Array.isArray(path) ? path : String(path).split('.');
    let cur = obj;
    for (const k of keys) {
      if (cur == null) return defVal;
      cur = cur[k];
    }
    return cur ?? defVal;
  } catch {
    return defVal;
  }
}

// default export + named export 둘 다 제공
export default getImpl;
export const get = getImpl;
