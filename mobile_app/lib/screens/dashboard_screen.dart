import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../services/auth_service.dart';
import 'alumni_match_screen.dart';
import 'timetable_screen.dart';
import 'doubt_solver_screen.dart';
import 'paper_generator_screen.dart';
import 'prepcare_screen.dart';
import 'project_hub_screen.dart';
import 'assignment_hub_screen.dart';
import 'parent_performance_screen.dart';
import 'predictor_screen.dart';
import 'notes_screen.dart';
import 'study_groups_screen.dart';
import 'feedback_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final name = auth.displayName;
    final role = auth.userRole; // 'student', 'teacher', or 'parent'

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Welcome header ──
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          role == 'parent'
                              ? 'Parent Portal'
                              : role == 'teacher'
                                  ? 'Faculty Portal'
                                  : 'Welcome back,',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            color: AppTheme.textMuted,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          name,
                          style: GoogleFonts.outfit(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.bgCard,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 14, color: AppTheme.textMuted),
                        const SizedBox(width: 6),
                        Text(
                          _todayFormatted(),
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // ── Role-Specific Stats ──
              _buildStats(role),
              const SizedBox(height: 28),

              // ── Role-Specific Teaser/Alert Banner ──
              _buildTeaser(context, role),
              const SizedBox(height: 28),

              // ── Role-Specific Performance Overview / Charts ──
              Text(
                role == 'parent'
                    ? 'Child Performance Insights'
                    : role == 'teacher'
                        ? 'Department Stats'
                        : 'Performance Overview',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              _buildCharts(role),
              const SizedBox(height: 28),

              // ── Quick Access Tools Grid ──
              Text(
                'Quick Access Tools',
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              _buildQuickAccessGrid(context, role),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  // ── Stats Generator ──
  Widget _buildStats(String role) {
    List<Widget> cards = [];

    if (role == 'parent') {
      cards = [
        _statCard(
          icon: Icons.assignment_turned_in_rounded,
          iconColor: AppTheme.accentGreen,
          title: 'Overall Attendance',
          value: '85.2%',
          subtitle: 'Required: 85%',
        ),
        _statCard(
          icon: Icons.wallet_rounded,
          iconColor: AppTheme.accentOrange,
          title: 'Pending Fees',
          value: '₹ 12,500',
          subtitle: 'Due: June 15',
        ),
        _statCard(
          icon: Icons.verified_user_rounded,
          iconColor: AppTheme.accentBlue,
          title: 'Campus Entry',
          value: 'Entered',
          subtitle: '08:35 AM Today',
        ),
        _statCard(
          icon: Icons.rate_review_rounded,
          iconColor: AppTheme.accentRed,
          title: 'New Remarks',
          value: '1 Pending',
          subtitle: 'From Prof. Nair',
        ),
      ];
    } else if (role == 'teacher') {
      cards = [
        _statCard(
          icon: Icons.class_rounded,
          iconColor: AppTheme.accentBlue,
          title: 'Lectures Today',
          value: '3 Classes',
          subtitle: 'Next: 2:00 PM',
        ),
        _statCard(
          icon: Icons.question_answer_rounded,
          iconColor: AppTheme.accentOrange,
          title: 'Unsolved Doubts',
          value: '4 Doubts',
          subtitle: 'PCB & Networks',
        ),
        _statCard(
          icon: Icons.analytics_rounded,
          iconColor: AppTheme.accentGreen,
          title: 'Projects Monitored',
          value: '12 Teams',
          subtitle: '3 Need Approval',
        ),
        _statCard(
          icon: Icons.note_add_rounded,
          iconColor: AppTheme.accentRed,
          title: 'Notes Uploaded',
          value: '16 PDFs',
          subtitle: 'This semester',
        ),
      ];
    } else {
      // Default: Student
      cards = [
        _statCard(
          icon: Icons.local_fire_department_rounded,
          iconColor: AppTheme.accentOrange,
          title: 'Study Streak',
          value: '12 Days 🔥',
          subtitle: 'Keep it up!',
        ),
        _statCard(
          icon: Icons.pending_actions_rounded,
          iconColor: AppTheme.accentRed,
          title: 'Tasks Pending',
          value: '5',
          subtitle: 'High Priority',
        ),
        _statCard(
          icon: Icons.schedule_rounded,
          iconColor: AppTheme.accentBlue,
          title: 'Next Event',
          value: 'Math Marathon',
          subtitle: 'Today, 2:00 PM',
        ),
        _statCard(
          icon: Icons.trending_up_rounded,
          iconColor: AppTheme.accentGreen,
          title: 'Current XP',
          value: '4,500',
          subtitle: 'Scholar Rank #2',
        ),
      ];
    }

    return SizedBox(
      height: 100,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: cards,
      ),
    );
  }

  // ── Teasers Generator ──
  Widget _buildTeaser(BuildContext context, String role) {
    String title = '';
    String subtitle = '';
    IconData icon = Icons.track_changes_rounded;
    Color color = AppTheme.accentIndigo;
    Widget destination = const PrepcareScreen();

    if (role == 'parent') {
      title = 'Safety Monitor: Gate Pass Status';
      subtitle = 'Child entered gate at 08:35 AM. Gate Pass #402.';
      icon = Icons.security_rounded;
      color = AppTheme.accentGreen;
      destination = const ParentPerformanceScreen();
    } else if (role == 'teacher') {
      title = 'Smart Paper Generator';
      subtitle = 'Generate dynamic question papers with Bloom taxonomy.';
      icon = Icons.article_rounded;
      color = AppTheme.accentOrange;
      destination = const PaperGeneratorScreen();
    } else {
      title = 'AI Study Goal: Mastering Calculus';
      subtitle = '2 topics left to revise for your upcoming exam.';
      icon = Icons.track_changes_rounded;
      color = AppTheme.accentIndigo;
      destination = const PrepcareScreen();
    }

    return GestureDetector(
      onTap: () {
        Navigator.push(context, MaterialPageRoute(builder: (_) => destination));
      },
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              color.withValues(alpha: 0.12),
              AppTheme.accentBlue.withValues(alpha: 0.08),
            ],
          ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: color.withValues(alpha: 0.2),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppTheme.textMuted),
          ],
        ),
      ),
    );
  }

  // ── Charts Row ──
  Widget _buildCharts(String role) {
    if (role == 'parent') {
      // Child performance semester-wise progress
      return Container(
        padding: const EdgeInsets.all(18),
        height: 220,
        decoration: BoxDecoration(color: AppTheme.bgCard, borderRadius: BorderRadius.circular(16)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Academic GPA Progress', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
            const SizedBox(height: 20),
            Expanded(
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: FlTitlesData(
                    show: true,
                    leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (val, meta) {
                          const sems = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
                          if (val >= 0 && val < sems.length) {
                            return Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text(sems[val.toInt()], style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                            );
                          }
                          return const Text('');
                        },
                      ),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: const [FlSpot(0, 8.2), FlSpot(1, 8.5), FlSpot(2, 8.1), FlSpot(3, 8.8)],
                      isCurved: true,
                      color: AppTheme.accentBlue,
                      barWidth: 4,
                    )
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    } else if (role == 'teacher') {
      // Department Grade Distribution
      return Container(
        padding: const EdgeInsets.all(18),
        height: 220,
        decoration: BoxDecoration(color: AppTheme.bgCard, borderRadius: BorderRadius.circular(16)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Grade Distribution (PCB Design Class)', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.textSecondary)),
            const SizedBox(height: 20),
            Expanded(
              child: BarChart(
                BarChartData(
                  borderData: FlBorderData(show: false),
                  gridData: const FlGridData(show: false),
                  titlesData: FlTitlesData(
                    show: true,
                    leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (val, meta) {
                          const grades = ['O', 'A+', 'A', 'B+', 'B'];
                          if (val >= 0 && val < grades.length) {
                            return Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text(grades[val.toInt()], style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                            );
                          }
                          return const Text('');
                        },
                      ),
                    ),
                  ),
                  barGroups: [
                    BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: 15, color: AppTheme.accentGreen, width: 20)]),
                    BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: 28, color: AppTheme.accentBlue, width: 20)]),
                    BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: 22, color: AppTheme.accentIndigo, width: 20)]),
                    BarChartGroupData(x: 3, barRods: [BarChartRodData(toY: 10, color: AppTheme.accentOrange, width: 20)]),
                    BarChartGroupData(x: 4, barRods: [BarChartRodData(toY: 5, color: AppTheme.accentRed, width: 20)]),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    } else {
      // Default: Student Charts
      return Column(
        children: [
          Row(
            children: [
              Expanded(child: _attendancePie()),
              const SizedBox(width: 12),
              Expanded(child: _tasksPie()),
            ],
          ),
          const SizedBox(height: 16),
          _studyHoursBar(),
        ],
      );
    }
  }

  // ── Quick Access Tools Grid ──
  Widget _buildQuickAccessGrid(BuildContext context, String role) {
    List<Map<String, dynamic>> tools = [];

    if (role == 'parent') {
      tools = [
        {
          'title': 'Safety Monitor',
          'icon': Icons.security_rounded,
          'color': AppTheme.accentGreen,
          'screen': const ParentPerformanceScreen(),
        },
        {
          'title': 'Academic Scores',
          'icon': Icons.auto_graph_rounded,
          'color': AppTheme.accentBlue,
          'screen': const ParentPerformanceScreen(),
        },
        {
          'title': 'Finance Portal',
          'icon': Icons.wallet_rounded,
          'color': AppTheme.accentOrange,
          'screen': const ParentPerformanceScreen(),
        },
        {
          'title': 'Teacher Remarks',
          'icon': Icons.chat_bubble_outline_rounded,
          'color': AppTheme.accentRed,
          'screen': const ParentPerformanceScreen(),
        },
        {
          'title': 'Exam Predictor',
          'icon': Icons.psychology_rounded,
          'color': AppTheme.accentIndigo,
          'screen': const PredictorScreen(),
        },
        {
          'title': 'Complaint Box',
          'icon': Icons.warning_amber_rounded,
          'color': AppTheme.accentRed,
          'screen': const FeedbackScreen(),
        },
      ];
    } else if (role == 'teacher') {
      tools = [
        {
          'title': 'Paper Generator',
          'icon': Icons.article_rounded,
          'color': AppTheme.accentOrange,
          'screen': const PaperGeneratorScreen(),
        },
        {
          'title': 'Doubt Solver Hub',
          'icon': Icons.forum_rounded,
          'color': AppTheme.accentBlue,
          'screen': const DoubtSolverScreen(),
        },
        {
          'title': 'Notes Publisher',
          'icon': Icons.note_add_rounded,
          'color': AppTheme.accentIndigo,
          'screen': const NotesScreen(),
        },
        {
          'title': 'Class Timetable',
          'icon': Icons.calendar_month_rounded,
          'color': AppTheme.accentGreen,
          'screen': const TimetableScreen(),
        },
        {
          'title': 'Project Mentorship',
          'icon': Icons.code_rounded,
          'color': AppTheme.accentBlue,
          'screen': const ProjectHubScreen(),
        },
        {
          'title': 'Feedbacks',
          'icon': Icons.message_rounded,
          'color': AppTheme.accentRed,
          'screen': const FeedbackScreen(),
        },
      ];
    } else {
      // Student
      tools = [
        {
          'title': 'Prepcare AI',
          'icon': Icons.auto_awesome_rounded,
          'color': AppTheme.accentIndigo,
          'screen': const PrepcareScreen(),
        },
        {
          'title': 'Doubt Solver',
          'icon': Icons.quiz_rounded,
          'color': AppTheme.accentRed,
          'screen': const DoubtSolverScreen(),
        },
        {
          'title': 'Notes & PYQs',
          'icon': Icons.book_rounded,
          'color': AppTheme.accentBlue,
          'screen': const NotesScreen(),
        },
        {
          'title': 'Project Hub',
          'icon': Icons.code_rounded,
          'color': AppTheme.accentBlue,
          'screen': const ProjectHubScreen(),
        },
        {
          'title': 'Assignment Hub',
          'icon': Icons.menu_book_rounded,
          'color': AppTheme.accentOrange,
          'screen': const AssignmentHubScreen(),
        },
        {
          'title': 'Timetable',
          'icon': Icons.calendar_month_rounded,
          'color': AppTheme.accentGreen,
          'screen': const TimetableScreen(),
        },
        {
          'title': 'Study Zone',
          'icon': Icons.groups_rounded,
          'color': AppTheme.accentIndigo,
          'screen': const StudyGroupsScreen(),
        },
        {
          'title': 'Alumni Match',
          'icon': Icons.handshake_rounded,
          'color': AppTheme.accentOrange,
          'screen': const AlumniMatchScreen(),
        },
        {
          'title': 'Smart Predictor',
          'icon': Icons.psychology_rounded,
          'color': AppTheme.accentBlue,
          'screen': const PredictorScreen(),
        },
        {
          'title': 'CGPA Calculator',
          'icon': Icons.calculate_rounded,
          'color': AppTheme.accentGreen,
          'screen': null, // displays modal
        },
        {
          'title': 'Paper Generator',
          'icon': Icons.description_rounded,
          'color': AppTheme.accentBlue,
          'screen': const PaperGeneratorScreen(),
        },
        {
          'title': 'Complaint Box',
          'icon': Icons.warning_amber_rounded,
          'color': AppTheme.accentRed,
          'screen': const FeedbackScreen(),
        },
      ];
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.4,
      ),
      itemCount: tools.length,
      itemBuilder: (ctx, i) {
        final t = tools[i];
        return Card(
          margin: EdgeInsets.zero,
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () {
              if (t['screen'] != null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => t['screen'] as Widget),
                );
              } else {
                // Show CGPA Dialog
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    backgroundColor: AppTheme.bgCard,
                    title: Text('CGPA Calculator', style: GoogleFonts.outfit(color: AppTheme.textPrimary)),
                    content: const Text(
                      'Sem 1: 8.20 GPA\nSem 2: 8.50 GPA\nSem 3: 8.10 GPA\nSem 4: 8.80 GPA\n\nEstimated Overall CGPA: 8.40 🎓',
                      style: TextStyle(color: AppTheme.textSecondary, height: 1.5),
                    ),
                    actions: [
                      TextButton(
                        child: const Text('Close'),
                        onPressed: () => Navigator.of(ctx).pop(),
                      )
                    ],
                  ),
                );
              }
            },
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: (t['color'] as Color).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(t['icon'] as IconData, color: t['color'] as Color, size: 20),
                  ),
                  Text(
                    t['title'] as String,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // ── Helpers ──
  String _todayFormatted() {
    final now = DateTime.now();
    const months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${now.day} ${months[now.month]} ${now.year}';
  }

  Widget _statCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String value,
    required String subtitle,
  }) {
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: iconColor),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          Text(value,
              style: GoogleFonts.outfit(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary)),
          Text(subtitle,
              style: GoogleFonts.inter(fontSize: 11, color: AppTheme.textMuted),
              overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }

  Widget _attendancePie() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Text('Attendance',
              style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textSecondary)),
          const SizedBox(height: 10),
          SizedBox(
            height: 120,
            child: PieChart(
              PieChartData(
                sectionsSpace: 3,
                centerSpaceRadius: 28,
                sections: [
                  PieChartSectionData(
                    value: 85,
                    color: AppTheme.accentGreen,
                    radius: 22,
                    title: '85%',
                    titleStyle: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  ),
                  PieChartSectionData(
                    value: 15,
                    color: AppTheme.accentRed,
                    radius: 18,
                    title: '15%',
                    titleStyle: GoogleFonts.inter(
                        fontSize: 10, color: Colors.white),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _tasksPie() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Text('Tasks',
              style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textSecondary)),
          const SizedBox(height: 10),
          SizedBox(
            height: 120,
            child: PieChart(
              PieChartData(
                sectionsSpace: 3,
                centerSpaceRadius: 28,
                sections: [
                  PieChartSectionData(
                    value: 12,
                    color: AppTheme.accentOrange,
                    radius: 22,
                    title: '12',
                    titleStyle: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  ),
                  PieChartSectionData(
                    value: 5,
                    color: AppTheme.textMuted,
                    radius: 18,
                    title: '5',
                    titleStyle: GoogleFonts.inter(
                        fontSize: 10, color: Colors.white),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _studyHoursBar() {
    final data = [3.0, 5.0, 2.0, 4.0, 6.0, 3.0, 1.0];
    final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.bgCard,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text('Study Hours This Week',
                    style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textSecondary)),
              ),
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: AppTheme.accentIndigo,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(width: 6),
              Text('Hours',
                  style: GoogleFonts.inter(
                      fontSize: 11, color: AppTheme.textMuted)),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 180,
            child: BarChart(
              BarChartData(
                barTouchData: BarTouchData(
                  touchTooltipData: BarTouchTooltipData(
                    getTooltipColor: (_) => AppTheme.bgCardHover,
                    getTooltipItem: (group, groupIndex, rod, rodIndex) {
                      return BarTooltipItem(
                        '${rod.toY.toInt()}h',
                        GoogleFonts.inter(
                            fontSize: 12, color: AppTheme.textPrimary),
                      );
                    },
                  ),
                ),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        final idx = value.toInt();
                        if (idx < 0 || idx >= days.length) {
                          return const SizedBox.shrink();
                        }
                        return Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(days[idx],
                              style: GoogleFonts.inter(
                                  fontSize: 11, color: AppTheme.textMuted)),
                        );
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 28,
                      getTitlesWidget: (value, meta) {
                        return Text('${value.toInt()}',
                            style: GoogleFonts.inter(
                                fontSize: 10, color: AppTheme.textMuted));
                      },
                    ),
                  ),
                  topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                ),
                borderData: FlBorderData(show: false),
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  horizontalInterval: 2,
                  getDrawingHorizontalLine: (_) => FlLine(
                    color: AppTheme.divider,
                    strokeWidth: 1,
                  ),
                ),
                barGroups: List.generate(
                  data.length,
                  (i) => BarChartGroupData(
                    x: i,
                    barRods: [
                      BarChartRodData(
                        toY: data[i],
                        color: AppTheme.accentIndigo
                            .withValues(alpha: i % 2 == 0 ? 1.0 : 0.6),
                        width: 24,
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(6),
                          topRight: Radius.circular(6),
                        ),
                      ),
                    ],
                  ),
                ),
                maxY: 8,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
