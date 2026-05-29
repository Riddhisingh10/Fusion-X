import 'dart:convert';
import 'package:crypto/crypto.dart';

class CryptoService {
  /// Computes HMAC-SHA256 of the user ID with a daily rotating salt
  /// as defined by the Connect & Prep secure feedback specifications.
  static String generateDailyHash(String userId, String dailySalt) {
    final todayStr = DateTime.now().toUtc().toString().substring(0, 10); // YYYY-MM-DD
    final key = utf8.encode(dailySalt);
    final bytes = utf8.encode('$userId-$todayStr');

    final hmacSha256 = Hmac(sha256, key);
    final digest = hmacSha256.convert(bytes);

    return digest.toString();
  }
}
