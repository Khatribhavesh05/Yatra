import 'package:flutter/material.dart';
import '../../../shared/widgets/empty_state_view.dart';

class TripScreen extends StatelessWidget {
  const TripScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Current Trip Log'),
      ),
      body: const EmptyStateView(
        icon: Icons.alt_route_outlined,
        title: 'Trip Management Unconfigured',
        description:
            'Server-side Trip Tracking API is not currently enabled on the backend. Active route and trip dispatch data will appear here once configured by the platform administrator.',
      ),
    );
  }
}
