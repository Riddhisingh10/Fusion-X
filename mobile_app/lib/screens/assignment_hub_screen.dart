import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/app_theme.dart';

class AssignmentHubScreen extends StatefulWidget {
  const AssignmentHubScreen({super.key});

  @override
  State<AssignmentHubScreen> createState() => _AssignmentHubScreenState();
}

class _AssignmentHubScreenState extends State<AssignmentHubScreen> {
  final List<Map<String, dynamic>> _assignments = [
    {
      'id': '1',
      'subject': 'PCB Designing',
      'title': 'Eagle CAD Layout for Power Supply',
      'deadline': 'Tomorrow, 11:59 PM',
      'status': 'Pending',
      'grade': '-',
    },
    {
      'id': '2',
      'subject': 'Communication Networks',
      'title': 'TCP/IP Handshake Simulation Script',
      'deadline': 'May 28, 2026',
      'status': 'Submitted',
      'grade': 'A+',
    },
    {
      'id': '3',
      'subject': 'Electronics Circuit Analysis',
      'title': 'Operational Amplifier Feedback Report',
      'deadline': 'May 30, 2026',
      'status': 'Pending',
      'grade': '-',
    },
    {
      'id': '4',
      'subject': 'Microcontrollers lab',
      'title': 'Keil Compiler Assembly Code for LED Blinking',
      'deadline': 'Passed',
      'status': 'Graded',
      'grade': 'O (Outstanding)',
    }
  ];

  void _submitAssignment(String id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.bgCard,
        title: Text('Submit Assignment', style: GoogleFonts.outfit(color: AppTheme.textPrimary)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Attach file/mock pdf link to complete submission.', style: GoogleFonts.inter(color: AppTheme.textSecondary)),
            const SizedBox(height: 16),
            const TextField(
              style: TextStyle(color: AppTheme.textPrimary),
              decoration: InputDecoration(
                hintText: 'Add submission remarks or links...',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            child: const Text('Cancel', style: TextStyle(color: AppTheme.textMuted)),
            onPressed: () => Navigator.pop(ctx),
          ),
          ElevatedButton(
            child: const Text('Submit Now'),
            onPressed: () {
              setState(() {
                final idx = _assignments.indexWhere((a) => a['id'] == id);
                if (idx != -1) {
                  _assignments[idx]['status'] = 'Submitted';
                }
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Assignment submitted successfully!'),
                  backgroundColor: AppTheme.accentGreen,
                ),
              );
            },
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: Text('Assignment Hub', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: AppTheme.bgPrimary,
        elevation: 0,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _assignments.length,
        itemBuilder: (context, index) {
          final ass = _assignments[index];
          final isPending = ass['status'] == 'Pending';
          final isSubmitted = ass['status'] == 'Submitted';

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.bgCard,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        ass['subject'] as String,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.accentBlue,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        ass['title'] as String,
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Icon(Icons.schedule, size: 12, color: isPending ? AppTheme.accentRed : AppTheme.textMuted),
                          const SizedBox(width: 4),
                          Text(
                            'Due: ${ass['deadline']}',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: isPending ? AppTheme.accentRed : AppTheme.textMuted,
                            ),
                          ),
                        ],
                      ),
                      if (!isPending) ...[
                        const SizedBox(height: 4),
                        Text(
                          'Grade: ${ass['grade']}',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.accentGreen,
                          ),
                        ),
                      ]
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isPending
                            ? AppTheme.accentRed.withValues(alpha: 0.15)
                            : isSubmitted
                                ? AppTheme.accentBlue.withValues(alpha: 0.15)
                                : AppTheme.accentGreen.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        ass['status'] as String,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isPending
                              ? AppTheme.accentRed
                              : isSubmitted
                                  ? AppTheme.accentBlue
                                  : AppTheme.accentGreen,
                        ),
                      ),
                    ),
                    if (isPending) ...[
                      const SizedBox(height: 8),
                      TextButton(
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: const Size(60, 30),
                        ),
                        onPressed: () => _submitAssignment(ass['id']),
                        child: Text(
                          'Submit',
                          style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.accentBlue),
                        ),
                      ),
                    ]
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
