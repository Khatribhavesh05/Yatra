import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/loading_view.dart';
import '../../../shared/widgets/error_state_view.dart';
import '../../../shared/widgets/empty_state_view.dart';
import '../../vehicle/providers/vehicle_provider.dart';
import '../providers/map_provider.dart';
import '../repositories/charging_repository.dart';

class MapScreen extends ConsumerWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeState = ref.watch(activeVehicleProvider);
    final vehicle = activeState.vehicle;
    final chargingCentersAsync = ref.watch(publicChargingCentersProvider);
    final trackAsync = ref.watch(activeVehicleTrackProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Navigation & Charging'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh Location & Chargers',
            onPressed: () {
              ref.invalidate(publicChargingCentersProvider);
              ref.invalidate(activeVehicleTrackProvider);
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Current Vehicle Location Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.my_location, color: AppColors.primaryLight, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              vehicle != null
                                  ? '${vehicle.vehicleCode.toUpperCase()} POSITION'
                                  : 'VEHICLE POSITION',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            vehicle?.operationalStatus ?? 'IDLE',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primaryLight,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Latitude', style: TextStyle(fontSize: 11, color: AppColors.offline)),
                              const SizedBox(height: 2),
                              Text(
                                vehicle?.latitude != null
                                    ? vehicle!.latitude!.toStringAsFixed(6)
                                    : '---.------',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Longitude', style: TextStyle(fontSize: 11, color: AppColors.offline)),
                              const SizedBox(height: 2),
                              Text(
                                vehicle?.longitude != null
                                    ? vehicle!.longitude!.toStringAsFixed(6)
                                    : '---.------',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 18),

            // 2. Recent Breadcrumbs / Track History
            const Text(
              'RECENT TELEMETRY BREADCRUMBS',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.8,
                color: AppColors.offline,
              ),
            ),
            const SizedBox(height: 8),
            trackAsync.when(
              data: (tracks) {
                if (tracks.isEmpty) {
                  return const Card(
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text(
                        'No recent waypoint history recorded for this vehicle.',
                        style: TextStyle(color: AppColors.offline, fontSize: 13),
                      ),
                    ),
                  );
                }

                return Card(
                  child: ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: tracks.take(5).length,
                    separatorBuilder: (_, __) => const Divider(color: AppColors.borderDark, height: 1),
                    itemBuilder: (context, index) {
                      final item = tracks[index];
                      final lat = (item['latitude'] as num?)?.toDouble() ?? 0.0;
                      final lng = (item['longitude'] as num?)?.toDouble() ?? 0.0;
                      final speed = (item['speed_kph'] as num?)?.toDouble() ?? 0.0;
                      final soc = (item['soc_pct'] as num?)?.toDouble() ?? 0.0;

                      return ListTile(
                        dense: true,
                        leading: const Icon(Icons.circle, size: 8, color: AppColors.primaryLight),
                        title: Text(
                          '${lat.toStringAsFixed(4)}, ${lng.toStringAsFixed(4)}',
                          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        subtitle: Text(
                          'Speed: ${speed.round()} km/h • SoC: ${soc.round()}%',
                          style: const TextStyle(color: AppColors.offline, fontSize: 11),
                        ),
                        trailing: Text(
                          item['observed_at'] != null
                              ? item['observed_at'].toString().split('T').last.substring(0, 8)
                              : '',
                          style: const TextStyle(color: AppColors.offline, fontSize: 11),
                        ),
                      );
                    },
                  ),
                );
              },
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(12.0),
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
              error: (e, _) => Card(
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Text('Track history error: $e', style: const TextStyle(color: AppColors.error, fontSize: 12)),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // 3. Government Verified Charging Hubs
            const Text(
              'VERIFIED GOVERNMENT EV CHARGING HUBS',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.8,
                color: AppColors.offline,
              ),
            ),
            const SizedBox(height: 8),
            chargingCentersAsync.when(
              data: (centers) {
                if (centers.isEmpty) {
                  return const EmptyStateView(
                    icon: Icons.ev_station_outlined,
                    title: 'No Charging Stations',
                    description: 'No verified charging stations found.',
                  );
                }

                return Column(
                  children: centers.map((center) => _ChargingCenterCard(center: center)).toList(),
                );
              },
              loading: () => const LoadingView(message: 'Locating charging hubs...'),
              error: (err, _) => ErrorStateView(
                message: err.toString(),
                onRetry: () => ref.invalidate(publicChargingCentersProvider),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChargingCenterCard extends StatelessWidget {
  final ChargingCenterModel center;

  const _ChargingCenterCard({required this.center});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    center.name,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
                if (center.powerKw != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.success.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.success.withOpacity(0.5)),
                    ),
                    child: Text(
                      '${center.powerKw!.round()} kW Fast Charger',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppColors.success,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Coordinates: ${center.latitude.toStringAsFixed(4)}, ${center.longitude.toStringAsFixed(4)}',
              style: const TextStyle(fontSize: 12, color: AppColors.offline),
            ),
            if (center.connectors != null && center.connectors!.isNotEmpty) ...[
              const SizedBox(height: 10),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: center.connectors!.entries.map((e) {
                  return Chip(
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    padding: EdgeInsets.zero,
                    labelPadding: const EdgeInsets.symmetric(horizontal: 8),
                    label: Text(
                      '${e.key}: ${e.value} Plugs',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                    backgroundColor: AppColors.cardDark,
                    side: const BorderSide(color: AppColors.borderDark),
                  );
                }).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
