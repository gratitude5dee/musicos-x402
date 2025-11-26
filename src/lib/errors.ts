// Unified error handling for UniversalAI

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const ErrorCodes = {
  // Authentication errors (1xxx)
  AUTH_REQUIRED: 'AUTH_1001',
  AUTH_INVALID_TOKEN: 'AUTH_1002',
  AUTH_EXPIRED: 'AUTH_1003',
  AUTH_RATE_LIMITED: 'AUTH_1004',
  
  // Wallet errors (2xxx)
  WALLET_NOT_FOUND: 'WALLET_2001',
  WALLET_CREATION_FAILED: 'WALLET_2002',
  WALLET_INSUFFICIENT_BALANCE: 'WALLET_2003',
  WALLET_TRANSFER_FAILED: 'WALLET_2004',
  WALLET_SPEND_LIMIT_EXCEEDED: 'WALLET_2005',
  WALLET_INVALID_ADDRESS: 'WALLET_2006',
  
  // Payment errors (3xxx)
  PAYMENT_CREATION_FAILED: 'PAYMENT_3001',
  PAYMENT_COMPLETION_FAILED: 'PAYMENT_3002',
  PAYMENT_INSUFFICIENT_FUNDS: 'PAYMENT_3003',
  PAYMENT_INVALID_AMOUNT: 'PAYMENT_3004',
  PAYMENT_DUPLICATE: 'PAYMENT_3005',
  
  // Transaction errors (4xxx)
  TRANSACTION_NOT_FOUND: 'TRANSACTION_4001',
  TRANSACTION_ALREADY_PROCESSED: 'TRANSACTION_4002',
  TRANSACTION_STATUS_CHECK_FAILED: 'TRANSACTION_4003',
  
  // Validation errors (5xxx)
  VALIDATION_FAILED: 'VALIDATION_5001',
  INVALID_INPUT: 'VALIDATION_5002',
  INVALID_TOKEN_ADDRESS: 'VALIDATION_5003',
  INVALID_CHAIN_ID: 'VALIDATION_5004',
  
  // External service errors (6xxx)
  THIRDWEB_ERROR: 'EXTERNAL_6001',
  SUPABASE_ERROR: 'EXTERNAL_6002',
  NETWORK_ERROR: 'EXTERNAL_6003',
  
  // User errors (7xxx)
  USER_NOT_FOUND: 'USER_7001',
  USERNAME_TAKEN: 'USER_7002',
  
  // Unknown
  UNKNOWN_ERROR: 'UNKNOWN_9999',
} as const;

// React Query error handler
export function handleQueryError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    // Parse Supabase errors
    if (error.message.includes('PGRST')) {
      return new AppError(
        ErrorCodes.SUPABASE_ERROR,
        'Database operation failed',
        500,
        true,
        { original: error.message }
      );
    }
    
    // Parse network errors
    if (error.message.includes('fetch failed') || error.message.includes('NetworkError')) {
      return new AppError(
        ErrorCodes.NETWORK_ERROR,
        'Network request failed',
        0,
        true,
        { original: error.message }
      );
    }
    
    // Parse Thirdweb errors
    if (error.message.includes('thirdweb') || error.message.includes('Thirdweb')) {
      return new AppError(
        ErrorCodes.THIRDWEB_ERROR,
        'Blockchain operation failed',
        500,
        true,
        { original: error.message }
      );
    }
    
    return new AppError(
      ErrorCodes.UNKNOWN_ERROR,
      error.message,
      500,
      false
    );
  }
  
  return new AppError(
    ErrorCodes.UNKNOWN_ERROR,
    'An unexpected error occurred',
    500,
    false
  );
}

// User-friendly error messages
export function getUserFriendlyMessage(error: AppError): string {
  const messages: Record<string, string> = {
    [ErrorCodes.AUTH_REQUIRED]: 'Please sign in to continue',
    [ErrorCodes.AUTH_INVALID_TOKEN]: 'Your session has expired. Please sign in again',
    [ErrorCodes.AUTH_RATE_LIMITED]: 'Too many attempts. Please wait a moment',
    
    [ErrorCodes.WALLET_INSUFFICIENT_BALANCE]: 'Insufficient balance for this transaction',
    [ErrorCodes.WALLET_SPEND_LIMIT_EXCEEDED]: 'Daily transaction limit exceeded',
    [ErrorCodes.WALLET_INVALID_ADDRESS]: 'Invalid wallet address',
    
    [ErrorCodes.PAYMENT_INSUFFICIENT_FUNDS]: 'You need to add funds to complete this payment',
    [ErrorCodes.PAYMENT_INVALID_AMOUNT]: 'Please enter a valid amount',
    [ErrorCodes.PAYMENT_DUPLICATE]: 'This payment has already been processed',
    
    [ErrorCodes.USER_NOT_FOUND]: 'User not found',
    [ErrorCodes.USERNAME_TAKEN]: 'This username is already taken',
    
    [ErrorCodes.NETWORK_ERROR]: 'Network connection failed. Please check your internet',
    [ErrorCodes.THIRDWEB_ERROR]: 'Blockchain service temporarily unavailable',
    [ErrorCodes.SUPABASE_ERROR]: 'Database service temporarily unavailable',
  };
  
  return messages[error.code] || error.message || 'Something went wrong';
}

// Check if error is retryable
export function isRetryableError(error: AppError): boolean {
  const retryableCodes = [
    ErrorCodes.NETWORK_ERROR,
    ErrorCodes.THIRDWEB_ERROR,
    ErrorCodes.SUPABASE_ERROR,
  ];
  
  return retryableCodes.includes(error.code as any);
}
