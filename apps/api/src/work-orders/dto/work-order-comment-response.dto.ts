import { WorkOrderComment } from '../entities/work-order-comment.entity.js';

export class WorkOrderCommentResponseDto {
  id!: string;
  workOrderId!: string;
  content!: string;
  createdAt!: Date;

  author!: {
    id: string;
    fullName: string;
  };

  static fromEntity(
    comment: WorkOrderComment,
  ): WorkOrderCommentResponseDto {
    return {
      id: comment.id,
      workOrderId: comment.workOrderId,
      content: comment.content,
      createdAt: comment.createdAt,
      author: {
        id: comment.author.id,
        fullName: comment.author.fullName,
      },
    };
  }
}