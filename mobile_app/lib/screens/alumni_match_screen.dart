import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/app_theme.dart';

class AlumniMatchScreen extends StatefulWidget {
  const AlumniMatchScreen({super.key});

  @override
  State<AlumniMatchScreen> createState() => _AlumniMatchScreenState();
}

class _AlumniMatchScreenState extends State<AlumniMatchScreen> {
  final List<Map<String, dynamic>> _mentors = [
    {
      'id': 1,
      'name': 'Arjun Mehta',
      'role': 'SDE-2 @ Amazon',
      'batch': 'Batch of 2018',
      'expertise': ['System Design', 'Backend Engineering', 'AWS'],
      'image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200', // fallback or placeholder
      'available': 'Next Friday, 4 PM',
      'bio': 'Ex-Flipkart, Ex-Directi. Happy to discuss building scalable distributed systems and backend architecture.'
    },
    {
      'id': 2,
      'name': 'Sara Khan',
      'role': 'PM @ Google',
      'batch': 'Batch of 2020',
      'expertise': ['Product Management', 'Strategy', 'UI/UX'],
      'image': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
      'available': 'Tomorrow, 6 PM',
      'bio': 'Currently scaling Google Cloud products. Let’s talk about how to pivot from SDE to PM and product strategy.'
    },
    {
      'id': 3,
      'name': 'Rohit Sharma',
      'role': 'Data Scientist @ Tesla',
      'batch': 'Batch of 2019',
      'expertise': ['Machine Learning', 'Big Data', 'Python'],
      'image': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200',
      'available': 'Monday, 10 AM',
      'bio': 'Building autonomous driving models. Ask me about ML modeling and data engineering pipelines at scale.'
    }
  ];

  int _currentIndex = 0;
  final List<Map<String, dynamic>> _matches = [];

  void _handleAction(bool isMatch) {
    if (isMatch) {
      setState(() {
        _matches.add(_mentors[_currentIndex]);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Matched with ${_mentors[_currentIndex]['name']}!'),
          backgroundColor: AppTheme.accentGreen,
          duration: const Duration(seconds: 1),
        ),
      );
    }
    setState(() {
      _currentIndex++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: Text('Alumni Match', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: AppTheme.bgPrimary,
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: _currentIndex >= _mentors.length ? _buildCompletedView() : _buildMentorCard(),
        ),
      ),
    );
  }

  Widget _buildMentorCard() {
    final mentor = _mentors[_currentIndex];
    return Column(
      children: [
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              color: AppTheme.bgCard,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.divider),
            ),
            clipBehavior: Clip.hardEdge,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Image
                Expanded(
                  flex: 3,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Image.network(
                        mentor['image'],
                        fit: BoxFit.cover,
                        errorBuilder: (ctx, err, stack) => Container(
                          color: AppTheme.bgCardHover,
                          child: const Icon(Icons.person_rounded, size: 80, color: AppTheme.textMuted),
                        ),
                      ),
                      Positioned(
                        bottom: 12,
                        left: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.accentIndigo,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            mentor['batch'],
                            style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                      )
                    ],
                  ),
                ),
                // Content
                Expanded(
                  flex: 4,
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          mentor['name'],
                          style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.work_outline_rounded, size: 14, color: AppTheme.accentBlue),
                            const SizedBox(width: 6),
                            Text(
                              mentor['role'],
                              style: GoogleFonts.inter(fontSize: 13, color: AppTheme.accentBlue, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          mentor['bio'],
                          style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary, height: 1.4),
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 14),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: (mentor['expertise'] as List<String>).map((skill) {
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.black26,
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: AppTheme.divider),
                              ),
                              child: Text(
                                skill,
                                style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted),
                              ),
                            );
                          }).toList(),
                        ),
                        const Spacer(),
                        Row(
                          children: [
                            const Icon(Icons.calendar_month_rounded, size: 14, color: AppTheme.textMuted),
                            const SizedBox(width: 6),
                            Text(
                              'Available: ${mentor['available']}',
                              style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textMuted),
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            GestureDetector(
              onTap: () => _handleAction(false),
              child: Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppTheme.bgCard,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.accentRed, width: 2),
                ),
                child: const Icon(Icons.close_rounded, color: AppTheme.accentRed, size: 28),
              ),
            ),
            const SizedBox(width: 40),
            GestureDetector(
              onTap: () => _handleAction(true),
              child: Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppTheme.bgCard,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.accentGreen, width: 2),
                ),
                child: const Icon(Icons.favorite_rounded, color: AppTheme.accentGreen, size: 28),
              ),
            ),
          ],
        )
      ],
    );
  }

  Widget _buildCompletedView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppTheme.bgCard,
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.accentBlue, width: 1.5),
            ),
            child: const Icon(Icons.handshake_rounded, size: 48, color: AppTheme.accentBlue),
          ),
          const SizedBox(height: 24),
          Text(
            'All Mentors Swiped!',
            style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
          ),
          const SizedBox(height: 8),
          Text(
            'Keep checking back for new alumni matches.',
            style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textMuted),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          if (_matches.isNotEmpty) ...[
            Text(
              'Your Matches (${_matches.length})',
              style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 120,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _matches.length,
                itemBuilder: (ctx, i) {
                  final m = _matches[i];
                  return Container(
                    width: 140,
                    margin: const EdgeInsets.only(right: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.bgCard,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.divider),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(m['name'], style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 4),
                        Text(m['role'], style: GoogleFonts.inter(fontSize: 10, color: AppTheme.accentBlue), maxLines: 1, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 8),
                        ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            minimumSize: Size.zero,
                          ),
                          child: const Text('Schedule', style: TextStyle(fontSize: 10)),
                        )
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
          const SizedBox(height: 24),
          OutlinedButton(
            onPressed: () => setState(() {
              _currentIndex = 0;
              _matches.clear();
            }),
            child: const Text('Reset Stack'),
          )
        ],
      ),
    );
  }
}
