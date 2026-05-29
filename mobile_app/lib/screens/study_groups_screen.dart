import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/app_theme.dart';
import '../services/database_service.dart';
import 'chat_screen.dart';

class StudyGroupsScreen extends StatefulWidget {
  const StudyGroupsScreen({super.key});

  @override
  State<StudyGroupsScreen> createState() => _StudyGroupsScreenState();
}

class _StudyGroupsScreenState extends State<StudyGroupsScreen> {
  final _db = DatabaseService();
  List<Map<String, dynamic>> _groups = [];
  bool _isLoading = true;

  String get _myId => Supabase.instance.client.auth.currentUser?.id ?? '';

  @override
  void initState() {
    super.initState();
    _loadGroups();
  }

  Future<void> _loadGroups() async {
    setState(() => _isLoading = true);
    try {
      final data = await _db.getStudyGroups();
      setState(() => _groups = data);
    } catch (_) {
      setState(() {
        _groups = [
          {
            'id': 'mock-group-1',
            'name': 'PCB Designing Study Squad',
            'creator_id': 'other-id',
          },
          {
            'id': 'mock-group-2',
            'name': 'Computer Networks Prep',
            'creator_id': _myId,
          },
          {
            'id': 'mock-group-3',
            'name': 'Exam Preparation 2026',
            'creator_id': 'other-id',
          }
        ];
      });
    }
    setState(() => _isLoading = false);
  }

  Future<void> _createGroup() async {
    final nameCtrl = TextEditingController();

    final result = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: AppTheme.bgCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(
            24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Create Study Group',
                style: GoogleFonts.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary)),
            const SizedBox(height: 16),
            TextField(
              controller: nameCtrl,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration:
                  const InputDecoration(hintText: 'Group name (e.g. Calculus Squad)'),
              autofocus: true,
            ),
            const SizedBox(height: 18),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, nameCtrl.text),
              child: const Text('Create Group'),
            ),
          ],
        ),
      ),
    );

    if (result != null && result.trim().isNotEmpty) {
      try {
        await _db.createStudyGroup(result.trim());
        _loadGroups();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text('Error: $e'),
                backgroundColor: AppTheme.accentRed),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title:
            Text('Study Groups', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: AppTheme.bgPrimary,
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _createGroup,
        backgroundColor: AppTheme.accentBlue,
        child: const Icon(Icons.group_add_rounded, color: AppTheme.bgPrimary),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.accentBlue))
          : _groups.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.groups_outlined,
                          size: 56,
                          color: AppTheme.textMuted.withValues(alpha: 0.5)),
                      const SizedBox(height: 12),
                      Text('No study groups yet',
                          style: GoogleFonts.inter(
                              fontSize: 15, color: AppTheme.textMuted)),
                      const SizedBox(height: 4),
                      Text('Tap + to create one',
                          style: GoogleFonts.inter(
                              fontSize: 12, color: AppTheme.textMuted)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadGroups,
                  color: AppTheme.accentBlue,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _groups.length,
                    itemBuilder: (_, i) {
                      final group = _groups[i];
                      final isCreator = group['creator_id'] == _myId;

                      return GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ChatScreen(
                                groupId: group['id'],
                                groupName: group['name'] ?? 'Group',
                              ),
                            ),
                          );
                        },
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppTheme.bgCard,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: AppTheme.accentIndigo
                                      .withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Icon(Icons.groups_rounded,
                                    color: AppTheme.accentIndigo, size: 22),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      group['name'] ?? 'Unnamed Group',
                                      style: GoogleFonts.inter(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                        color: AppTheme.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        if (isCreator) ...[
                                          Container(
                                            padding:
                                                const EdgeInsets.symmetric(
                                                    horizontal: 6,
                                                    vertical: 2),
                                            decoration: BoxDecoration(
                                              color: AppTheme.accentGreen
                                                  .withValues(alpha: 0.15),
                                              borderRadius:
                                                  BorderRadius.circular(4),
                                            ),
                                            child: Text('Creator',
                                                style: GoogleFonts.inter(
                                                    fontSize: 10,
                                                    color: AppTheme
                                                        .accentGreen,
                                                    fontWeight:
                                                        FontWeight.w600)),
                                          ),
                                          const SizedBox(width: 8),
                                        ],
                                        Text(
                                          'Tap to open chat',
                                          style: GoogleFonts.inter(
                                              fontSize: 12,
                                              color: AppTheme.textMuted),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.chevron_right_rounded,
                                  color: AppTheme.textMuted),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
