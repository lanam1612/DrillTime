// /src/Handle/AssisHandleLogic.tsx

function debug(): void {
    // TODO: implement debug logic
    // Hàm này hiện chưa được implement — chỉ log để dễ nhận biết khi gọi
    console.warn('debug() not implemented');
}

function generateCode(input: string): string {
    // Ví dụ đơn giản về generate code — thay bằng logic thật khi cần
    const safe = input.replace(/\r?\n/g, ' ').trim();
    return `// Generated code for input: ${safe}\nconsole.log(${JSON.stringify(safe)});`;
}

/**
 * Xử lý string truyền vào.
 * Nếu string chứa từ "debug" (không phân biệt hoa thường) sẽ gọi debug() và generateCode()
 * Trả về chuỗi code được generate nếu có, hoặc chuỗi rỗng nếu không.
 */
export async function handleAssistantInput(input: string): Promise<string> {
    if (/\bdebug\b/i.test(input)) {
        debug(); // chưa implement
        const code = generateCode(input);
        return code;
    }
    return '';
}