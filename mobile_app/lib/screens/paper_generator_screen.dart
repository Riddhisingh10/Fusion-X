import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/app_theme.dart';

class PaperGeneratorScreen extends StatefulWidget {
  const PaperGeneratorScreen({super.key});

  @override
  State<PaperGeneratorScreen> createState() => _PaperGeneratorScreenState();
}

class _PaperGeneratorScreenState extends State<PaperGeneratorScreen> {
  String _selectedSubject = 'PCB Designing';
  String _selectedDifficulty = 'Medium';
  double _numQuestions = 5;
  bool _isGenerating = false;
  List<String>? _generatedQuestions;

  static const Map<String, Map<String, List<String>>> _questionBank = {
    'PCB Designing': {
      'Easy': [
        'Define trace width and trace clearance in PCB layouts.',
        'What is a silk screen layer and why is it used?',
        'Explain the purpose of solder mask on a printed circuit board.',
        'What is the difference between single-layer and double-layer PCBs?',
      ],
      'Medium': [
        'Calculate trace width required to carry 3 Amps current for an internal trace with 10C temperature rise (1oz copper).',
        'Explain cross-talk and how to minimize it during high-frequency PCB routing.',
        'What is a ground plane split, and when is it recommended?',
        'Explain blind and buried vias with neat diagrams.',
      ],
      'Hard': [
        'Formulate the design guidelines for differential pair routing to achieve 90-ohm differential impedance.',
        'Explain electromagnetic compatibility (EMC) shielding rules on multi-layer high-speed circuit boards.',
        'Describe the stackup planning process for a 6-layer PCB handling high-speed DDR3 memory signals.',
      ],
    },
    'Communication Networks': {
      'Easy': [
        'Define IP address and MAC address.',
        'What is the function of a router in a computer network?',
        'Explain the difference between TCP and UDP protocols.',
        'List all seven layers of the OSI model.',
      ],
      'Medium': [
        'Explain the TCP 3-way handshake process in detail.',
        'How does CIDR subnetting work? Divide 192.168.1.0/24 into 4 equal subnets.',
        'Describe the working mechanism of Link State routing protocol vs. Distance Vector.',
      ],
      'Hard': [
        'Explain congestion control algorithms in TCP (TCP Reno vs. TCP Vegas) with mathematical flow equations.',
        'Formulate routing table tables and packet header manipulation at an edge router with NAT enabled.',
      ],
    },
    'Electronics': {
      'Easy': [
        'Explain Ohm\'s law with its formula.',
        'What is the difference between active and passive components?',
        'State the working principle of a PN junction diode.',
      ],
      'Medium': [
        'Explain the working of an NPN Bipolar Junction Transistor (BJT) as an amplifier.',
        'Design a non-inverting operational amplifier with a gain of 10.',
        'Explain the difference between half-wave and full-wave bridge rectifiers.',
      ],
      'Hard': [
        'Derive the current gain equation for a MOSFET in saturation region including channel length modulation.',
        'Analyze feedback amplifier topology and solve for closed-loop input impedance and bandwidth.',
      ],
    }
  };

  void _generatePaper() {
    setState(() {
      _isGenerating = true;
    });

    Future.delayed(const Duration(seconds: 1), () {
      final bank = _questionBank[_selectedSubject]?[_selectedDifficulty] ?? [];
      final questions = List<String>.from(bank)..shuffle();
      final limit = _numQuestions.toInt();
      
      setState(() {
        _generatedQuestions = questions.take(limit).toList();
        _isGenerating = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: AppBar(
        title: Text('Paper Generator', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        backgroundColor: AppTheme.bgPrimary,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_generatedQuestions == null) ...[
              Text(
                'Generate Test Paper',
                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedSubject,
                dropdownColor: AppTheme.bgCard,
                decoration: const InputDecoration(labelText: 'Select Subject'),
                items: const [
                  DropdownMenuItem(value: 'PCB Designing', child: Text('PCB Designing')),
                  DropdownMenuItem(value: 'Communication Networks', child: Text('Communication Networks')),
                  DropdownMenuItem(value: 'Electronics', child: Text('Electronics')),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _selectedSubject = val);
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedDifficulty,
                dropdownColor: AppTheme.bgCard,
                decoration: const InputDecoration(labelText: 'Select Difficulty'),
                items: const [
                  DropdownMenuItem(value: 'Easy', child: Text('Easy')),
                  DropdownMenuItem(value: 'Medium', child: Text('Medium')),
                  DropdownMenuItem(value: 'Hard', child: Text('Hard')),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _selectedDifficulty = val);
                },
              ),
              const SizedBox(height: 20),
              Text(
                'Number of Questions: ${_numQuestions.toInt()}',
                style: GoogleFonts.inter(fontSize: 14, color: AppTheme.textSecondary),
              ),
              Slider(
                value: _numQuestions,
                min: 2,
                max: 8,
                divisions: 6,
                activeColor: AppTheme.accentBlue,
                inactiveColor: AppTheme.divider,
                onChanged: (val) {
                  setState(() => _numQuestions = val);
                },
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isGenerating ? null : _generatePaper,
                  child: _isGenerating
                      ? const CircularProgressIndicator(color: AppTheme.bgPrimary)
                      : const Text('Generate Question Paper'),
                ),
              ),
            ] else ...[
              _buildGeneratedPaperView(),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildGeneratedPaperView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Question Paper', style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
            IconButton(
              icon: const Icon(Icons.close, color: AppTheme.textMuted),
              onPressed: () => setState(() => _generatedQuestions = null),
            )
          ],
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.black26),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Align(
                alignment: Alignment.center,
                child: Column(
                  children: [
                    const Text('DEPARTMENT OF ELECTRONICS & COMMUNICATION', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 13), textAlign: TextAlign.center),
                    const SizedBox(height: 4),
                    Text('Exam: $_selectedSubject | Level: $_selectedDifficulty', style: const TextStyle(color: Colors.black54, fontSize: 11, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    const Text('Total Marks: 50 | Time Allowed: 1 Hour', style: TextStyle(color: Colors.black54, fontSize: 11)),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              const Divider(color: Colors.black38),
              const SizedBox(height: 12),
              const Text('Answer all questions. Each question carries equal marks.', style: TextStyle(color: Colors.black87, fontSize: 11, fontStyle: FontStyle.italic)),
              const SizedBox(height: 16),
              ...List.generate(_generatedQuestions!.length, (i) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Q${i + 1}. ', style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 13)),
                      Expanded(
                        child: Text(
                          _generatedQuestions![i],
                          style: const TextStyle(color: Colors.black87, fontSize: 13, height: 1.4),
                        ),
                      ),
                      Text('[${(50 / _generatedQuestions!.length).toInt()}M]', style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Saved as PDF successfully!'), backgroundColor: AppTheme.accentGreen),
                  );
                },
                icon: const Icon(Icons.download_rounded),
                label: const Text('Save PDF'),
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentGreen, foregroundColor: Colors.white),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => setState(() => _generatedQuestions = null),
                icon: const Icon(Icons.refresh),
                label: const Text('Reset'),
              ),
            ),
          ],
        )
      ],
    );
  }
}
