import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/app_theme.dart';
import '../services/database_service.dart';
import '../services/crypto_service.dart';

class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key});

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final _db = DatabaseService();
  final _contentCtrl = TextEditingController();
  String _selectedCategory = 'academic';
  bool _isSending = false;
  bool _sent = false;

  final _categories = [
    {'value': 'academic', 'label': 'Academic', 'icon': Icons.school_rounded},
    {'value': 'hostel', 'label': 'Hostel', 'icon': Icons.apartment_rounded},
    {'value': 'administration', 'label': 'Administration', 'icon': Icons.business_rounded},
  ];

  Future<void> _submit() async {
    final text = _contentCtrl.text.trim();
    if (text.isEmpty) return;

    // XSS check – strip HTML tags client side as well
    if (RegExp(r'<[^>]*>').hasMatch(text)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('HTML tags are not allowed.'),
          backgroundColor: AppTheme.accentRed,
        ),
      );
      return;
    }

    setState(() => _isSending = true);

    try {
      // Generate daily HMAC hash for rate limiting (matches backend logic)
      final hash = CryptoService.generateDailyHash(
        'mobile-user', // In production, use the actual user ID
        'connect-prep-daily-salt',
      );

      await _db.submitAnonymousFeedback(
        collegeId: 'college.edu',
        category: _selectedCategory,
        content: text,
        dailyHash: hash,
      );

      setState(() {
        _sent = true;
        _isSending = false;
      });
      _contentCtrl.clear();

      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) setState(() => _sent = false);
      });
    } catch (e) {
      setState(() => _isSending = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: AppTheme.accentRed,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _contentCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: Text('Anonymous Feedback',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: AppTheme.bgPrimary,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Privacy Notice ──
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.accentGreen.withValues(alpha: 0.08),
                    AppTheme.accentBlue.withValues(alpha: 0.06),
                  ],
                ),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                    color: AppTheme.accentGreen.withValues(alpha: 0.15)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.shield_outlined,
                      size: 22, color: AppTheme.accentGreen),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Your identity is cryptographically decoupled. No user ID is stored with your feedback.',
                      style: GoogleFonts.inter(
                          fontSize: 12, color: AppTheme.textSecondary),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Category Selector ──
            Text('Category',
                style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textSecondary)),
            const SizedBox(height: 10),
            Row(
              children: _categories.map((cat) {
                final selected = cat['value'] == _selectedCategory;
                return Expanded(
                  child: GestureDetector(
                    onTap: () =>
                        setState(() => _selectedCategory = cat['value'] as String),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      decoration: BoxDecoration(
                        color: selected
                            ? AppTheme.accentBlue.withValues(alpha: 0.12)
                            : AppTheme.bgCard,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: selected
                              ? AppTheme.accentBlue
                              : Colors.transparent,
                          width: 1.5,
                        ),
                      ),
                      child: Column(
                        children: [
                          Icon(cat['icon'] as IconData,
                              size: 20,
                              color: selected
                                  ? AppTheme.accentBlue
                                  : AppTheme.textMuted),
                          const SizedBox(height: 6),
                          Text(
                            cat['label'] as String,
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight:
                                  selected ? FontWeight.w600 : FontWeight.normal,
                              color: selected
                                  ? AppTheme.accentBlue
                                  : AppTheme.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            // ── Content ──
            Text('Your Feedback',
                style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textSecondary)),
            const SizedBox(height: 8),
            TextField(
              controller: _contentCtrl,
              maxLines: 6,
              maxLength: 500,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: InputDecoration(
                hintText:
                    'Describe the issue or share your thoughts...',
                hintStyle: const TextStyle(color: AppTheme.textMuted),
                counterStyle: GoogleFonts.inter(
                    fontSize: 11, color: AppTheme.textMuted),
              ),
            ),
            const SizedBox(height: 20),

            // ── Submit ──
            if (_sent)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.accentGreen.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.check_circle_outline,
                        color: AppTheme.accentGreen, size: 20),
                    const SizedBox(width: 8),
                    Text('Feedback submitted anonymously.',
                        style: GoogleFonts.inter(
                            fontSize: 14, color: AppTheme.accentGreen)),
                  ],
                ),
              )
            else
              ElevatedButton.icon(
                onPressed: _isSending ? null : _submit,
                icon: _isSending
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: AppTheme.bgPrimary),
                      )
                    : const Icon(Icons.send_rounded),
                label: Text(_isSending ? 'Submitting...' : 'Submit Feedback'),
              ),
          ],
        ),
      ),
    );
  }
}
