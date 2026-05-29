import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Wraps Supabase Auth for the entire app.
/// Listens to real auth state changes and exposes user/session data.
class AuthService extends ChangeNotifier {
  final SupabaseClient _client = Supabase.instance.client;

  User? _user;
  Session? _session;
  bool _isLoading = true;

  User? get user => _user;
  Session? get session => _session;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String get userEmail => _user?.email ?? '';
  String get userId => _user?.id ?? '';
  String get displayName =>
      _user?.userMetadata?['full_name'] as String? ?? userEmail.split('@').first;

  String get userRole {
    final meta = _user?.userMetadata;
    if (meta != null && meta['role'] != null) {
      return meta['role'] as String;
    }
    final email = userEmail.toLowerCase();
    if (email.contains('teacher')) return 'teacher';
    if (email.contains('parent')) return 'parent';
    return 'student';
  }

  AuthService() {
    // Bootstrap with current session
    _user = _client.auth.currentUser;
    _session = _client.auth.currentSession;
    _isLoading = false;

    // Listen for future auth changes (sign in, sign out, token refresh)
    _client.auth.onAuthStateChange.listen((data) {
      _session = data.session;
      _user = data.session?.user;
      _isLoading = false;
      notifyListeners();
    });
  }

  /// Sign in with email + password.
  /// Returns null on success, or an error message string.
  Future<String?> signInWithPassword(String email, String password) async {
    try {
      _isLoading = true;
      notifyListeners();

      String targetEmail = email.trim().toLowerCase();
      String targetPassword = password;

      // Intercept short mock credentials and map to full Supabase accounts
      bool isMockLogin = false;
      String mockRole = 'student';
      String mockName = 'Demo Student';

      if (targetEmail == '1' && targetPassword == '1') {
        targetEmail = 'student@college.edu';
        targetPassword = 'Password123!';
        isMockLogin = true;
        mockRole = 'student';
        mockName = 'Demo Student';
      } else if (targetEmail == '2' && targetPassword == '2') {
        targetEmail = 'teacher@college.edu';
        targetPassword = 'Password123!';
        isMockLogin = true;
        mockRole = 'teacher';
        mockName = 'Demo Teacher';
      } else if (targetEmail == '3' && targetPassword == '3') {
        targetEmail = 'parent@college.edu';
        targetPassword = 'Password123!';
        isMockLogin = true;
        mockRole = 'parent';
        mockName = 'Demo Parent';
      }

      AuthResponse? response;
      try {
        response = await _client.auth.signInWithPassword(
          email: targetEmail,
          password: targetPassword,
        );
      } on AuthException catch (signInError) {
        final errMsg = signInError.message.toLowerCase();
        // If account is not found/not created yet, automatically sign up and then sign in (matches web behavior)
        if (errMsg.contains('invalid login credentials') || errMsg.contains('user not found') || errMsg.contains('invalid grant')) {
          try {
            // Step 1: Sign up the user
            await _client.auth.signUp(
              email: targetEmail,
              password: targetPassword,
              data: {
                'full_name': targetEmail.split('@').first,
                'role': mockRole,
              },
            );

            // Step 2: Sign in immediately to fetch the valid session
            response = await _client.auth.signInWithPassword(
              email: targetEmail,
              password: targetPassword,
            );
          } catch (signUpErr) {
            if (isMockLogin) {
              response = null;
            } else {
              rethrow;
            }
          }
        } else {
          if (isMockLogin) {
            response = null;
          } else {
            rethrow;
          }
        }
      } catch (e) {
        if (isMockLogin) {
          response = null;
        } else {
          rethrow;
        }
      }

      if (response != null) {
        _user = response.user;
        _session = response.session;
      } else if (isMockLogin) {
        // Fallback local User to guarantee entrance into dashboard
        _user = User(
          id: 'mock-${mockRole}-id',
          appMetadata: {},
          userMetadata: {
            'full_name': mockName,
            'role': mockRole,
          },
          aud: 'authenticated',
          email: targetEmail,
          createdAt: DateTime.now().toIso8601String(),
        );
        _session = null;
      } else {
        throw Exception('Authentication failed');
      }

      _isLoading = false;
      notifyListeners();
      return null;
    } on AuthException catch (e) {
      _isLoading = false;
      notifyListeners();
      return e.message;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return 'An unexpected error occurred.';
    }
  }

  /// Sign up with email + password + full name.
  Future<String?> signUp(String email, String password, String fullName) async {
    try {
      _isLoading = true;
      notifyListeners();

      await _client.auth.signUp(
        email: email.trim().toLowerCase(),
        password: password,
        data: {'full_name': fullName.trim()},
      );

      _isLoading = false;
      notifyListeners();
      return null;
    } on AuthException catch (e) {
      _isLoading = false;
      notifyListeners();
      return e.message;
    } catch (e) {
      _isLoading = false;
      notifyListeners();
      return 'An unexpected error occurred.';
    }
  }

  /// Sign out and clear all tokens.
  Future<void> signOut() async {
    await _client.auth.signOut();
    _user = null;
    _session = null;
    notifyListeners();
  }
}
