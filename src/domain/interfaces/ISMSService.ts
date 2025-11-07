export interface SendSMSParams {
  recipient: string; 
  message: string;   
}

export interface ISMSService {
  sendSMS(params: SendSMSParams): Promise<void>;
}