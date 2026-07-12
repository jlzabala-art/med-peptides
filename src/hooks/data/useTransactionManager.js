import { useCallback, useState } from 'react';
import { 
  serverCreateQuotationRequest, 
  serverCreateQuotation, 
  serverConvertQuotationToOrder, 
  serverCreateInvoice 
} from '../../app/actions/transactionActions';

/**
 * Hook for managing the complete lifecycle of transactions:
 * RFQ -> Quotation -> Order -> Invoice
 * Now delegates logic to secure Server Actions to protect business rules.
 */
export function useTransactionManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 1. Create a Request for Quotation (RFQ)
   */
  const createQuotationRequest = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      return await serverCreateQuotationRequest(params);
    } catch (err) {
      console.error("Error creating RFQ:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 2. Create a Quotation
   */
  const createQuotation = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      return await serverCreateQuotation(params);
    } catch (err) {
      console.error("Error creating Quotation:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 3. Convert Quotation to Order
   */
  const convertQuotationToOrder = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      return await serverConvertQuotationToOrder(params);
    } catch (err) {
      console.error("Error converting quotation to order:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 4. Create Invoice
   */
  const createInvoice = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      return await serverCreateInvoice(params);
    } catch (err) {
      console.error("Error creating Invoice:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createQuotationRequest,
    createQuotation,
    convertQuotationToOrder,
    createInvoice,
    loading,
    error
  };
}
