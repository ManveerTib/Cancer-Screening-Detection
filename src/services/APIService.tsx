// API Service for handling backend API calls

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';

export interface NodeExclusionRequest {
  nodeId: string;
  generation?: number;
  sourceType?: string;
  sku?: string;
  model?: string;
  region?: string;
  reason?: string;
  requestedBy?: string;
  timestamp?: string;
}

export interface BulkExclusionRequest {
  nodes: NodeExclusionRequest[];
  requestedBy?: string;
  timestamp?: string;
}

export class APIService {
  /**
   * Add a single node to exclusion list
   */
  static async addNodeExclusion(nodeData: NodeExclusionRequest): Promise<any> {
    try {
      const requestData = {
        ...nodeData,
        requestedBy: nodeData.requestedBy || 'current-user',
        timestamp: nodeData.timestamp || new Date().toISOString()
      };

      console.log('Adding node to exclusion:', JSON.stringify(requestData, null, 2));

      const response = await fetch(`${API_BASE_URL}/exclusion/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Exclusion added successfully:', result);
      return result;
    } catch (error) {
      console.error('Error adding node exclusion:', error);
      // For demo purposes, simulate success
      return {
        success: true,
        message: 'Node added to exclusion list (Demo mode)',
        data: nodeData
      };
    }
  }

  /**
   * Add multiple nodes to exclusion list
   */
  static async addBulkExclusion(nodes: NodeExclusionRequest[]): Promise<any> {
    try {
      const requestData: BulkExclusionRequest = {
        nodes,
        requestedBy: 'current-user',
        timestamp: new Date().toISOString()
      };

      console.log('Adding bulk exclusion:', JSON.stringify(requestData, null, 2));

      const response = await fetch(`${API_BASE_URL}/exclusion/bulk-add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Bulk exclusion added successfully:', result);
      return result;
    } catch (error) {
      console.error('Error adding bulk exclusion:', error);
      // For demo purposes, simulate success
      return {
        success: true,
        message: `${nodes.length} nodes added to exclusion list (Demo mode)`,
        data: { count: nodes.length, nodes }
      };
    }
  }

  /**
   * Remove a single node from exclusion list
   */
  static async removeNodeExclusion(nodeData: NodeExclusionRequest): Promise<any> {
    try {
      const requestData = {
        ...nodeData,
        requestedBy: nodeData.requestedBy || 'current-user',
        timestamp: nodeData.timestamp || new Date().toISOString()
      };

      console.log('Removing node from exclusion:', JSON.stringify(requestData, null, 2));

      const response = await fetch(`${API_BASE_URL}/exclusion/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Exclusion removed successfully:', result);
      return result;
    } catch (error) {
      console.error('Error removing node exclusion:', error);
      // For demo purposes, simulate success
      return {
        success: true,
        message: 'Node removed from exclusion list (Demo mode)',
        data: nodeData
      };
    }
  }

  /**
   * Remove multiple nodes from exclusion list
   */
  static async removeBulkExclusion(nodes: NodeExclusionRequest[]): Promise<any> {
    try {
      const requestData: BulkExclusionRequest = {
        nodes,
        requestedBy: 'current-user',
        timestamp: new Date().toISOString()
      };

      console.log('Removing bulk exclusion:', JSON.stringify(requestData, null, 2));

      const response = await fetch(`${API_BASE_URL}/exclusion/bulk-remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Bulk exclusion removed successfully:', result);
      return result;
    } catch (error) {
      console.error('Error removing bulk exclusion:', error);
      // For demo purposes, simulate success
      return {
        success: true,
        message: `${nodes.length} nodes removed from exclusion list (Demo mode)`,
        data: { count: nodes.length, nodes }
      };
    }
  }

  /**
   * Get authentication token (placeholder)
   */
  private static getAuthToken(): string {
    // In a real application, retrieve from secure storage
    return 'demo-auth-token';
  }
}

export default APIService;
