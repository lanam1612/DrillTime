// /src/Handle/AssisHandleLogic.tsx

import { chatWithGemini } from "../API/GeminiAssistantAPI";
import { GenerateCodeWithGemini } from "../API/GeminiCodeGenerateAPI";
import { AssistHandlePromt } from "../Promt/AssistHandlePromt";

function debug(input : string): void {
    // TODO: implement debug logic
    // Hàm này hiện chưa được implement — chỉ log để dễ nhận biết khi gọi
    console.warn('debug() not implemented');
}

async function generateCode(input: string): Promise<string> {
    // Ví dụ đơn giản về generate code — thay bằng logic thật khi cần
    return await GenerateCodeWithGemini(input);
}

/**
 * Xử lý string truyền vào.
 * Nếu string chứa từ "debug" (không phân biệt hoa thường) sẽ gọi debug() và generateCode()
 * Trả về chuỗi code được generate nếu có, hoặc chuỗi rỗng nếu không.
 */
export async function handleAssistantInput(input: string): Promise<string> {
    const answer : string = await chatWithGemini(AssistHandlePromt + " \n Chat history: " + JSON.parse(sessionStorage.getItem("chat_history") || "") + "User request:" + input) || "" + "Bạn hãy phân tích coi người dùng muốn tạo code hay debug";

    const hasDebug = /\bDebug_Code\b/i.test(answer);
    const hasGenerate = /\bGenerate_Code\b/i.test(answer);

    if (!hasDebug && !hasGenerate) return answer;

    if (hasDebug) {
        try {
            debug(input);
        } catch (err) {
            console.error('debug() threw an error', err);
        }
    }

    if (hasGenerate) {
        return generateCode(input);
    }

    return answer;
}