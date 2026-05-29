import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/app_theme.dart';
import '../services/database_service.dart';

class ChatScreen extends StatefulWidget {
  final String groupId;
  final String groupName;

  const ChatScreen({
    super.key,
    required this.groupId,
    required this.groupName,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _db = DatabaseService();
  final _msgCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  List<Map<String, dynamic>> _messages = [];
  bool _isLoading = true;
  RealtimeChannel? _channel;

  String get _myId => Supabase.instance.client.auth.currentUser?.id ?? '';

  @override
  void initState() {
    super.initState();
    _loadMessages();
    _subscribeRealtime();
  }

  Future<void> _loadMessages() async {
    try {
      final data = await _db.getMessages(widget.groupId);
      setState(() {
        _messages = data;
        _isLoading = false;
      });
      _scrollToBottom();
    } catch (_) {
      setState(() {
        _messages = [
          {
            'sender_id': 'other-sender-id',
            'content': 'Hey everyone! Welcome to the study group.',
            'created_at': DateTime.now().subtract(const Duration(minutes: 10)).toIso8601String(),
          },
          {
            'sender_id': _myId,
            'content': 'Hi! Excited to study together.',
            'created_at': DateTime.now().subtract(const Duration(minutes: 8)).toIso8601String(),
          },
          {
            'sender_id': 'other-sender-id',
            'content': 'Should we schedule a session for PCB routing practice tonight?',
            'created_at': DateTime.now().subtract(const Duration(minutes: 5)).toIso8601String(),
          }
        ];
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  void _subscribeRealtime() {
    try {
      _channel = _db.subscribeToMessages(widget.groupId, (newMsg) {
        setState(() => _messages.add(newMsg));
        _scrollToBottom();
      });
    } catch (_) {}
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _send() async {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;
    _msgCtrl.clear();

    final localMsg = {
      'sender_id': _myId,
      'content': text,
      'created_at': DateTime.now().toIso8601String(),
    };

    setState(() {
      _messages.add(localMsg);
    });
    _scrollToBottom();

    try {
      await _db.sendMessage(widget.groupId, text);
    } catch (_) {
      // Allow local-only append in fallback
    }
  }

  @override
  void dispose() {
    _channel?.unsubscribe();
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: Text(widget.groupName,
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: AppTheme.bgPrimary,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.group_outlined, color: AppTheme.textMuted),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _isLoading
                ? const Center(
                    child:
                        CircularProgressIndicator(color: AppTheme.accentBlue))
                : _messages.isEmpty
                    ? Center(
                        child: Text('No messages yet. Say hello!',
                            style: GoogleFonts.inter(
                                fontSize: 14, color: AppTheme.textMuted)),
                      )
                    : ListView.builder(
                        controller: _scrollCtrl,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (_, i) {
                          final msg = _messages[i];
                          final isMe = msg['sender_id'] == _myId;
                          return _bubble(msg, isMe);
                        },
                      ),
          ),

          // ── Input bar ──
          Container(
            padding: EdgeInsets.fromLTRB(
                16, 10, 8, MediaQuery.of(context).padding.bottom + 10),
            decoration: const BoxDecoration(
              color: AppTheme.bgCard,
              border: Border(
                  top: BorderSide(color: AppTheme.divider, width: 0.5)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    maxLength: 1000,
                    maxLines: 3,
                    minLines: 1,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      hintStyle:
                          const TextStyle(color: AppTheme.textMuted),
                      counterText: '',
                      filled: true,
                      fillColor: AppTheme.bgPrimary,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    onSubmitted: (_) => _send(),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: _send,
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: const BoxDecoration(
                      color: AppTheme.accentBlue,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.send_rounded,
                        size: 20, color: AppTheme.bgPrimary),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _bubble(Map<String, dynamic> msg, bool isMe) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.75),
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isMe
              ? AppTheme.accentBlue.withValues(alpha: 0.15)
              : AppTheme.bgCard,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isMe ? 16 : 4),
            bottomRight: Radius.circular(isMe ? 4 : 16),
          ),
        ),
        child: Column(
          crossAxisAlignment:
              isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Text(
              msg['content'] ?? '',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              _formatTime(msg['created_at']),
              style:
                  GoogleFonts.inter(fontSize: 10, color: AppTheme.textMuted),
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(String? iso) {
    if (iso == null) return '';
    try {
      final dt = DateTime.parse(iso).toLocal();
      return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return '';
    }
  }
}
