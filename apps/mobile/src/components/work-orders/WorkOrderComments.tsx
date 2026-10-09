import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppButton } from '../ui/AppButton';
import {
  createWorkOrderComment,
  getWorkOrderComments,
} from '../../services/work-orders.service';
import type { WorkOrderComment } from '../../types/work-order';
import { colors, radius, spacing, typography } from '../../theme';

type Props = {
  workOrderId: string;
};

const MAX_COMMENT_LENGTH = 1000;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const WorkOrderComments = ({ workOrderId }: Props) => {
  const [comments, setComments] = useState<WorkOrderComment[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const normalizedContent = content.trim();

  const canSubmit =
    normalizedContent.length > 0 &&
    normalizedContent.length <= MAX_COMMENT_LENGTH &&
    !isSubmitting;

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getWorkOrderComments(workOrderId);
      setComments(data);
    } catch (error) {
      setLoadError(
        getErrorMessage(error, 'Unable to load comments.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [workOrderId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createWorkOrderComment(workOrderId, {
        content: normalizedContent,
      });
    } catch (error) {
      setSubmitError(
        getErrorMessage(error, 'Unable to publish comment.'),
      );
      setIsSubmitting(false);
      return;
    }

    // The comment was saved successfully.
    setContent('');

    // A refresh failure must not trigger another POST.
    await loadComments();

    setIsSubmitting(false);
  };

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.sectionLabel}>COMMENTS</Text>
        {!isLoading && !loadError ? (
          <Text style={styles.count}>
            {comments.length}{' '}
            {comments.length === 1 ? 'comment' : 'comments'}
          </Text>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.secondaryText}>Loading comments...</Text>
        </View>
      ) : loadError ? (
        <View style={styles.card}>
          <Text style={styles.errorText}>{loadError}</Text>
          <View style={styles.retry}>
            <AppButton
              label="Retry"
              variant="outline"
              size="sm"
              fullWidth={false}
              onPress={() => void loadComments()}
            />
          </View>
        </View>
      ) : comments.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.secondaryText}>
            No comments yet. Start the conversation.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.card}>
              <View style={styles.commentHeader}>
                <Text style={styles.author}>
                  {comment.author.fullName ?? 'Team member'}
                </Text>
                <Text style={styles.date}>
                  {formatCommentDate(comment.createdAt)}
                </Text>
              </View>
              <Text style={styles.commentContent}>
                {comment.content}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.formLabel}>Add a comment</Text>

        <TextInput
          style={styles.input}
          value={content}
          onChangeText={(value) => {
            setContent(value);
            setSubmitError(null);
          }}
          placeholder="Write a comment..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={MAX_COMMENT_LENGTH}
          textAlignVertical="top"
          editable={!isSubmitting}
          accessibilityLabel="Write a work order comment"
        />

        <View style={styles.footer}>
          <Text style={styles.count}>
            {content.length}/{MAX_COMMENT_LENGTH}
          </Text>
        </View>

        {submitError ? (
          <Text style={styles.errorText}>{submitError}</Text>
        ) : null}

        <AppButton
          label="Publish comment"
          variant="primary"
          loading={isSubmitting}
          disabled={!canSubmit}
          onPress={() => void handleSubmit()}
        />
      </View>
    </View>
  );
};

const formatCommentDate = (date: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xxxl,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    marginBottom: spacing.md,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.5,
  },
  count: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
  loading: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  secondaryText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  author: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  date: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
  commentContent: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 21,
  },
  form: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  formLabel: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  input: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.fontSize.md,
    backgroundColor: colors.surface,
  },
  footer: {
    alignItems: 'flex-end',
  },
  errorText: {
    color: '#991B1B',
    fontSize: typography.fontSize.sm,
  },
  retry: {
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
});