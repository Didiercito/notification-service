declare module 'amqplib' {
  export interface Connection {
    createChannel(): Promise<Channel>;
    close(): Promise<void>;
  }

  export interface Channel {
    assertExchange(exchange: string, type: string, options?: any): Promise<void>;
    assertQueue(queue: string, options?: any): Promise<void>;
    bindQueue(queue: string, exchange: string, pattern: string): Promise<void>;
    consume(
      queue: string,
      onMessage: (msg: ConsumeMessage | null) => void,
      options?: any
    ): Promise<any>;
    ack(msg: ConsumeMessage): void;
    nack(msg: ConsumeMessage): void;
  }

  export interface ConsumeMessage {
    content: Buffer;
    fields: { routingKey: string };
  }

  export function connect(url: string): Promise<Connection>;
}
