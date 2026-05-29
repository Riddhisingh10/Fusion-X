import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';
import '../config/app_theme.dart';

class ParentPerformanceScreen extends StatelessWidget {
  const ParentPerformanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 4,
      child: Scaffold(
        backgroundColor: AppTheme.bgPrimary,
        appBar: AppBar(
          title: Text('Parent Dashboard', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
          backgroundColor: AppTheme.bgPrimary,
          elevation: 0,
          bottom: TabBar(
            isScrollable: true,
            indicatorColor: AppTheme.accentBlue,
            labelColor: AppTheme.accentBlue,
            unselectedLabelColor: AppTheme.textMuted,
            tabs: const [
              Tab(text: 'Performance'),
              Tab(text: 'Attendance'),
              Tab(text: 'Finance'),
              Tab(text: 'Safety & Diary'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _PerformanceTab(),
            _AttendanceTab(),
            _FinanceTab(),
            _SafetyDiaryTab(),
          ],
        ),
      ),
    );
  }
}

class _PerformanceTab extends StatelessWidget {
  const _PerformanceTab();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Child Grade Progress (GPA)',
            style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
          ),
          const SizedBox(height: 16),
          Container(
            height: 200,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppTheme.bgCard, borderRadius: BorderRadius.circular(16)),
            child: LineChart(
              LineChartData(
                gridData: const FlGridData(show: false),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        const semesters = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
                        if (value >= 0 && value < semesters.length) {
                          return Text(semesters[value.toInt()], style: const TextStyle(color: AppTheme.textMuted, fontSize: 10));
                        }
                        return const Text('');
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: const [
                      FlSpot(0, 8.2),
                      FlSpot(1, 8.5),
                      FlSpot(2, 8.1),
                      FlSpot(3, 8.8),
                    ],
                    isCurved: true,
                    color: AppTheme.accentBlue,
                    barWidth: 4,
                    dotData: const FlDotData(show: true),
                  )
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Subject Scores (Internal Test 1)',
            style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
          ),
          const SizedBox(height: 10),
          _subjectScore('PCB Designing', '42 / 50', 'Class Average: 38/50', AppTheme.accentGreen),
          _subjectScore('Communication Networks', '48 / 50', 'Class Average: 40/50', AppTheme.accentBlue),
          _subjectScore('Electronics Circuit Analysis', '35 / 50', 'Class Average: 33/50', AppTheme.accentOrange),
          _subjectScore('Maths Foundation', '45 / 50', 'Class Average: 37/50', AppTheme.accentIndigo),
        ],
      ),
    );
  }

  Widget _subjectScore(String subject, String score, String average, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppTheme.bgCard, borderRadius: BorderRadius.circular(12)),
      child: Row(
        children: [
          Container(width: 4, height: 36, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(subject, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                Text(average, style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted)),
              ],
            ),
          ),
          Text(score, style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
        ],
      ),
    );
  }
}

class _AttendanceTab extends StatelessWidget {
  const _AttendanceTab();

  @override
  Widget build(BuildContext context) {
    final attendance = [
      {'subject': 'PCB Designing', 'val': 92.0, 'attended': 23, 'total': 25},
      {'subject': 'Communication Networks', 'val': 88.0, 'attended': 22, 'total': 25},
      {'subject': 'Electronics Circuit Analysis', 'val': 80.0, 'attended': 20, 'total': 25},
      {'subject': 'Labs & Workshops', 'val': 80.0, 'attended': 8, 'total': 10},
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: attendance.length,
      itemBuilder: (ctx, i) {
        final item = attendance[i];
        final percent = item['val'] as double;
        final attended = item['attended'] as int;
        final total = item['total'] as int;

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: AppTheme.bgCard, borderRadius: BorderRadius.circular(14)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(item['subject'] as String, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                  Text('$percent%', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: percent >= 85 ? AppTheme.accentGreen : AppTheme.accentOrange)),
                ],
              ),
              const SizedBox(height: 8),
              LinearProgressIndicator(
                value: percent / 100,
                backgroundColor: AppTheme.bgPrimary,
                valueColor: AlwaysStoppedAnimation(percent >= 85 ? AppTheme.accentGreen : AppTheme.accentOrange),
              ),
              const SizedBox(height: 8),
              Text('Attended $attended out of $total classes', style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textMuted)),
            ],
          ),
        );
      },
    );
  }
}

class _FinanceTab extends StatelessWidget {
  const _FinanceTab();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [AppTheme.accentIndigo, AppTheme.accentBlue]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('DUE FEE BALANCE', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                Text('₹ 12,500', style: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white)),
                const SizedBox(height: 12),
                const Text('Due Date: June 15, 2026', style: TextStyle(color: Colors.white70, fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text('Payment Transactions', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
          const SizedBox(height: 12),
          _transactionCard('Odd Sem Exam Fees', '₹ 4,200', 'Paid on May 10, 2026', true),
          _transactionCard('Sem 4 Tuition Fees', '₹ 85,000', 'Paid on Jan 14, 2026', true),
          _transactionCard('Bus Transportation Pass', '₹ 12,500', 'Pending', false),
        ],
      ),
    );
  }

  Widget _transactionCard(String title, String amount, String date, bool paid) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppTheme.bgCard, borderRadius: BorderRadius.circular(12)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
              const SizedBox(height: 2),
              Text(date, style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted)),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(amount, style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: paid ? AppTheme.accentGreen.withValues(alpha: 0.15) : AppTheme.accentRed.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  paid ? 'PAID' : 'DUE',
                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: paid ? AppTheme.accentGreen : AppTheme.accentRed),
                ),
              )
            ],
          ),
        ],
      ),
    );
  }
}

class _SafetyDiaryTab extends StatelessWidget {
  const _SafetyDiaryTab();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Safety Monitor', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppTheme.bgCard, borderRadius: BorderRadius.circular(14)),
            child: Column(
              children: [
                _safetyRow('Gate Check-in', 'May 24, 08:35 AM', 'Entered Campus', AppTheme.accentGreen),
                const Divider(color: AppTheme.divider, height: 20),
                _safetyRow('Gate Check-out', 'May 24, 04:30 PM', 'Left Campus', AppTheme.accentOrange),
                const Divider(color: AppTheme.divider, height: 20),
                _safetyRow('Last GPS Ping', 'May 24, 04:55 PM', 'Nearing Home Route', AppTheme.accentBlue),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text('Teacher\'s Diary Remarks', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
          const SizedBox(height: 12),
          _diaryRemark('Dr. Bhavana S. (PCB Designing)', 'Excellent work in the practical layout design. Showed great analytical skills.', 'May 20, 2026'),
          _diaryRemark('Prof. Raghavendra (Networks)', 'Missed submissions for assignment #2. Needs to submit by tomorrow to avoid penalty.', 'May 23, 2026'),
        ],
      ),
    );
  }

  Widget _safetyRow(String label, String time, String status, Color color) {
    return Row(
      children: [
        Icon(Icons.shield_outlined, color: color, size: 20),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
              Text(time, style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted)),
            ],
          ),
        ),
        Text(status, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }

  Widget _diaryRemark(String teacher, String content, String date) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppTheme.bgCard, borderRadius: BorderRadius.circular(14)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(child: Text(teacher, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.accentBlue))),
              Text(date, style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted)),
            ],
          ),
          const SizedBox(height: 8),
          Text(content, style: GoogleFonts.inter(fontSize: 13, color: AppTheme.textSecondary, height: 1.4)),
        ],
      ),
    );
  }
}
