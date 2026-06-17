import { ChatbotValidator } from '../../core/ChatbotValidator.ts';

async function runTests() {
  console.log('🤖 Initializing Chatbot Validator...\n');
  const validator = new ChatbotValidator();
  await validator.init();
  console.log('✅ Validator initialized\n');
  
  console.log('📝 Running validation tests...\n');
  const result = await validator.validateResponse(
    'What is TypeScript?',
    'TypeScript is a typed superset of JavaScript.'
  );
  console.log('Validation Result:', result);
  console.log('\n✨ Test completed!');
}

runTests().catch(console.error);