import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/app_theme.dart';

class ProjectHubScreen extends StatefulWidget {
  const ProjectHubScreen({super.key});

  @override
  State<ProjectHubScreen> createState() => _ProjectHubScreenState();
}

class _ProjectHubScreenState extends State<ProjectHubScreen> {
  final List<Map<String, dynamic>> _projects = [
    {
      'id': '1',
      'title': 'AI Automated Proctoring System',
      'description': 'Real-time eye-tracking and voice analysis system using OpenCV and Python.',
      'members': ['4VV25EC001 (You)', '4VV25EC002', '4VV25EC003'],
      'github': 'https://github.com/bharathk/ai-proctoring',
      'mentor': 'Dr. Bhavana S. (Professor)',
      'status': 'Under Review',
      'remarks': 'Include the system latency metrics in the next review phase.'
    },
    {
      'id': '2',
      'title': 'Smart Campus Navigation App',
      'description': 'Flutter-based navigation map helper for campus corridors and rooms.',
      'members': ['4VV25EC001 (You)', '4VV25EC004'],
      'github': 'https://github.com/bharathk/campus-nav',
      'mentor': 'Prof. Raghavendra (Asst. Prof)',
      'status': 'Approved',
      'remarks': 'Excellent UI design. Ready for deployment testing.'
    }
  ];

  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _gitCtrl = TextEditingController();
  final _usnCtrl = TextEditingController();
  final List<String> _newMembers = [];

  void _createNewProject() {
    _newMembers.clear();
    _titleCtrl.clear();
    _descCtrl.clear();
    _gitCtrl.clear();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.bgCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Create Project Team',
                  style: GoogleFonts.outfit(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _titleCtrl,
                  style: const TextStyle(color: AppTheme.textPrimary),
                  decoration: const InputDecoration(
                    labelText: 'Project Title',
                    hintText: 'e.g. IoT Smart Irrigation',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _descCtrl,
                  style: const TextStyle(color: AppTheme.textPrimary),
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    hintText: 'Brief system architecture & objective...',
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _gitCtrl,
                  style: const TextStyle(color: AppTheme.textPrimary),
                  decoration: const InputDecoration(
                    labelText: 'GitHub Repository Link',
                    hintText: 'https://github.com/username/repo',
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Add Team Members (USN)',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _usnCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(
                          hintText: '4VV25EC002',
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      onPressed: () {
                        if (_usnCtrl.text.trim().isNotEmpty) {
                          setModalState(() {
                            _newMembers.add(_usnCtrl.text.trim().toUpperCase());
                            _usnCtrl.clear();
                          });
                        }
                      },
                      child: const Icon(Icons.add, size: 20),
                    ),
                  ],
                ),
                if (_newMembers.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 6,
                    children: _newMembers
                        .map((usn) => Chip(
                              backgroundColor: AppTheme.bgPrimary,
                              label: Text(usn, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 12)),
                              onDeleted: () {
                                setModalState(() {
                                  _newMembers.remove(usn);
                                });
                              },
                            ))
                        .toList(),
                  ),
                ],
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    if (_titleCtrl.text.isNotEmpty && _descCtrl.text.isNotEmpty) {
                      setState(() {
                        _projects.insert(0, {
                          'id': DateTime.now().millisecondsSinceEpoch.toString(),
                          'title': _titleCtrl.text.trim(),
                          'description': _descCtrl.text.trim(),
                          'members': ['4VV25EC001 (You)', ..._newMembers],
                          'github': _gitCtrl.text.trim(),
                          'mentor': 'Assigned Automatically',
                          'status': 'Initiated',
                          'remarks': 'Awaiting mentor assignment.'
                        });
                      });
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Project team registered successfully!'),
                          backgroundColor: AppTheme.accentGreen,
                        ),
                      );
                    }
                  },
                  child: const Text('Initialize Team & Hub'),
                ),
              ],
            ),
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
        title: Text('Project Hub', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: AppTheme.bgPrimary,
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _createNewProject,
        backgroundColor: AppTheme.accentBlue,
        child: const Icon(Icons.add, color: AppTheme.bgPrimary),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _projects.length,
        itemBuilder: (context, index) {
          final proj = _projects[index];
          final isApproved = proj['status'] == 'Approved';

          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppTheme.bgCard,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.divider, width: 0.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: isApproved
                            ? AppTheme.accentGreen.withValues(alpha: 0.15)
                            : AppTheme.accentOrange.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        proj['status'] as String,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isApproved ? AppTheme.accentGreen : AppTheme.accentOrange,
                        ),
                      ),
                    ),
                    const Icon(Icons.code_rounded, color: AppTheme.textMuted, size: 20),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  proj['title'] as String,
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  proj['description'] as String,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: AppTheme.textMuted,
                  ),
                ),
                const SizedBox(height: 14),
                const Divider(color: AppTheme.divider),
                const SizedBox(height: 10),
                Text(
                  'Team Members:',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textSecondary),
                ),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 6,
                  children: (proj['members'] as List<String>)
                      .map((m) => Container(
                            margin: const EdgeInsets.only(top: 4),
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.bgPrimary,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(m, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                          ))
                      .toList(),
                ),
                if (proj['github'].toString().isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.link, size: 16, color: AppTheme.accentBlue),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          proj['github'] as String,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.inter(fontSize: 12, color: AppTheme.accentBlue),
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Icon(Icons.person_pin_rounded, size: 16, color: AppTheme.accentIndigo),
                    const SizedBox(width: 6),
                    Text(
                      'Mentor: ${proj['mentor']}',
                      style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary),
                    ),
                  ],
                ),
                if (proj['remarks'].toString().isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.bgPrimary,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Mentor Remarks:',
                          style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          proj['remarks'] as String,
                          style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textSecondary, fontStyle: FontStyle.italic),
                        ),
                      ],
                    ),
                  )
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}
