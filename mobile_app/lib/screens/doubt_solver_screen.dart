import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/app_theme.dart';

class DoubtSolverScreen extends StatefulWidget {
  const DoubtSolverScreen({super.key});

  @override
  State<DoubtSolverScreen> createState() => _DoubtSolverScreenState();
}

class _DoubtSolverScreenState extends State<DoubtSolverScreen> {
  final List<Map<String, dynamic>> _doubts = [
    {
      'id': '1',
      'title': 'How to match 50-ohm impedance on microstrip traces?',
      'category': 'PCB Designing',
      'author': 'Aarav Patel',
      'question': 'I am designing a high-speed PCB for a RF transceiver. How do I calculate width for 50-ohm trace on FR4?',
      'replies': [
        {'author': 'Prof. Nair', 'text': 'You should use polar instruments or online calculators like Saturn PCB Toolkit. For standard 1.6mm FR4, with 1oz copper, width is roughly 2.8mm to 3.0mm.'},
        {'author': 'Meera Sen', 'text': 'Also check your ground plane separation! If it is closer, width will decrease.'}
      ],
      'tags': ['RF', 'FR4', 'Altium']
    },
    {
      'id': '2',
      'title': 'Difference between OSI layered model and TCP/IP?',
      'category': 'Networks',
      'author': 'Karan Gupta',
      'question': 'Are session/presentation layers completely merged in TCP/IP application layer?',
      'replies': [
        {'author': 'Rohan Das', 'text': 'Yes, TCP/IP merges Application, Presentation, and Session into a single Application layer.'}
      ],
      'tags': ['OSI', 'TCP-IP', 'Networking']
    }
  ];

  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _replyCtrl = TextEditingController();
  String _selectedCategory = 'PCB Designing';

  void _addDoubt() {
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.bgCard,
          title: Text('Post a Doubt', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: _selectedCategory,
                  dropdownColor: AppTheme.bgCard,
                  decoration: const InputDecoration(labelText: 'Category'),
                  items: const [
                    DropdownMenuItem(value: 'PCB Designing', child: Text('PCB Designing')),
                    DropdownMenuItem(value: 'Electronics', child: Text('Electronics')),
                    DropdownMenuItem(value: 'Networks', child: Text('Networks')),
                  ],
                  onChanged: (val) {
                    if (val != null) {
                      setDialogState(() => _selectedCategory = val);
                    }
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _titleCtrl,
                  decoration: const InputDecoration(labelText: 'Doubt Title', hintText: 'e.g., Impedance Matching'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _descCtrl,
                  decoration: const InputDecoration(labelText: 'Description', hintText: 'Explain your question in detail...'),
                  maxLines: 3,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              child: const Text('Cancel'),
              onPressed: () => Navigator.of(ctx).pop(),
            ),
            ElevatedButton(
              child: const Text('Post'),
              onPressed: () {
                if (_titleCtrl.text.trim().isNotEmpty && _descCtrl.text.trim().isNotEmpty) {
                  setState(() {
                    _doubts.insert(0, {
                      'id': 'doubt-${DateTime.now().millisecondsSinceEpoch}',
                      'title': _titleCtrl.text.trim(),
                      'category': _selectedCategory,
                      'author': 'You',
                      'question': _descCtrl.text.trim(),
                      'replies': [],
                      'tags': ['General']
                    });
                  });
                  _titleCtrl.clear();
                  _descCtrl.clear();
                  Navigator.of(ctx).pop();
                }
              },
            )
          ],
        ),
      ),
    );
  }

  void _showDoubtDetails(Map<String, dynamic> doubt) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.bgPrimary,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(16, 20, 16, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.accentBlue.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  doubt['category'],
                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.accentBlue),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                doubt['title'],
                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 4),
              Text('Asked by ${doubt['author']}', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textMuted)),
              const SizedBox(height: 12),
              Text(
                doubt['question'],
                style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary, height: 1.4),
              ),
              const Divider(height: 24, color: AppTheme.divider),
              Text(
                'Replies (${(doubt['replies'] as List).length})',
                style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 8),
              if ((doubt['replies'] as List).isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Text('No answers yet. Share your knowledge!', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textMuted)),
                )
              else
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: (doubt['replies'] as List).length,
                    itemBuilder: (ctx, i) {
                      final r = doubt['replies'][i];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.bgCard,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(r['author'], style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.accentIndigo)),
                            const SizedBox(height: 4),
                            Text(r['text'], style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary)),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _replyCtrl,
                      decoration: const InputDecoration(hintText: 'Add an answer...', contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.send_rounded, color: AppTheme.accentBlue),
                    onPressed: () {
                      if (_replyCtrl.text.trim().isNotEmpty) {
                        setState(() {
                          (doubt['replies'] as List).add({
                            'author': 'You',
                            'text': _replyCtrl.text.trim(),
                          });
                        });
                        setModalState(() {});
                        _replyCtrl.clear();
                      }
                    },
                  )
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: Text('Doubt Solving Hub', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: AppTheme.bgPrimary,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_comment_rounded, color: AppTheme.accentBlue),
            onPressed: _addDoubt,
            tooltip: 'Post Doubt',
          )
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _doubts.length,
        itemBuilder: (ctx, i) {
          final d = _doubts[i];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () => _showDoubtDetails(d),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.accentIndigo.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            d['category'],
                            style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.accentIndigo),
                          ),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.comment_outlined, size: 14, color: AppTheme.textMuted),
                            const SizedBox(width: 4),
                            Text('${(d['replies'] as List).length}', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textMuted)),
                          ],
                        )
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      d['title'],
                      style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      d['question'],
                      style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textMuted),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Text('By ${d['author']}', style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted)),
                        const Spacer(),
                        Wrap(
                          spacing: 4,
                          children: (d['tags'] as List<String>).map((t) => Text('#$t', style: GoogleFonts.inter(fontSize: 11, color: AppTheme.accentBlue))).toList(),
                        )
                      ],
                    )
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
