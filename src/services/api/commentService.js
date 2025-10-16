import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export class CommentService {
  // Get all comments for a specific post
  static async getCommentsByPost(postId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        return [];
      }

      const params = {
        fields: [
          { field: { Name: 'Id' } },
          { field: { Name: 'content_c' } },
          { field: { Name: 'post_c' } },
          { field: { Name: 'author_c' } },
          { field: { Name: 'authorName_c' } },
          { field: { Name: 'upvotes_c' } },
          { field: { Name: 'downvotes_c' } },
          { field: { Name: 'CreatedOn' } }
        ],
        where: [
          {
            FieldName: 'post_c',
            Operator: 'EqualTo',
            Values: [parseInt(postId)]
          }
        ],
        orderBy: [
          {
            fieldName: 'CreatedOn',
            sorttype: 'DESC'
          }
        ]
      };

      const response = await apperClient.fetchRecords('comment_c', params);

      if (!response?.success) {
        console.error('Failed to fetch comments:', response?.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching comments:', error?.message || error);
      return [];
    }
  }

  // Get comment by ID
  static async getCommentById(commentId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        return null;
      }

      const params = {
        fields: [
          { field: { Name: 'Id' } },
          { field: { Name: 'content_c' } },
          { field: { Name: 'post_c' } },
          { field: { Name: 'author_c' } },
          { field: { Name: 'authorName_c' } },
          { field: { Name: 'upvotes_c' } },
          { field: { Name: 'downvotes_c' } },
          { field: { Name: 'CreatedOn' } }
        ]
      };

      const response = await apperClient.getRecordById('comment_c', commentId, params);

      if (!response?.success) {
        console.error(`Failed to fetch comment ${commentId}:`, response?.message);
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error(`Error fetching comment ${commentId}:`, error?.message || error);
      return null;
    }
  }

  // Create new comment
  static async createComment(commentData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        toast.error('Unable to create comment');
        return null;
      }

      const params = {
        records: [
          {
            content_c: commentData.content,
            post_c: parseInt(commentData.postId),
            author_c: parseInt(commentData.authorId),
            authorName_c: commentData.authorName,
            upvotes_c: 0,
            downvotes_c: 0
          }
        ]
      };

      const response = await apperClient.createRecord('comment_c', params);

      if (!response?.success) {
        console.error('Failed to create comment:', response?.message);
        toast.error(response?.message || 'Failed to create comment');
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create comment:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Comment added successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error creating comment:', error?.message || error);
      toast.error('Failed to create comment');
      return null;
    }
  }

  // Update comment (for voting)
  static async updateComment(commentId, updates) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        return null;
      }

      const params = {
        records: [
          {
            Id: parseInt(commentId),
            ...updates
          }
        ]
      };

      const response = await apperClient.updateRecord('comment_c', params);

      if (!response?.success) {
        console.error(`Failed to update comment ${commentId}:`, response?.message);
        toast.error(response?.message || 'Failed to update comment');
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update comment ${commentId}:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error(`Error updating comment ${commentId}:`, error?.message || error);
      toast.error('Failed to update comment');
      return null;
    }
  }

  // Delete comment
  static async deleteComment(commentId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error('ApperClient not initialized');
        toast.error('Unable to delete comment');
        return false;
      }

      const params = {
        RecordIds: [parseInt(commentId)]
      };

      const response = await apperClient.deleteRecord('comment_c', params);

      if (!response?.success) {
        console.error(`Failed to delete comment ${commentId}:`, response?.message);
        toast.error(response?.message || 'Failed to delete comment');
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete comment ${commentId}:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }

        if (successful.length > 0) {
          toast.success('Comment deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error(`Error deleting comment ${commentId}:`, error?.message || error);
      toast.error('Failed to delete comment');
      return false;
    }
  }

  // Vote on comment
  static async voteComment(commentId, voteType) {
    try {
      // Get current comment data
      const comment = await this.getCommentById(commentId);
      if (!comment) {
        toast.error('Comment not found');
        return null;
      }

      const updates = {};
      
      if (voteType === 'upvote') {
        updates.upvotes_c = (comment.upvotes_c || 0) + 1;
      } else if (voteType === 'downvote') {
        updates.downvotes_c = (comment.downvotes_c || 0) + 1;
      }

      return await this.updateComment(commentId, updates);
    } catch (error) {
      console.error(`Error voting on comment ${commentId}:`, error?.message || error);
      toast.error('Failed to vote on comment');
      return null;
    }
  }

  static delay() {
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  static async getAll() {
    await this.delay();
    return [...this.comments.map(comment => ({ ...comment }))];
  }

  static async getByPostId(postId) {
    await this.delay();
    const postComments = this.comments.filter(c => c.postId === parseInt(postId));
    return postComments.map(comment => ({ ...comment }));
  }

  static async getById(id) {
    await this.delay();
    const comment = this.comments.find(c => c.Id === parseInt(id));
    return comment ? { ...comment } : null;
  }

  static async create(commentData) {
    await this.delay();
    
    if (!commentData.content || !commentData.content.trim()) {
      throw new Error('Comment content is required');
    }

const newComment = {
      Id: Math.max(0, ...this.comments.map(c => c.Id)) + 1,
      postId: parseInt(commentData.postId),
      parentId: commentData.parentId ? parseInt(commentData.parentId) : null,
      author: commentData.author || 'Anonymous',
      content: commentData.content.trim(),
timestamp: new Date().toISOString(),
      score: 0
    };

    this.comments.push(newComment);
    return { ...newComment };
  }

  static async delete(id) {
    await this.delay();
    const index = this.comments.findIndex(c => c.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error('Comment not found');
    }

    const deletedComment = this.comments[index];
    this.comments.splice(index, 1);
    
    // Delete child comments
    this.comments = this.comments.filter(c => c.parentId !== parseInt(id));
    
    return { ...deletedComment };
  }

  static async updateScore(id, newScore) {
    await this.delay();
    const comment = this.comments.find(c => c.Id === parseInt(id));
    
    if (!comment) {
      throw new Error('Comment not found');
    }

    comment.score = newScore;
    return { ...comment };
  }
}