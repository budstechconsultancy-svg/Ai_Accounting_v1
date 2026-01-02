/**
 * Inventory Reports API Service
 * 
 * Service layer for fetching inventory report data from backend APIs.
 * All functions return promises with typed data.
 */

import axios from 'axios';
import type {
    ReportFilters,
    ReportApiResponse,
    StockSummaryData,
    InventoryValuationData,
    InventoryValuationDetailData,
    InventoryAgingData,
    ItemDetailsData,
    SalesByItemData,
    PurchasesByItemData,
    InventoryAdjustmentData,
    WarehouseSummaryData,
    WarehouseDetailData
} from '../types/inventoryReports';

const API_BASE_URL = '/api/inventory/reports';

// Helper to build query string from filters
const buildQueryString = (filters: Partial<ReportFilters>): string => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
            params.append(key, String(value));
        }
    });
    return params.toString();
};

/**
 * Fetch Stock Summary Report
 */
export const fetchStockSummary = async (
    filters: Partial<ReportFilters>
): Promise<ReportApiResponse<StockSummaryData>> => {
    const queryString = buildQueryString(filters);
    const response = await axios.get(`${API_BASE_URL}/stock-summary?${queryString}`);
    return response.data;
};

/**
 * Fetch Inventory Valuation Summary
 */
export const fetchInventoryValuationSummary = async (
    filters: Partial<ReportFilters>
): Promise<ReportApiResponse<InventoryValuationData>> => {
    const queryString = buildQueryString(filters);
    const response = await axios.get(`${API_BASE_URL}/inventory-valuation-summary?${queryString}`);
    return response.data;
};

/**
 * Fetch Inventory Valuation Detail
 */
export const fetchInventoryValuationDetail = async (
    filters: Partial<ReportFilters>
): Promise<ReportApiResponse<InventoryValuationDetailData>> => {
    const queryString = buildQueryString(filters);
    const response = await axios.get(`${API_BASE_URL}/inventory-valuation-detail?${queryString}`);
    return response.data;
};

/**
 * Fetch Inventory Aging Report
 */
export const fetchInventoryAging = async (
    filters: Partial<ReportFilters>
): Promise<ReportApiResponse<InventoryAgingData>> => {
    const queryString = buildQueryString(filters);
    const response = await axios.get(`${API_BASE_URL}/inventory-aging?${queryString}`);
    return response.data;
};

/**
 * Fetch Item Details Report
 */
export const fetchItemDetails = async (
    filters: Partial<ReportFilters>
): Promise<ReportApiResponse<ItemDetailsData>> => {
    const queryString = buildQueryString(filters);
    const response = await axios.get(`${API_BASE_URL}/item-details?${queryString}`);
    return response.data;
};

/**
 * Fetch Sales by Item Report
 */
export const fetchSalesByItem = async (
    filters: Partial<ReportFilters>
): Promise<ReportApiResponse<SalesByItemData>> => {
    const queryString = buildQueryString(filters);
    const response = await axios.get(`${API_BASE_URL}/sales-by-item?${queryString}`);
    return response.data;
};

/**
 * Fetch Purchases by Item Report
 */
export const fetchPurchasesByItem = async (
    filters: Partial<ReportFilters>
): Promise<ReportApiResponse<PurchasesByItemData>> => {
    const queryString = buildQueryString(filters);
    const response = await axios.get(`${API_BASE_URL}/purchases-by-item?${queryString}`);
    return response.data;
};

/**
 * Fetch Inventory Adjustment Report
 */
export const fetchInventoryAdjustment = async (
    filters: Partial<ReportFilters>
): Promise<ReportApiResponse<InventoryAdjustmentData>> => {
    const queryString = buildQueryString(filters);
    const response = await axios.get(`${API_BASE_URL}/inventory-adjustment?${queryString}`);
    return response.data;
};

/**
 * Fetch Warehouse Summary Report
 */
export const fetchWarehouseSummary = async (
    filters: Partial<ReportFilters>
): Promise<ReportApiResponse<WarehouseSummaryData>> => {
    const queryString = buildQueryString(filters);
    const response = await axios.get(`${API_BASE_URL}/warehouse-summary?${queryString}`);
    return response.data;
};

/**
 * Fetch Warehouse Detail Report
 */
export const fetchWarehouseDetail = async (
    filters: Partial<ReportFilters>
): Promise<ReportApiResponse<WarehouseDetailData>> => {
    const queryString = buildQueryString(filters);
    const response = await axios.get(`${API_BASE_URL}/warehouse-detail?${queryString}`);
    return response.data;
};
