import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/networking/dio_client.dart';
import '../../core/networking/api_endpoints.dart';

final offlineTelemetryQueueProvider = Provider<OfflineTelemetryQueue>((ref) {
  final dio = ref.watch(dioProvider);
  return OfflineTelemetryQueue(dio);
});

class OfflineTelemetryQueue {
  final Dio _dio;
  final List<Map<String, dynamic>> _queue = [];
  bool _isFlushing = false;

  OfflineTelemetryQueue(this._dio);

  int get queuedCount => _queue.length;

  Future<void> enqueue(Map<String, dynamic> payload) async {
    _queue.add(payload);
    await flush();
  }

  Future<void> flush() async {
    if (_isFlushing || _queue.isEmpty) return;
    _isFlushing = true;

    while (_queue.isNotEmpty) {
      final payload = _queue.first;
      try {
        final response = await _dio.post(
          ApiEndpoints.ingestTelemetry,
          data: payload,
        );

        if (response.statusCode == 200 || response.statusCode == 201) {
          _queue.removeAt(0); // Successfully ingested or duplicate accepted
        } else {
          break; // Stop flushing on server errors
        }
      } catch (_) {
        // Network offline, break and wait for next flush trigger
        break;
      }
    }

    _isFlushing = false;
  }
}
