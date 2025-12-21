// Quick test to see what's failing
const testData = {
  date: new Date().toISOString().split('T')[0],
  amount: 100,
  description: "Test Expense",
  category: "RENT",
  reference: "TEST-001",
  notes: "Testing"
};

console.log('Test payload:', JSON.stringify(testData, null, 2));
console.log('\nThis is what the form should be sending.');
console.log('If category is custom, it should be a plain string like "CUSTOM_CATEGORY"');
