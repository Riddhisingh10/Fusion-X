import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/app_theme.dart';

class TimetableScreen extends StatelessWidget {
  const TimetableScreen({super.key});

  static const _days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  static const Map<String, List<Map<String, String>>> _schedule = {
    'Monday': [
      {'time': '09:00 - 10:00', 'subject': 'PCB Designing', 'room': 'Lab 4B', 'teacher': 'Dr. Sharma'},
      {'time': '10:15 - 11:15', 'subject': 'Communication Networks', 'room': 'LH-12', 'teacher': 'Prof. Patel'},
      {'time': '11:30 - 12:30', 'subject': 'Electromagnetic Fields', 'room': 'LH-03', 'teacher': 'Dr. Iyer'},
      {'time': '14:00 - 16:00', 'subject': 'Microcontroller Lab', 'room': 'Embedded Lab', 'teacher': 'Prof. Nair'},
    ],
    'Tuesday': [
      {'time': '09:00 - 10:00', 'subject': 'Digital Signal Processing', 'room': 'LH-10', 'teacher': 'Dr. Roy'},
      {'time': '10:15 - 11:15', 'subject': 'PCB Designing', 'room': 'Lab 4B', 'teacher': 'Dr. Sharma'},
      {'time': '11:30 - 12:30', 'subject': 'Electromagnetic Fields', 'room': 'LH-03', 'teacher': 'Dr. Iyer'},
    ],
    'Wednesday': [
      {'time': '09:00 - 10:00', 'subject': 'Communication Networks', 'room': 'LH-12', 'teacher': 'Prof. Patel'},
      {'time': '10:15 - 12:15', 'subject': 'DSP Laboratory', 'room': 'DSP Lab', 'teacher': 'Dr. Roy'},
      {'time': '14:00 - 15:00', 'subject': 'Technical Seminar', 'room': 'Seminar Hall', 'teacher': 'Prof. Nair'},
    ],
    'Thursday': [
      {'time': '09:00 - 10:00', 'subject': 'Digital Signal Processing', 'room': 'LH-10', 'teacher': 'Dr. Roy'},
      {'time': '10:15 - 11:15', 'subject': 'Communication Networks', 'room': 'LH-12', 'teacher': 'Prof. Patel'},
      {'time': '11:30 - 12:30', 'subject': 'Embedded Systems', 'room': 'LH-02', 'teacher': 'Prof. Nair'},
    ],
    'Friday': [
      {'time': '09:00 - 10:00', 'subject': 'Embedded Systems', 'room': 'LH-02', 'teacher': 'Prof. Nair'},
      {'time': '10:15 - 11:15', 'subject': 'Electromagnetic Fields', 'room': 'LH-03', 'teacher': 'Dr. Iyer'},
      {'time': '11:30 - 12:30', 'subject': 'PCB Designing', 'room': 'Lab 4B', 'teacher': 'Dr. Sharma'},
    ]
  };

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: _days.length,
      child: Scaffold(
        backgroundColor: AppTheme.bgPrimary,
        appBar: AppBar(
          title: Text('Timetable', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
          backgroundColor: AppTheme.bgPrimary,
          elevation: 0,
          bottom: TabBar(
            isScrollable: true,
            indicatorColor: AppTheme.accentBlue,
            labelColor: AppTheme.accentBlue,
            unselectedLabelColor: AppTheme.textMuted,
            labelStyle: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 13),
            tabs: _days.map((day) => Tab(text: day)).toList(),
          ),
        ),
        body: TabBarView(
          children: _days.map((day) => _buildDayList(context, day)).toList(),
        ),
      ),
    );
  }

  Widget _buildDayList(BuildContext context, String day) {
    final classes = _schedule[day] ?? [];
    if (classes.isEmpty) {
      return Center(
        child: Text('No classes scheduled.', style: GoogleFonts.inter(color: AppTheme.textMuted)),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: classes.length,
      itemBuilder: (ctx, i) {
        final item = classes[i];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.bgCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppTheme.divider),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Time column
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.schedule_rounded, size: 16, color: AppTheme.accentBlue),
                  const SizedBox(height: 6),
                  Text(
                    item['time']!.split(' ')[0],
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                  ),
                  Text(
                    item['time']!.split(' ').last,
                    style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted),
                  ),
                ],
              ),
              const SizedBox(width: 20),
              // Separator line
              Container(
                width: 1,
                height: 50,
                color: AppTheme.divider,
              ),
              const SizedBox(width: 20),
              // Class details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item['subject']!,
                      style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 12, color: AppTheme.textMuted),
                        const SizedBox(width: 4),
                        Text(
                          item['room']!,
                          style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textMuted),
                        ),
                        const SizedBox(width: 12),
                        const Icon(Icons.person_outline_rounded, size: 12, color: AppTheme.textMuted),
                        const SizedBox(width: 4),
                        Text(
                          item['teacher']!,
                          style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textMuted),
                        ),
                      ],
                    )
                  ],
                ),
              )
            ],
          ),
        );
      },
    );
  }
}
