// test-direct.ts
const apiKey = ""; // Pégala temporalmente

console.log('🔑 API Key directa:', apiKey ? 'PRESENTE' : 'AUSENTE');
console.log('Longitud:', apiKey?.length);
console.log('Inicia con:', apiKey?.substring(0, 4));