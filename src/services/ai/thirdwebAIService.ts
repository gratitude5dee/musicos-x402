export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIContext {
  from?: string;
  chain_ids?: number[];
  auto_execute_transactions?: boolean;
  session_id?: string;
}

export interface StreamEvent {
  event: 'init' | 'delta' | 'presence' | 'action' | 'done' | 'error';
  data: any;
}

export class ThirdwebAIService {
  private apiUrl = 'https://api.thirdweb.com/ai/chat';
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async *streamChat(
    messages: ChatMessage[],
    context: AIContext = {}
  ): AsyncGenerator<StreamEvent> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret-key': this.secretKey,
      },
      body: JSON.stringify({
        messages,
        stream: true,
        context: {
          ...context,
          auto_execute_transactions: context.auto_execute_transactions ?? false,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            yield {
              event: parsed.event || 'delta',
              data: parsed,
            };
          } catch (e) {
            // Skip malformed JSON
          }
        } else if (line.startsWith('event: ')) {
          // Event type hint (handled in data parsing)
        }
      }
    }
  }
}
