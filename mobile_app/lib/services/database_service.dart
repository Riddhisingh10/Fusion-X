import 'package:supabase_flutter/supabase_flutter.dart';

/// Service layer that talks to Supabase Postgres via the PostgREST API.
/// All queries go through Row Level Security (RLS) automatically.
class DatabaseService {
  final SupabaseClient _client = Supabase.instance.client;

  // ── Profiles ──

  Future<Map<String, dynamic>?> getMyProfile() async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) return null;

    final data = await _client
        .from('profiles')
        .select()
        .eq('id', uid)
        .maybeSingle();
    return data;
  }

  // ── Notes ──

  Future<List<Map<String, dynamic>>> getNotes() async {
    final data = await _client
        .from('notes')
        .select()
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(data);
  }

  Future<void> insertNote(String title, String college) async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) throw Exception('Not authenticated');
    await _client.from('notes').insert({
      'author_id': uid,
      'title': title,
      'college': college,
    });
  }

  Future<void> deleteNote(String noteId) async {
    await _client.from('notes').delete().eq('id', noteId);
  }

  // ── Study Groups ──

  Future<List<Map<String, dynamic>>> getStudyGroups() async {
    final data = await _client
        .from('study_groups')
        .select()
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(data);
  }

  Future<void> createStudyGroup(String name) async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) throw Exception('Not authenticated');
    await _client.from('study_groups').insert({
      'name': name,
      'creator_id': uid,
    });
  }

  Future<void> joinGroup(String groupId) async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) throw Exception('Not authenticated');
    await _client.from('group_members').insert({
      'group_id': groupId,
      'user_id': uid,
    });
  }

  Future<void> leaveGroup(String groupId) async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) throw Exception('Not authenticated');
    await _client
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', uid);
  }

  // ── Messages ──

  Future<List<Map<String, dynamic>>> getMessages(String groupId) async {
    final data = await _client
        .from('messages')
        .select()
        .eq('group_id', groupId)
        .order('created_at', ascending: true);
    return List<Map<String, dynamic>>.from(data);
  }

  Future<void> sendMessage(String groupId, String content) async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) throw Exception('Not authenticated');
    await _client.from('messages').insert({
      'group_id': groupId,
      'sender_id': uid,
      'content': content,
    });
  }

  /// Subscribe to realtime message inserts for a group.
  RealtimeChannel subscribeToMessages(
    String groupId,
    void Function(Map<String, dynamic> payload) onInsert,
  ) {
    return _client
        .channel('messages:$groupId')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'messages',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'group_id',
            value: groupId,
          ),
          callback: (payload) {
            onInsert(payload.newRecord);
          },
        )
        .subscribe();
  }

  // ── Anonymous Feedback ──

  Future<void> submitAnonymousFeedback({
    required String collegeId,
    required String category,
    required String content,
    required String dailyHash,
  }) async {
    await _client.from('anonymous_feedback').insert({
      'college_id': collegeId,
      'category': category,
      'content': content,
      'daily_hash': dailyHash,
    });
  }

  /// Admin-only: fetch feedback list.
  Future<List<Map<String, dynamic>>> getFeedback() async {
    final data = await _client
        .from('anonymous_feedback')
        .select()
        .order('created_at', ascending: false);
    return List<Map<String, dynamic>>.from(data);
  }

  // ── Feedback (standard) ──

  Future<void> submitFeedback(String content) async {
    await _client.from('feedback').insert({'content': content});
  }
}
