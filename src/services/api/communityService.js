import { getApperClient } from "@/services/apperClient";

export class CommunityService {
  static async search(query) {
    if (!query || !query.trim()) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.fetchRecords('community_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "member_count_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "post_count_c"}}
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [
            {
              conditions: [
                {
                  fieldName: "name_c",
                  operator: "Contains",
                  values: [searchTerm]
                }
              ],
              operator: ""
            },
            {
              conditions: [
                {
                  fieldName: "description_c",
                  operator: "Contains",
                  values: [searchTerm]
                }
              ],
              operator: ""
            },
            {
              conditions: [
                {
                  fieldName: "category_c",
                  operator: "Contains",
                  values: [searchTerm]
                }
              ],
              operator: ""
            }
          ]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      const results = [];
      for (const community of response.data || []) {
        let snippet = '';
        const nameMatch = community.name_c?.toLowerCase().includes(searchTerm);
        const descMatch = community.description_c?.toLowerCase().includes(searchTerm);
        const categoryMatch = community.category_c?.toLowerCase().includes(searchTerm);

        if (descMatch) {
          const index = community.description_c.toLowerCase().indexOf(searchTerm);
          const start = Math.max(0, index - 40);
          const end = Math.min(community.description_c.length, index + searchTerm.length + 40);
          snippet = community.description_c.substring(start, end);
        } else if (categoryMatch) {
          snippet = `Category: ${community.category_c}`;
        }

        results.push({
          community: {
            Id: community.Id,
            id: `community_${community.Id}`,
            name: community.name_c,
            description: community.description_c,
            memberCount: community.member_count_c || 0,
            color: community.color_c || "#FF4500",
            category: community.category_c,
            postCount: community.post_count_c || 0
          },
          snippet: snippet.trim()
        });
      }

      return results;
    } catch (error) {
      console.error("Error searching communities:", error);
      return [];
    }
  }

  static async getAll() {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.fetchRecords('community_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "member_count_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "post_count_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(community => ({
        Id: community.Id,
        id: `community_${community.Id}`,
        name: community.name_c,
        description: community.description_c,
        memberCount: community.member_count_c || 0,
        color: community.color_c || "#FF4500",
        category: community.category_c,
        postCount: community.post_count_c || 0
      }));
    } catch (error) {
      console.error("Error fetching communities:", error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.getRecordById('community_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "member_count_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "post_count_c"}}
        ]
      });

      if (!response.success || !response.data) {
        return null;
      }

      const community = response.data;
      return {
        Id: community.Id,
        id: `community_${community.Id}`,
        name: community.name_c,
        description: community.description_c,
        memberCount: community.member_count_c || 0,
        color: community.color_c || "#FF4500",
        category: community.category_c,
        postCount: community.post_count_c || 0
      };
    } catch (error) {
      console.error(`Error fetching community ${id}:`, error);
      return null;
    }
  }

  static async getByName(name) {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.fetchRecords('community_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "member_count_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "post_count_c"}}
        ],
        where: [{
          FieldName: "name_c",
          Operator: "EqualTo",
          Values: [name]
        }],
        pagingInfo: {
          limit: 1,
          offset: 0
        }
      });

      if (!response.success || !response.data || response.data.length === 0) {
        return null;
      }

      const community = response.data[0];
      return {
        Id: community.Id,
        id: `community_${community.Id}`,
        name: community.name_c,
        description: community.description_c,
        memberCount: community.member_count_c || 0,
        color: community.color_c || "#FF4500",
        category: community.category_c,
        postCount: community.post_count_c || 0
      };
    } catch (error) {
      console.error(`Error fetching community by name ${name}:`, error);
      return null;
    }
  }

  static async create(communityData) {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.createRecord('community_c', {
        records: [{
          Name: communityData.name,
          name_c: communityData.name,
          description_c: communityData.description,
          member_count_c: communityData.memberCount || 1,
          color_c: communityData.color || "#FF4500",
          category_c: communityData.category || "general",
          post_count_c: 0
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success && result.data) {
          const community = result.data;
          return {
            Id: community.Id,
            id: `community_${community.Id}`,
            name: community.name_c,
            description: community.description_c,
            memberCount: community.member_count_c || 0,
            color: community.color_c || "#FF4500",
            category: community.category_c,
            postCount: community.post_count_c || 0
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating community:", error);
      return null;
    }
  }

  static async update(id, updateData) {
    try {
      const apperClient = getApperClient();
      
      const updatePayload = {
        Id: parseInt(id)
      };

      if (updateData.name !== undefined) {
        updatePayload.Name = updateData.name;
        updatePayload.name_c = updateData.name;
      }
      if (updateData.description !== undefined) {
        updatePayload.description_c = updateData.description;
      }
      if (updateData.memberCount !== undefined) {
        updatePayload.member_count_c = updateData.memberCount;
      }
      if (updateData.color !== undefined) {
        updatePayload.color_c = updateData.color;
      }
      if (updateData.category !== undefined) {
        updatePayload.category_c = updateData.category;
      }
      if (updateData.postCount !== undefined) {
        updatePayload.post_count_c = updateData.postCount;
      }

      const response = await apperClient.updateRecord('community_c', {
        records: [updatePayload]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        if (result.success && result.data) {
          const community = result.data;
          return {
            Id: community.Id,
            id: `community_${community.Id}`,
            name: community.name_c,
            description: community.description_c,
            memberCount: community.member_count_c || 0,
            color: community.color_c || "#FF4500",
            category: community.category_c,
            postCount: community.post_count_c || 0
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`Error updating community ${id}:`, error);
      return null;
    }
  }

  static async delete(id) {
    try {
      const apperClient = getApperClient();
      
      const response = await apperClient.deleteRecord('community_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        return false;
      }

      if (response.results && response.results.length > 0) {
        return response.results[0].success;
      }

      return false;
    } catch (error) {
      console.error(`Error deleting community ${id}:`, error);
      return false;
}
  }
}