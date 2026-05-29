import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import '../config/app_theme.dart';

class PrepcareScreen extends StatefulWidget {
  const PrepcareScreen({super.key});

  @override
  State<PrepcareScreen> createState() => _PrepcareScreenState();
}

class _PrepcareScreenState extends State<PrepcareScreen> {
  final _storage = const FlutterSecureStorage();
  final _textCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _imagePicker = ImagePicker();

  List<Map<String, dynamic>> _sessions = [];
  String? _currentSessionId;
  List<Map<String, dynamic>> _messages = [];
  
  File? _selectedImage;
  String? _selectedImageBase64;
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    _loadSessions();
  }

  Future<void> _loadSessions() async {
    try {
      final saved = await _storage.read(key: 'prepcare_chat_sessions');
      if (saved != null) {
        final List<dynamic> parsed = jsonDecode(saved);
        setState(() {
          _sessions = List<Map<String, dynamic>>.from(parsed);
          if (_sessions.isNotEmpty) {
            _currentSessionId = _sessions[0]['id'];
            _messages = List<Map<String, dynamic>>.from(_sessions[0]['messages']);
          } else {
            _initializeDefaultSession();
          }
        });
      } else {
        _initializeDefaultSession();
      }
    } catch (e) {
      debugPrint('Error loading sessions: $e');
      _initializeDefaultSession();
    }
  }

  void _initializeDefaultSession() {
    final newId = 'session-${DateTime.now().millisecondsSinceEpoch}';
    final initialWelcome = [
      {
        'id': 'welcome',
        'sender': 'ai',
        'text': 'Hello! I am Prepcare, your AI Study Assistant. Ask me any academic questions, or scan a problem image to solve!',
        'timestamp': _formatTimeNow(),
      }
    ];
    final defaultSession = {
      'id': newId,
      'title': 'New Study Session',
      'messages': initialWelcome,
      'timestamp': _formatDateNow(),
    };
    setState(() {
      _sessions = [defaultSession];
      _currentSessionId = newId;
      _messages = initialWelcome;
    });
    _saveSessionsToStorage();
  }

  Future<void> _saveSessionsToStorage() async {
    try {
      await _storage.write(
        key: 'prepcare_chat_sessions',
        value: jsonEncode(_sessions),
      );
    } catch (e) {
      debugPrint('Error saving sessions: $e');
    }
  }

  void _startNewChat() {
    final newId = 'session-${DateTime.now().millisecondsSinceEpoch}';
    final initialWelcome = [
      {
        'id': 'welcome',
        'sender': 'ai',
        'text': 'Hello! I am Prepcare, your AI Study Assistant. Ask me any academic questions, or scan a problem image to solve!',
        'timestamp': _formatTimeNow(),
      }
    ];
    final newSession = {
      'id': newId,
      'title': 'New Study Session',
      'messages': initialWelcome,
      'timestamp': _formatDateNow(),
    };
    setState(() {
      _sessions.insert(0, newSession);
      _currentSessionId = newId;
      _messages = initialWelcome;
    });
    _saveSessionsToStorage();
    Navigator.of(context).pop(); // Close drawer
  }

  void _selectSession(String sessionId) {
    final idx = _sessions.indexWhere((s) => s['id'] == sessionId);
    if (idx != -1) {
      setState(() {
        _currentSessionId = sessionId;
        _messages = List<Map<String, dynamic>>.from(_sessions[idx]['messages']);
      });
    }
    Navigator.of(context).pop(); // Close drawer
  }

  void _deleteSession(String sessionId) {
    setState(() {
      _sessions.removeWhere((s) => s['id'] == sessionId);
      if (_sessions.isEmpty) {
        _initializeDefaultSession();
      } else {
        if (_currentSessionId == sessionId) {
          _currentSessionId = _sessions[0]['id'];
          _messages = List<Map<String, dynamic>>.from(_sessions[0]['messages']);
        }
      }
    });
    _saveSessionsToStorage();
  }

  void _updateActiveSessionInList() {
    if (_currentSessionId == null) return;
    final idx = _sessions.indexWhere((s) => s['id'] == _currentSessionId);
    if (idx != -1) {
      setState(() {
        String title = _sessions[idx]['title'];
        if (title == 'New Study Session') {
          final firstUser = _messages.firstWhere(
            (m) => m['sender'] == 'user',
            orElse: () => {'text': ''},
          );
          final String userText = firstUser['text'] ?? '';
          if (userText.isNotEmpty) {
            title = userText.length > 25
                ? '${userText.substring(0, 22)}...'
                : userText;
          }
        }
        _sessions[idx]['title'] = title;
        _sessions[idx]['messages'] = _messages;
      });
      _saveSessionsToStorage();
    }
  }

  Future<void> _pickImage() async {
    try {
      final XFile? file = await _imagePicker.pickImage(source: ImageSource.gallery);
      if (file != null) {
        final bytes = await file.readAsBytes();
        setState(() {
          _selectedImage = File(file.path);
          _selectedImageBase64 = 'data:image/png;base64,${base64Encode(bytes)}';
        });
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
    }
  }

  Future<void> _sendMessage() async {
    final text = _textCtrl.text.trim();
    if (text.isEmpty && _selectedImage == null) return;

    _textCtrl.clear();
    final imgBase64 = _selectedImageBase64;
    final imgPath = _selectedImage?.path;

    setState(() {
      _messages.add({
        'id': 'msg-${DateTime.now().millisecondsSinceEpoch}',
        'sender': 'user',
        'text': text,
        'image': imgPath, // local file path for UI rendering
        'timestamp': _formatTimeNow(),
      });
      _selectedImage = null;
      _selectedImageBase64 = null;
      _isTyping = true;
    });
    _scrollToBottom();
    _updateActiveSessionInList();

    try {
      final String host = defaultTargetPlatform == TargetPlatform.android ? '10.0.2.2' : 'localhost';
      final response = await http.post(
        Uri.parse('http://$host:3000/api/ai-chat'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'message': text,
          if (imgBase64 != null) 'image': imgBase64,
          'history': _messages.map((m) => {
            'sender': m['sender'],
            'text': m['text'],
          }).toList(),
        }),
      ).timeout(const Duration(seconds: 180));

      if (response.statusCode == 200) {
        final resData = jsonDecode(response.body);
        final replyText = resData['text'] ?? 'No reply from Prepcare.';
        setState(() {
          _messages.add({
            'id': 'msg-${DateTime.now().millisecondsSinceEpoch}',
            'sender': 'ai',
            'text': replyText,
            'timestamp': _formatTimeNow(),
          });
          _isTyping = false;
        });
      } else {
        throw Exception('Status code: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Connection to backend failed, falling back to local fallback logic: $e');
      _handleOfflineFallback(text);
    }

    _scrollToBottom();
    _updateActiveSessionInList();
  }

  void _handleOfflineFallback(String message) {
    final academicKeywords = [
      'voltage', 'diode', 'circuit', 'pcb', 'transistor', 'capacitor', 'resistor', 'network',
      'osi model', 'tcp', 'ip', 'ethernet', 'communication', 'optical', 'frequency', 'signal',
      'fourier', 'laplace', 'differential', 'integral', 'math', 'physics', 'chemistry', 'electronics',
      'electrical', 'microcontroller', 'embedded', 'sensor', 'programming', 'code', 'algorithm',
      'op-amp', 'amplifier', 'altium', 'kicad', 'schematic', 'soldering', 'induction', 'transformer',
      'motor', 'maxwell', 'electromagnetic', 'wave', 'antenna', 'laser', 'fiber', '5g', 'lte', 'study',
      'exam', 'explain', 'how to', 'what is', 'solve', 'derive', 'definition'
    ];
    
    final cleanText = message.toLowerCase();
    final isAcademic = academicKeywords.any((k) => cleanText.contains(k)) || message.length > 30;

    String reply = '';
    if (isAcademic) {
      reply = '''⚠️ **[Local Ollama Server Offline - Demo Tutor Mode]**

Could not connect to your local Ollama service at **http://127.0.0.1:11434**. To enable fully private dynamic AI, start Ollama and run `ollama pull gemma4:latest`.

Here is a study assistant response for your query *"$message"*:

- **Topic Overview**: Your query relates to core engineering study areas (Electronics, Electrical, PCB, or Communication Networks).
- **Core Concept**: 
  1. For circuits/hardware, ensure proper ground plane separation and trace impedance matching.
  2. For networks, follow layered models (OSI/TCP-IP) to guarantee reliable routing and message framing.
- **Formulas & Rules**: 
  - V = I * R (Ohm's Law)
  - f_c = 1 / (2 * pi * R * C) (Cutoff frequency for active filters)

*Ask another study question or start your local Ollama server to unlock full generative AI responses.*''';
    } else {
      reply = '''⚠️ **[Local Ollama Server Offline - Non-Academic Query Blocked]**

Could not connect to your local Ollama service at **http://127.0.0.1:11434**.

**Prepcare Tutor Policy:**
I received your query: *"$message"*.
I can only help with academic and study-related topics (like Electronics, Electricals, PCB Designing, or Communication Networks).

Please make sure to query me only with academic problems. Once Ollama is running with `gemma4:latest`, we will utilize your local GPU/CPU for fully private, locally-processed answers!''';
    }

    setState(() {
      _messages.add({
        'id': 'msg-${DateTime.now().millisecondsSinceEpoch}',
        'sender': 'ai',
        'text': reply,
        'timestamp': _formatTimeNow(),
      });
      _isTyping = false;
    });
  }

  void _clearCurrentChat() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Clear Chat?'),
        content: const Text('Do you want to reset current conversation?'),
        actions: [
          TextButton(
            child: const Text('Cancel'),
            onPressed: () => Navigator.of(ctx).pop(),
          ),
          TextButton(
            child: const Text('Clear', style: TextStyle(color: AppTheme.accentRed)),
            onPressed: () {
              Navigator.of(ctx).pop();
              setState(() {
                _messages = [
                  {
                    'id': 'welcome',
                    'sender': 'ai',
                    'text': 'Hello! I am Prepcare, your AI Study Assistant. Ask me any academic questions, or upload an image of a problem to scan and solve!',
                    'timestamp': _formatTimeNow(),
                  }
                ];
              });
              _updateActiveSessionInList();
            },
          )
        ],
      ),
    );
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  String _formatTimeNow() {
    final now = DateTime.now();
    return '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
  }

  String _formatDateNow() {
    final now = DateTime.now();
    return '${now.day}/${now.month}/${now.year}';
  }

  List<TextSpan> _parseMarkdown(String text) {
    final List<TextSpan> spans = [];
    final RegExp regex = RegExp(r'(\*\*.*?\*\*|`.*?`|\n)');
    
    int lastIndex = 0;
    for (final match in regex.allMatches(text)) {
      if (match.start > lastIndex) {
        spans.add(TextSpan(
          text: text.substring(lastIndex, match.start),
          style: const TextStyle(color: AppTheme.textPrimary, height: 1.4),
        ));
      }
      
      final matchedText = match.group(0)!;
      if (matchedText == '\n') {
        spans.add(const TextSpan(text: '\n'));
      } else if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        spans.add(TextSpan(
          text: matchedText.substring(2, matchedText.length - 2),
          style: const TextStyle(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.bold,
            height: 1.4,
          ),
        ));
      } else if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
        spans.add(TextSpan(
          text: matchedText.substring(1, matchedText.length - 1),
          style: GoogleFonts.firaCode(
            color: AppTheme.accentBlue,
            fontSize: 13,
            backgroundColor: Colors.black38,
          ),
        ));
      }
      lastIndex = match.end;
    }
    
    if (lastIndex < text.length) {
      spans.add(TextSpan(
        text: text.substring(lastIndex),
        style: const TextStyle(color: AppTheme.textPrimary, height: 1.4),
      ));
    }
    
    return spans;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Prepcare', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
            Text('Academic & Study Assistant', style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted)),
          ],
        ),
        backgroundColor: AppTheme.bgCard,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppTheme.textMuted),
            onPressed: _clearCurrentChat,
            tooltip: 'Clear Chat',
          ),
          Builder(
            builder: (ctx) => IconButton(
              icon: const Icon(Icons.history_rounded, color: AppTheme.textMuted),
              onPressed: () => Scaffold.of(ctx).openEndDrawer(),
              tooltip: 'History',
            ),
          ),
        ],
      ),
      endDrawer: _buildHistoryDrawer(),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView.builder(
                controller: _scrollCtrl,
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length + (_isTyping ? 1 : 0),
                itemBuilder: (ctx, i) {
                  if (i == _messages.length) {
                    return _buildTypingIndicator();
                  }
                  final msg = _messages[i];
                  final isMe = msg['sender'] == 'user';
                  return _buildMessageBubble(msg, isMe);
                },
              ),
            ),
            if (_selectedImage != null) _buildImagePreview(),
            _buildInputComposer(),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryDrawer() {
    return Drawer(
      backgroundColor: AppTheme.bgCard,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppTheme.divider, width: 0.5)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Study History',
                  style: GoogleFonts.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: _startNewChat,
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('New Chat'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.accentIndigo,
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(40),
                  ),
                )
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _sessions.length,
              itemBuilder: (ctx, i) {
                final session = _sessions[i];
                final isCurrent = session['id'] == _currentSessionId;
                return Container(
                  margin: const EdgeInsets.only(bottom: 6),
                  decoration: BoxDecoration(
                    color: isCurrent ? AppTheme.accentIndigo.withValues(alpha: 0.15) : Colors.transparent,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isCurrent ? AppTheme.accentIndigo.withValues(alpha: 0.3) : Colors.transparent,
                    ),
                  ),
                  child: ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    title: Text(
                      session['title'] ?? 'Study Session',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: isCurrent ? FontWeight.w600 : FontWeight.normal,
                        color: AppTheme.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    subtitle: Text(
                      session['timestamp'] ?? '',
                      style: GoogleFonts.inter(fontSize: 10, color: AppTheme.textMuted),
                    ),
                    trailing: IconButton(
                      icon: const Icon(Icons.delete_outline, size: 18, color: AppTheme.textMuted),
                      onPressed: () => _deleteSession(session['id']),
                    ),
                    onTap: () => _selectSession(session['id']),
                  ),
                );
              },
            ),
          )
        ],
      ),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> msg, bool isMe) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
        margin: const EdgeInsets.only(bottom: 12),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!isMe) ...[
              Container(
                margin: const EdgeInsets.only(right: 8, top: 4),
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [AppTheme.accentIndigo, AppTheme.accentBlue]),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.auto_awesome_rounded, size: 15, color: Colors.white),
              )
            ],
            Flexible(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isMe ? AppTheme.accentIndigo.withValues(alpha: 0.2) : AppTheme.bgCard,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(12),
                    topRight: const Radius.circular(12),
                    bottomLeft: Radius.circular(isMe ? 12 : 4),
                    bottomRight: Radius.circular(isMe ? 4 : 12),
                  ),
                  border: Border.all(
                    color: isMe ? AppTheme.accentIndigo.withValues(alpha: 0.4) : AppTheme.divider,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (msg['image'] != null) ...[
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          constraints: const BoxConstraints(maxHeight: 180),
                          child: Image.file(
                            File(msg['image']),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                    RichText(
                      text: TextSpan(
                        children: _parseMarkdown(msg['text'] ?? ''),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Align(
                      alignment: Alignment.bottomRight,
                      child: Text(
                        msg['timestamp'] ?? '',
                        style: GoogleFonts.inter(fontSize: 9, color: AppTheme.textMuted),
                      ),
                    )
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              margin: const EdgeInsets.only(right: 8),
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [AppTheme.accentIndigo, AppTheme.accentBlue]),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.auto_awesome_rounded, size: 15, color: Colors.white),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppTheme.bgCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.divider),
              ),
              child: Text(
                'Prepcare is typing...',
                style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textMuted),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImagePreview() {
    return Container(
      padding: const EdgeInsets.all(8),
      color: Colors.black26,
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.file(_selectedImage!, height: 60, width: 60, fit: BoxFit.cover),
          ),
          const SizedBox(width: 8),
          const Expanded(
            child: Text('Image attached. It will be scanned on send.', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
          ),
          IconButton(
            icon: const Icon(Icons.cancel_rounded, color: AppTheme.accentRed),
            onPressed: () => setState(() {
              _selectedImage = null;
              _selectedImageBase64 = null;
            }),
          )
        ],
      ),
    );
  }

  Widget _buildInputComposer() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        color: AppTheme.bgCard,
        border: Border(top: BorderSide(color: AppTheme.divider, width: 0.5)),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.image_outlined, color: AppTheme.accentBlue),
            onPressed: _pickImage,
            tooltip: 'Add Image',
          ),
          Expanded(
            child: TextField(
              controller: _textCtrl,
              style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14),
              maxLines: 4,
              minLines: 1,
              decoration: InputDecoration(
                hintText: 'Ask Prepcare a study question...',
                hintStyle: GoogleFonts.inter(color: AppTheme.textMuted, fontSize: 13),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                filled: true,
                fillColor: AppTheme.bgPrimary,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: _sendMessage,
            child: Container(
              width: 40,
              height: 40,
              decoration: const BoxDecoration(
                gradient: LinearGradient(colors: [AppTheme.accentIndigo, AppTheme.accentBlue]),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.send_rounded, size: 18, color: Colors.white),
            ),
          )
        ],
      ),
    );
  }
}
