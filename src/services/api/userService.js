import { getApperClient } from "@/services/apperClient";

export const UserService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "bio_c"}},
          {"field": {"Name": "avatar_c"}},
          {"field": {"Name": "karma_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        orderBy: [{"fieldName": "created_at_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 50, "offset": 0}
      };
      
      const response = await apperClient.fetchRecords('user_c', params);
      
      if (!response.success) {
        console.error('Error in userService.getAll:', response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error in userService.getAll:', error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "bio_c"}},
          {"field": {"Name": "avatar_c"}},
          {"field": {"Name": "karma_c"}},
          {"field": {"Name": "created_at_c"}}
        ]
      };
      
      const response = await apperClient.getRecordById('user_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(`Error in userService.getById(${id}):`, response.message);
        return null;
      }
      
      return response.data || null;
    } catch (error) {
      console.error(`Error in userService.getById(${id}):`, error);
      return null;
    }
  },

  async create(userData) {
    try {
      const apperClient = getApperClient();
      
      // Only include updateable fields
      const params = {
        records: [{
          Name: userData.Name || userData.name,
          email_c: userData.email_c || userData.email,
          bio_c: userData.bio_c || userData.bio || '',
          avatar_c: userData.avatar_c || userData.avatar || ''
        }]
      };
      
      const response = await apperClient.createRecord('user_c', params);
      
      if (!response.success) {
        console.error('Error in userService.create:', response.message);
        return null;
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          return result.data;
        } else {
          console.error('Error in userService.create:', result.message || 'Create failed');
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error in userService.create:', error);
      return null;
    }
  },

  async update(id, userData) {
    try {
      const apperClient = getApperClient();
      
      // Only include updateable fields plus Id
      const params = {
        records: [{
          Id: parseInt(id),
          ...(userData.Name !== undefined && { Name: userData.Name }),
          ...(userData.email_c !== undefined && { email_c: userData.email_c }),
          ...(userData.bio_c !== undefined && { bio_c: userData.bio_c }),
          ...(userData.avatar_c !== undefined && { avatar_c: userData.avatar_c })
        }]
      };
      
      const response = await apperClient.updateRecord('user_c', params);
      
      if (!response.success) {
        console.error(`Error in userService.update(${id}):`, response.message);
        return null;
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          return result.data;
        } else {
          console.error(`Error in userService.update(${id}):`, result.message || 'Update failed');
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error in userService.update(${id}):`, error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('user_c', params);
      
      if (!response.success) {
        console.error(`Error in userService.delete(${id}):`, response.message);
        return false;
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success) {
          return true;
        } else {
          console.error(`Error in userService.delete(${id}):`, result.message || 'Delete failed');
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error in userService.delete(${id}):`, error);
      return false;
    }
  },

  async search(query) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "bio_c"}},
          {"field": {"Name": "avatar_c"}},
          {"field": {"Name": "karma_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [
            {
              conditions: [
                {
                  fieldName: "Name",
                  operator: "Contains",
                  values: [query]
                }
              ],
              operator: "OR"
            },
            {
              conditions: [
                {
                  fieldName: "email_c",
                  operator: "Contains",
                  values: [query]
                }
              ],
              operator: "OR"
            }
          ]
        }],
        orderBy: [{"fieldName": "karma_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 20, "offset": 0}
      };
      
      const response = await apperClient.fetchRecords('user_c', params);
      
      if (!response.success) {
        console.error('Error in userService.search:', response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error in userService.search:', error);
      return [];
    }
}
};