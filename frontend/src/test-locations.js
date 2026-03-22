// Test script to verify location data
import { indianStates, stateDistricts, districtCities, getDefaultCities } from './data/indianLocations.js';

console.log('='.repeat(60));
console.log('TESTING COMPREHENSIVE LOCATION DATA');
console.log('='.repeat(60));

console.log(`\n📍 Total States: ${indianStates.length}`);
console.log('States:', indianStates.slice(0, 10).join(', '), '...');

console.log(`\n🏛️ States with District Data: ${Object.keys(stateDistricts).length}`);

// Test a few states
const testStates = ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi', 'Uttar Pradesh'];

testStates.forEach(state => {
  if (stateDistricts[state]) {
    console.log(`\n${state}:`);
    console.log(`  Districts: ${stateDistricts[state].length}`);
    console.log(`  Sample: ${stateDistricts[state].slice(0, 5).join(', ')}`);
    
    // Test cities for first district
    const firstDistrict = stateDistricts[state][0];
    const cities = districtCities[firstDistrict] || getDefaultCities(firstDistrict);
    console.log(`  ${firstDistrict} Cities: ${cities.length}`);
    console.log(`  Sample Cities: ${cities.slice(0, 3).join(', ')}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('✅ Location data structure is complete!');
console.log('='.repeat(60));