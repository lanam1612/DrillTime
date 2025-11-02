import { chatWithGemini as codeGenerateAPI } from '../API/GeminiCodeGenerateAPI';
import { chatWithGemini as debugAPI } from '../API/GeminiDebugAPI';
import { chatWithGemini as assistantAPI } from '../API/GeminiAssistantAPI';

// Keywords để phát hiện loại request
const DEBUG_KEYWORDS = [
  'debug', 'lỗi', 'error', 'bug', 'sửa', 'fix', 'tìm lỗi', 'phân tích lỗi',
  'review code', 'kiểm tra code', 'đánh giá code', 'tối ưu code',
  'security', 'bảo mật', 'vulnerability', 'lỗ hổng'
];

const CODE_GENERATE_KEYWORDS = [
  'tạo', 'viết', 'generate', 'code', 'function', 'component', 'class',
  'làm', 'xây dựng', 'build', 'implement', 'thực hiện'
];

/**
 * Phát hiện loại request dựa trên nội dung
 */
export function detectRequestType(prompt: string): 'debug' | 'generate' | 'assistant' {
  const lowerPrompt = prompt.toLowerCase();
  
  // Kiểm tra có code block không (dấu hiệu của debug request)
  const hasCodeBlock = /```[\s\S]*?```/.test(prompt);
  
  // Kiểm tra debug keywords
  const hasDebugKeywords = DEBUG_KEYWORDS.some(keyword => 
    lowerPrompt.includes(keyword.toLowerCase())
  );
  
  // Kiểm tra code generation keywords
  const hasGenerateKeywords = CODE_GENERATE_KEYWORDS.some(keyword => 
    lowerPrompt.includes(keyword.toLowerCase())
  );
  
  // Logic quyết định
  if (hasCodeBlock || hasDebugKeywords) {
    return 'debug';
  }
  
  if (hasGenerateKeywords) {
    return 'generate';
  }
  
  // Mặc định là assistant cho các câu hỏi tổng quát
  return 'assistant';
}

/**
 * Chọn API phù hợp dựa trên loại request
 */
export async function selectAndCallAPI(prompt: string): Promise<string> {
  const requestType = detectRequestType(prompt);
  
  console.log(`🤖 Detected request type: ${requestType}`);
  
  switch (requestType) {
    case 'debug':
      console.log('🔍 Using Debug API with DebugData integration');
      return debugAPI(prompt);
      
    case 'generate':
      console.log('⚡ Using Code Generation API');
      return codeGenerateAPI(prompt);
      
    case 'assistant':
    default:
      console.log('💬 Using Assistant API');
      return assistantAPI(prompt);
  }
}

export default {
  detectRequestType,
  selectAndCallAPI
};
