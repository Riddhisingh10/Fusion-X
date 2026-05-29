import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/app_theme.dart';

class PredictorScreen extends StatefulWidget {
  const PredictorScreen({super.key});

  @override
  State<PredictorScreen> createState() => _PredictorScreenState();
}

class _PredictorScreenState extends State<PredictorScreen> {
  String _selectedSubject = 'PCB Designing';
  final _targetGradeCtrl = TextEditingController(text: 'A+');
  final _attendanceCtrl = TextEditingController(text: '92');
  final _midtermCtrl = TextEditingController(text: '42');

  bool _calculating = false;
  Map<String, double>? _results;

  void _calculatePrediction() {
    setState(() => _calculating = true);
    Future.delayed(const Duration(seconds: 1), () {
      setState(() {
        _calculating = false;
        // Simple mock calculations based on midterm and attendance
        final att = double.tryParse(_attendanceCtrl.text) ?? 85.0;
        final mid = double.tryParse(_midtermCtrl.text) ?? 40.0;

        double gradeAPlus = (att * 0.4 + mid * 1.2).clamp(10, 95);
        double gradeA = (100 - gradeAPlus) * 0.7;
        double gradeB = 100 - gradeAPlus - gradeA;

        _results = {
          'A+ (Outstanding)': gradeAPlus / 100,
          'A (Excellent)': gradeA / 100,
          'B (Good/Pass)': gradeB / 100,
        };
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: Text('Smart Exam Predictor', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: AppTheme.bgPrimary,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppTheme.bgCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.divider, width: 0.5),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'AI Grade Probability Calculator',
                    style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Input details to estimate your final semester exam performance.',
                    style: GoogleFonts.inter(fontSize: 12, color: AppTheme.textMuted),
                  ),
                  const SizedBox(height: 20),
                  DropdownButtonFormField<String>(
                    value: _selectedSubject,
                    dropdownColor: AppTheme.bgCard,
                    decoration: const InputDecoration(labelText: 'Subject'),
                    style: const TextStyle(color: AppTheme.textPrimary),
                    items: ['PCB Designing', 'Communication Networks', 'Electronics Circuit Analysis', 'Maths Foundation']
                        .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedSubject = val);
                    },
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _targetGradeCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Target Grade', hintText: 'A+, A, B, etc.'),
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _attendanceCtrl,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Current Attendance (%)', hintText: 'e.g. 85'),
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _midtermCtrl,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Midterm Marks (out of 50)', hintText: 'e.g. 40'),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _calculating ? null : _calculatePrediction,
                    child: _calculating
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.bgPrimary),
                          )
                        : const Text('Calculate Prediction'),
                  )
                ],
              ),
            ),
            if (_results != null) ...[
              const SizedBox(height: 24),
              Text(
                'Predicted Probability Distribution',
                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(color: AppTheme.bgCard, borderRadius: BorderRadius.circular(16)),
                child: Column(
                  children: _results!.entries.map((e) {
                    final percent = (e.value * 100).toStringAsFixed(1);
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(e.key, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                              Text('$percent%', style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.accentBlue)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          LinearProgressIndicator(
                            value: e.value,
                            backgroundColor: AppTheme.bgPrimary,
                            valueColor: const AlwaysStoppedAnimation(AppTheme.accentBlue),
                          )
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.accentGreen.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.accentGreen.withValues(alpha: 0.2)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.tips_and_updates_rounded, color: AppTheme.accentGreen, size: 22),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'AI Recommendation: Keep up the attendance above 90% and focus on PCB routing trace parameters to secure your A+ grade.',
                        style: GoogleFonts.inter(fontSize: 12, color: AppTheme.accentGreen, height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
